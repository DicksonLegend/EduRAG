import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listDocuments } from '../api/documentApi';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { motion } from 'framer-motion';
import { UploadCloud, MessageSquareText, FileQuestion, BarChart3, FileText, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await listDocuments();
            setDocuments(res.data);
        } catch {
            // no docs yet
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status) => {
        const styles = {
            completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
            processing: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)] animate-pulse',
            pending: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
            failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
        };
        return (
            <span className={`text-xs font-medium px-3 py-1 rounded-full border backdrop-blur-md ${styles[status] || styles.pending}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#0A0F1C] text-slate-200 selection:bg-indigo-500/30">
            {/* Ambient Background Gradients */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] opacity-50 mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/20 rounded-full blur-[100px] opacity-30 mix-blend-screen pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-medium text-slate-300">System Online</span>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">{user?.full_name || user?.username}</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                        Your intelligent study workspace is ready. You have <strong className="text-white">{documents.length}</strong> active learning document{documents.length !== 1 ? 's' : ''}.
                    </p>
                </motion.div>

                {/* Quick Actions Bento Grid */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
                >
                    {[
                        { to: '/upload', icon: UploadCloud, color: 'from-blue-500 to-indigo-600', label: 'Upload PDF', desc: 'Add new study material to your knowledge base.' },
                        { to: '/ask', icon: MessageSquareText, color: 'from-purple-500 to-pink-600', label: 'Ask Question', desc: 'Query your documents and get AI-powered insights.' },
                        { to: '/mcq', icon: FileQuestion, color: 'from-emerald-500 to-teal-600', label: 'Generate MCQ', desc: 'Test your knowledge with auto-generated quizzes.' },
                        { to: '/analytics', icon: BarChart3, color: 'from-orange-500 to-red-600', label: 'Analytics', desc: 'Monitor your learning progress and test scores.' },
                    ].map((action, i) => (
                        <motion.div key={action.to} variants={itemVariants}>
                            <Link
                                to={action.to}
                                className="group relative block h-full overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.05] p-6 hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 mix-blend-overlay pointer-events-none" />
                                
                                <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br ${action.color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <action.icon className="text-white w-7 h-7" />
                                </div>
                                
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{action.label}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">{action.desc}</p>
                                
                                <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                    <div className={`p-2 rounded-full bg-gradient-to-r ${action.color} text-white`}>
                                        <ChevronRight size={16} strokeWidth={3} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Documents List */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-3xl bg-white/[0.02] border border-white/[0.05] overflow-hidden backdrop-blur-xl shadow-2xl relative"
                >
                    <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.05] bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                                <FileText size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Your Document Hub</h2>
                        </div>
                        <Link 
                            to="/upload" 
                            className="text-sm font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2"
                        >
                            <UploadCloud size={16} />
                            Upload New
                        </Link>
                    </div>

                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center">
                            <Spinner size="lg" />
                            <p className="mt-4 text-slate-400 font-medium animate-pulse">Loading workspace...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="w-24 h-24 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <FileText size={40} className="opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No documents yet</h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium">Your knowledge base is empty. Upload your first PDF to unlock AI-powered Q&A and personalized MCQs.</p>
                            <Link 
                                to="/upload" 
                                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full text-white font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-1 transition-all"
                            >
                                Get Started Now
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.05]">
                            {documents.map((doc) => (
                                <motion.div 
                                    key={doc.id}
                                    whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                                    className="p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors group"
                                >
                                    <div className="flex items-center gap-5 w-full sm:w-auto">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-base mb-1 group-hover:text-indigo-300 transition-colors line-clamp-1">{doc.filename}</p>
                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                                <span className="flex items-center gap-1"><FileText size={12}/> {doc.total_pages} pages</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                <span className="flex items-center gap-1"><CheckCircle2 size={12}/> {doc.total_chunks} chunks</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end gap-6 shrink-0">
                                        {statusBadge(doc.status)}
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                            <Clock size={14} className="text-slate-400" />
                                            {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
