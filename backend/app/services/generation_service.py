from __future__ import annotations

"""
LLM generation service using Mistral-7B-Instruct via llama-cpp-python.
Singleton pattern ensures the model is loaded only once.
Auto-downloads the GGUF model from HuggingFace if not present.
"""

import logging
import os
import sys
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

_llm = None


def _setup_cuda_dll_paths():
    """
    Add pip-installed NVIDIA CUDA DLL directories to PATH.
    Required when CUDA toolkit is not installed system-wide but
    nvidia-cuda-runtime-cu12 / nvidia-cublas-cu12 are pip-installed.
    """
    site_packages = Path(sys.executable).parent / '..' / 'Lib' / 'site-packages'
    nvidia_dir = site_packages / 'nvidia'
    if not nvidia_dir.is_dir():
        return

    for dll_file in nvidia_dir.rglob('*.dll'):
        dll_dir = str(dll_file.parent)
        if dll_dir not in os.environ.get('PATH', ''):
            os.environ['PATH'] = dll_dir + os.pathsep + os.environ.get('PATH', '')
            if hasattr(os, 'add_dll_directory'):
                try:
                    os.add_dll_directory(dll_dir)
                except OSError:
                    pass
            logger.debug(f"Added CUDA DLL path: {dll_dir}")


# Run once at import time so CUDA DLLs are available before llama_cpp loads
_setup_cuda_dll_paths()


def _download_model_if_missing(model_path: str, repo_id: str, filename: str) -> str:
    """
    Check if the GGUF model file exists. If not, download it from HuggingFace.
    Returns the final path to the model file.
    """
    model_file = Path(model_path)

    if model_file.exists():
        logger.info(f"LLM model found at: {model_path}")
        return model_path

    logger.info(f"LLM model not found at: {model_path}")
    logger.info(f"Downloading '{filename}' from '{repo_id}'...")
    logger.info("This is a one-time download (~4.4 GB). Please wait...")

    try:
        from huggingface_hub import hf_hub_download

        # Download directly to the models directory
        download_dir = model_file.parent
        download_dir.mkdir(parents=True, exist_ok=True)

        downloaded_path = hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            local_dir=str(download_dir),
            local_dir_use_symlinks=False,
        )

        logger.info(f"LLM model downloaded successfully to: {downloaded_path}")
        return downloaded_path

    except ImportError:
        logger.error(
            "huggingface_hub is not installed. Install it with: "
            "pip install huggingface-hub"
        )
        raise RuntimeError(
            f"Model file not found at {model_path} and huggingface_hub "
            "is not installed for auto-download. Install it with: "
            "pip install huggingface-hub"
        )
    except Exception as e:
        logger.error(f"Failed to download model: {e}")
        raise RuntimeError(
            f"Failed to download model from {repo_id}. "
            f"Error: {e}. You can manually download '{filename}' from "
            f"https://huggingface.co/{repo_id} and place it at {model_path}"
        )


def _get_llm():
    """Lazy-load the LLM (singleton). Auto-downloads if missing."""
    global _llm
    if _llm is None:
        import gc

        # Re-run CUDA DLL setup right before import (belt-and-suspenders)
        _setup_cuda_dll_paths()

        from llama_cpp import Llama
        import llama_cpp
        from app.config import settings

        # Log GPU support status
        if hasattr(llama_cpp, 'llama_supports_gpu_offload'):
            gpu_supported = llama_cpp.llama_supports_gpu_offload()
            logger.info(f"llama_cpp GPU offload supported: {gpu_supported}")
        else:
            logger.warning("llama_cpp.llama_supports_gpu_offload not found")

        # Auto-download model if not present
        model_path = _download_model_if_missing(
            model_path=settings.LLM_MODEL_PATH,
            repo_id=settings.LLM_MODEL_REPO,
            filename=settings.LLM_MODEL_FILENAME,
        )

        # Ensure absolute path
        model_path = str(Path(model_path).resolve())
        logger.info(f"Loading LLM from: {model_path}")
        logger.info(f"Requested GPU layers: {settings.LLM_GPU_LAYERS}")

        try:
            _llm = Llama(
                model_path=model_path,
                n_ctx=settings.LLM_CONTEXT_LENGTH,
                n_gpu_layers=settings.LLM_GPU_LAYERS,
                n_threads=settings.LLM_THREADS,
                verbose=True,  # Force verbose to see GPU allocation status
            )
            logger.info(f"LLM loaded successfully (GPU layers: {settings.LLM_GPU_LAYERS}).")
        except Exception as gpu_err:
            logger.warning(f"GPU loading failed: {gpu_err}")
            logger.info("Falling back to CPU-only mode...")
            # Free any partially allocated memory
            gc.collect()
            _llm = Llama(
                model_path=model_path,
                n_ctx=2048,
                n_gpu_layers=0,
                n_threads=settings.LLM_THREADS,
                verbose=True,
            )
            logger.info("LLM loaded successfully (CPU-only mode).")
    return _llm


class GenerationService:
    """
    Interfaces with the Mistral-7B-Instruct model via llama-cpp-python
    for text generation.
    """

    def __init__(self):
        self.llm = _get_llm()
        from app.config import settings
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.temperature = settings.LLM_TEMPERATURE
        self.top_p = settings.LLM_TOP_P

    def generate(
        self,
        prompt: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        stop: Optional[list[str]] = None,
    ) -> str:
        """
        Generate text from the LLM given a formatted prompt.

        Args:
            prompt: Full formatted prompt (including [INST] tags for Mistral).
            max_tokens: Override default max tokens.
            temperature: Override default temperature.
            top_p: Override default top_p.
            stop: Optional stop sequences.

        Returns:
            Generated text string.
        """
        output = self.llm(
            prompt,
            max_tokens=max_tokens or self.max_tokens,
            temperature=temperature or self.temperature,
            top_p=top_p or self.top_p,
            stop=stop or ["[INST]", "</s>"],
            echo=False,
        )

        generated_text = output["choices"][0]["text"].strip()
        logger.info(
            f"Generated {len(generated_text)} chars "
            f"(tokens used: {output.get('usage', {}).get('total_tokens', 'N/A')})"
        )
        return generated_text

    def generate_structured(
        self,
        prompt: str,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Generate text expecting structured JSON output.
        Uses lower temperature for more deterministic results.
        """
        return self.generate(
            prompt=prompt,
            max_tokens=max_tokens or self.max_tokens,
            temperature=0.1,  # Low temperature for structured output
            top_p=0.9,
        )


# ── Singleton ────────────────────────────────────────────────────
_generation_service: Optional[GenerationService] = None


def get_generation_service() -> GenerationService:
    """Get or create the singleton GenerationService."""
    global _generation_service
    if _generation_service is None:
        _generation_service = GenerationService()
    return _generation_service
