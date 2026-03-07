import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument, getDocumentStatus } from '../api/documentApi';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileType, CheckCircle, AlertCircle, Loader2, ArrowRight, MessageSquareText, FileQuestion } from 'lucide-react';

export default function Upload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [docStatus, setDocStatus] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const navigate = useNavigate();

    const startPolling = useCallback((documentId) => {
        if (pollIntervalRef.current) return;

        pollIntervalRef.current = setInterval(async () => {
            try {
                const res = await getDocumentStatus(documentId);
                setDocStatus(res.data);

                if (res.data.status === 'completed' || res.data.status === 'failed') {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                }
            } catch {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        }, 3000);
    }, []);

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
            toast.error('Only PDF files are allowed', {
                style: { background: '#334155', color: '#fff', border: '1px solid #475569' }
            });
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const res = await uploadDocument(file);
            setUploadResult(res.data);
            setDocStatus({ status: res.data.status });
            toast.success('Document uploaded! Processing initiated...', {
                icon: '🚀',
                style: { background: '#0A0F1C', color: '#A78BFA', border: '1px solid #8B5CF6' }
            });
            startPolling(res.data.id);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Upload failed', {
                 style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' }
            });
        } finally {
            setUploading(false);
        }
    };

    const getStatusUI = (status) => {
        const uiMap = {
            pending: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10', title: 'Queued', desc: 'Waiting in line for processing...', spin: true },
            processing: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-400/10', title: 'Analyzing Document', desc: 'AI is reading and vectorizing the content...', spin: true },
            completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', title: 'Processing Complete', desc: 'Document is ready for Q&A and MCQ generation!', spin: false },
            failed: { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10', title: 'Analysis Failed', desc: 'There was an error parsing the PDF.', spin: false },
        };
        return uiMap[status] || uiMap.pending;
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#0A0F1C] overflow-hidden p-6 selection:bg-indigo-500/30">
            {/* Ambient Background */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full max-w-2xl bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-5">
                        <UploadCloud size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-3 tracking-tight">Upload Document</h1>
                    <p className="text-slate-400 text-lg">Add educational materials to your intelligent knowledge base.</p>
                </div>

                <AnimatePresence mode="wait">
                    {!uploadResult ? (
                        <motion.div
                            key="upload-zone"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 p-12 text-center
                                    ${dragActive 
                                        ? 'border-indigo-500 bg-indigo-500/10' 
                                        : file 
                                            ? 'border-emerald-500/50 bg-emerald-500/5' 
                                            : 'border-white/10 bg-white/[0.01] hover:border-indigo-500/50 hover:bg-white/[0.03]'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                
                                {file ? (
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                            <FileType size={40} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-emerald-400 line-clamp-1 px-8">{file.name}</p>
                                            <p className="text-slate-400 font-medium mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">Click to select a different file</p>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors duration-300 ${dragActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10'}`}>
                                            <UploadCloud size={40} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                                                {dragActive ? "Drop PDF here..." : "Drag & drop your PDF"}
                                            </p>
                                            <p className="text-slate-400 font-medium mt-2">or click to browse from your computer</p>
                                        </div>
                                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-400">
                                            Max 100 MB • PDF format only
                                        </div>
                                    </div>
                                )}
                            </div>

                            <motion.button
                                whileHover={file ? { scale: 1.02 } : {}}
                                whileTap={file ? { scale: 0.98 } : {}}
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className={`w-full mt-6 py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl
                                    ${!file 
                                        ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' 
                                        : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/25 border border-indigo-500/50 hover:shadow-indigo-500/40'
                                    }`}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin text-white flex-shrink-0" />
                                        <span>Allocating Resources...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Upload & Analyze</span>
                                        <ArrowRight size={20} className="opacity-70" />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="status-zone"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center backdrop-blur-md"
                        >
                            {(() => {
                                const currentStatus = docStatus?.status || 'pending';
                                const ui = getStatusUI(currentStatus);
                                const Icon = ui.icon;
                                
                                return (
                                    <>
                                        <div className={`w-28 h-28 rounded-full ${ui.bg} ${ui.color} flex items-center justify-center mb-8 border border-current/20 shadow-[-0_0_30px_currentColor]/10 relative`}>
                                            <Icon size={56} className={ui.spin ? 'animate-spin' : ''} />
                                            {ui.spin && (
                                                <svg className="absolute inset-0 w-full h-full text-current/30 animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="150" />
                                                </svg>
                                            )}
                                        </div>
                                        <h2 className="text-3xl font-bold text-white mb-3">{ui.title}</h2>
                                        <p className="text-slate-400 text-base mb-8 max-w-sm leading-relaxed">{ui.desc}</p>
                                        
                                        {currentStatus === 'completed' && (
                                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                                <button
                                                    onClick={() => navigate('/ask')}
                                                    className="px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold rounded-xl border border-indigo-500/20 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <MessageSquareText size={18} /> Ask Questions
                                                </button>
                                                <button
                                                    onClick={() => navigate('/mcq')}
                                                    className="px-6 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-bold rounded-xl border border-cyan-500/20 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <FileQuestion size={18} /> Generate MCQs
                                                </button>
                                            </div>
                                        )}
                                        
                                        {currentStatus === 'failed' && (
                                            <button
                                                onClick={() => {
                                                    setUploadResult(null);
                                                    setFile(null);
                                                }}
                                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        )}
                                    </>
                                );
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}