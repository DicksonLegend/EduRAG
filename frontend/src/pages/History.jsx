import { useState, useEffect } from 'react';
import { getQuestionHistory, getMCQHistory } from '../api/historyApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ListChecks, CalendarDays, BrainCircuit, Target, ShieldCheck, HelpCircle, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function History() {
    const [activeTab, setActiveTab] = useState('qa');
    const [qaHistory, setQaHistory] = useState([]);
    const [mcqHistory, setMcqHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getQuestionHistory().then((r) => setQaHistory(r.data)),
            getMCQHistory().then((r) => setMcqHistory(r.data)),
        ])
            .catch(() => toast.error('Failed to load history', { style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' } }))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            + ' • ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const tabClass = (tab) =>
        `flex-1 py-4 px-6 rounded-2xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
            activeTab === tab
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02] border-transparent'
        }`;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] bg-[#0A0F1C] overflow-hidden p-6 sm:p-10 selection:bg-purple-500/30">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            <div className="relative max-w-5xl mx-auto z-10">
                {/* Header */}
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                        <CalendarDays size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 tracking-tight">Learning History</h1>
                        <p className="text-slate-400 text-lg font-medium mt-1">Review your past Q&A and assessment attempts.</p>
                    </div>
                </div>

                {/* Cyberpunk Tabs */}
                <div className="bg-[#111827] border border-white/10 rounded-3xl p-2 flex gap-2 mb-10 relative z-20 shadow-2xl">
                    <button className={tabClass('qa')} onClick={() => setActiveTab('qa')}>
                        {activeTab === 'qa' && (
                            <motion.div layoutId="tab-bg" className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/25 border border-purple-500/50" style={{ borderRadius: '1rem' }} />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <MessageSquare size={20} /> Q&A Ledger ({qaHistory.length})
                        </span>
                    </button>
                    <button className={tabClass('mcq')} onClick={() => setActiveTab('mcq')}>
                        {activeTab === 'mcq' && (
                            <motion.div layoutId="tab-bg" className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/25 border border-purple-500/50" style={{ borderRadius: '1rem' }} />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <ListChecks size={20} /> Assessment Log ({mcqHistory.length})
                        </span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                            <Search size={40} className="mb-4 text-purple-400/50" />
                        </motion.div>
                        <p className="text-lg font-bold">Decoding archives...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {/* Q&A TAB */}
                        {activeTab === 'qa' && (
                            <motion.div 
                                key="qa-tab" 
                                variants={containerVariants} 
                                initial="hidden" 
                                animate="show" 
                                exit="hidden"
                                className="space-y-6"
                            >
                                {qaHistory.length === 0 ? (
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-16 text-center backdrop-blur-xl">
                                        <MessageSquare size={48} className="mx-auto text-slate-600 mb-4" />
                                        <p className="text-xl font-bold text-slate-300">No Inquiries Found</p>
                                        <p className="text-slate-500 mt-2 text-lg">Ask your first intelligent question to populate the ledger.</p>
                                    </div>
                                ) : (
                                    qaHistory.map((item) => (
                                        <motion.div variants={itemVariants} key={item.id} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-purple-500/20 transition-all duration-300 group">
                                            {/* Meta Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                                    <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                        {item.mode}
                                                    </span>
                                                    {item.marks && (
                                                        <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                                                            <Target size={12} /> {item.marks} PTS
                                                        </span>
                                                    )}
                                                    {item.confidence_score != null && (
                                                        <span className={`px-3 py-1.5 rounded-lg border flex items-center gap-1
                                                            ${item.confidence_score >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                              item.confidence_score >= 40 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                                              'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                            <ShieldCheck size={12} /> {item.confidence_score.toFixed(0)}% CONF
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                                    <CalendarDays size={14} /> {formatDate(item.created_at)}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="space-y-4">
                                                <div className="flex gap-3">
                                                    <HelpCircle size={20} className="text-purple-400 shrink-0 mt-0.5" />
                                                    <p className="text-lg font-bold text-slate-200">{item.question}</p>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 to-transparent" />
                                                    <div className="pl-8">
                                                        <div className="bg-[#111827] rounded-2xl p-5 border border-white/5 group-hover:border-purple-500/10 transition-colors">
                                                            <p className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {/* MCQ TAB */}
                        {activeTab === 'mcq' && (
                            <motion.div 
                                key="mcq-tab" 
                                variants={containerVariants} 
                                initial="hidden" 
                                animate="show" 
                                exit="hidden"
                                className="space-y-6"
                            >
                                {mcqHistory.length === 0 ? (
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-16 text-center backdrop-blur-xl">
                                        <ListChecks size={48} className="mx-auto text-slate-600 mb-4" />
                                        <p className="text-xl font-bold text-slate-300">No Assessment History</p>
                                        <p className="text-slate-500 mt-2 text-lg">Generate and take Practice tests to track progress here.</p>
                                    </div>
                                ) : (
                                    mcqHistory.map((item) => (
                                        <motion.div variants={itemVariants} key={item.id} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-blue-500/20 transition-all duration-300">
                                            {/* Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                                    <span className={`px-3 py-1.5 rounded-lg border flex items-center gap-1
                                                        ${item.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                                                          item.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                        {item.difficulty}
                                                    </span>
                                                    {item.topic && (
                                                        <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 truncate max-w-[150px]">
                                                            {item.topic}
                                                        </span>
                                                    )}
                                                    {item.is_correct != null ? (
                                                        <span className={`px-3 py-1.5 rounded-lg border flex items-center gap-1
                                                            ${item.is_correct ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                            {item.is_correct ? <CheckCircle2 size={12} /> : <XCircle size={12} />} 
                                                            {item.is_correct ? 'CORRECT' : 'INCORRECT'}
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1.5 rounded-lg bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                                            UNANSWERED
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                                    <CalendarDays size={14} /> {formatDate(item.created_at)}
                                                </span>
                                            </div>

                                            {/* Question */}
                                            <div className="flex gap-3 mb-6">
                                                <BrainCircuit size={20} className="text-blue-400 shrink-0 mt-0.5" />
                                                <p className="text-lg font-bold text-slate-200">{item.question}</p>
                                            </div>

                                            {/* Options Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                                                {Object.entries(item.options).map(([label, text]) => {
                                                    const isCorrect = label === item.correct_answer;
                                                    const isSelected = label === item.selected_answer;
                                                    
                                                    let optClass = 'p-4 rounded-xl border-2 transition-colors flex justify-between items-center ';
                                                    if (isSelected && isCorrect) {
                                                        optClass += 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200';
                                                    } else if (isSelected && !isCorrect) {
                                                        optClass += 'bg-rose-500/10 border-rose-500/50 text-rose-200';
                                                    } else if (isCorrect) {
                                                        optClass += 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300 border-dashed';
                                                    } else {
                                                        optClass += 'bg-white/5 border-white/5 text-slate-400';
                                                    }

                                                    return (
                                                        <div key={label} className={optClass}>
                                                            <span><strong className="mr-2 opacity-75">{label}.</strong> {text}</span>
                                                            {isCorrect && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                                                            {isSelected && !isCorrect && <XCircle size={18} className="text-rose-400 shrink-0" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Footer Answer Summary */}
                                            {item.selected_answer && (
                                                <div className="mt-6 pt-4 border-t border-white/5 pl-8 flex gap-6 text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500">Your Selection:</span> 
                                                        <span className="px-2 py-1 rounded bg-white/5 text-slate-300">{item.selected_answer}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500">Correct Answer:</span> 
                                                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{item.correct_answer}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
