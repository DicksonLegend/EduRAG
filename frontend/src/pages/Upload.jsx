import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument, getDocumentStatus } from '../api/documentApi';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

export default function Upload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [docStatus, setDocStatus] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    // Ref to track polling interval — prevents duplicate intervals and enables cleanup
    const pollIntervalRef = useRef(null);
    const navigate = useNavigate();

    // Safe polling: stores interval ID in ref, clears on completion/unmount
    const startPolling = useCallback((documentId) => {
        // Guard: don't start a second interval if one is already running
        if (pollIntervalRef.current) return;

        pollIntervalRef.current = setInterval(async () => {
            try {
                const res = await getDocumentStatus(documentId);
                setDocStatus(res.data);

                // Stop polling once document reaches a terminal state
                if (res.data.status === 'completed' || res.data.status === 'failed') {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                }
            } catch {
                // Stop polling on error to prevent runaway requests
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        }, 3000);
    }, []);

    // Cleanup: clear interval on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, []);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === 'application/pdf') {
            setFile(droppedFile);
        } else {
            toast.error('Only PDF files are allowed');
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return toast.error('Please select a file');
        setUploading(true);
        try {
            // Use centralized upload function
            const res = await uploadDocument(file);
            setUploadResult(res.data);
            setDocStatus({ status: res.data.status });
            toast.success('Document uploaded! Processing...');
            // Start safe polling for status updates
            startPolling(res.data.id);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const statusInfo = {
        pending: { color: 'text-blue-400', icon: '⏳', label: 'Pending...' },
        processing: { color: 'text-yellow-400', icon: '⚙️', label: 'Processing...' },
        completed: { color: 'text-emerald-400', icon: '✅', label: 'Ready!' },
        failed: { color: 'text-red-400', icon: '❌', label: 'Failed' },
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">Upload Document</h1>
            <p className="text-[var(--color-text-muted)] mb-8">Upload a PDF to start learning with AI</p>

            {!uploadResult ? (
                <>
                    {/* Drop Zone */}
                    <div
                        className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 ${dragActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : ''
                            }`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <div className="text-5xl mb-4">{file ? '📄' : '📤'}</div>
                        {file ? (
                            <div>
                                <p className="font-semibold">{file.name}</p>
                                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="font-medium">Drop your PDF here or click to browse</p>
                                <p className="text-sm text-[var(--color-text-muted)] mt-1">Max 100 MB · PDF only</p>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="w-full mt-5 py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {uploading ? <><Spinner size="sm" /> Uploading...</> : 'Upload & Process'}
                    </button>
                </>
            ) : (
                /* Upload Status */
                <div className="glass-card p-8 text-center">
                    <div className="text-5xl mb-4">{statusInfo[docStatus?.status]?.icon || '⏳'}</div>
                    <h2 className={`text-xl font-bold ${statusInfo[docStatus?.status]?.color}`}>
                        {statusInfo[docStatus?.status]?.label}
                    </h2>
                    <p className="text-[var(--color-text-muted)] mt-2">{uploadResult.filename}</p>

                    {docStatus?.status === 'completed' && (
                        <div className="mt-6 space-y-3">
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {docStatus.total_pages} pages · {docStatus.total_chunks} chunks indexed
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => navigate('/ask')}
                                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all"
                                >
                                    Ask Questions
                                </button>
                                <button
                                    onClick={() => navigate('/mcq')}
                                    className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-elevated)]/50 transition-all"
                                >
                                    Generate MCQs
                                </button>
                            </div>
                        </div>
                    )}

                    {docStatus?.status !== 'completed' && docStatus?.status !== 'failed' && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-[var(--color-text-muted)]">
                            <Spinner size="sm" />
                            <span className="text-sm">Extracting text, chunking, and embedding...</span>
                        </div>
                    )}

                    {docStatus?.status === 'failed' && (
                        <button
                            onClick={() => { setUploadResult(null); setDocStatus(null); setFile(null); }}
                            className="mt-4 text-sm text-[var(--color-primary-light)] hover:underline"
                        >
                            Try again
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
