import { useState, useEffect, useRef } from 'react';
import { listDocuments } from '../api/documentApi';
import { askQuestion } from '../api/queryApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, BookOpen, Layers, Target, ChevronDown, Check, Sparkles, MessageSquare, Loader2, ArrowRight, ShieldCheck, ChevronRight, FileText } from 'lucide-react';

export default function AskQuestion() {
    const [documents, setDocuments] = useState([]);
    const [form, setForm] = useState({
        document_ids: [],
        question: '',
        mode: 'detailed',
        marks: '',
    });
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState(null);
    const [sourcesOpen, setSourcesOpen] = useState(false);
    const [docDropdownOpen, setDocDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        listDocuments()
            .then((res) => {
                const ready = res.data.filter((d) => d.status === 'completed');
                setDocuments(ready);
                if (ready.length > 0) setForm((f) => ({ ...f, document_ids: [ready[0].id] }));
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDocDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const toggleDocument = (docId) => {
        setForm((f) => {
            const ids = f.document_ids.includes(docId)
                ? f.document_ids.filter((id) => id !== docId)
                : [...f.document_ids, docId];
            return { ...f, document_ids: ids };
        });
    };

    const toggleAll = () => {
        setForm((f) => {
            const allSelected = f.document_ids.length === documents.length;
            return { ...f, document_ids: allSelected ? [] : documents.map((d) => d.id) };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.document_ids.length === 0) {
            toast.error('Select at least one document', {
                style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' }
            });
            return;
        }
        if (!form.question.trim()) {
            toast.error('Enter a question', {
                style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' }
            });
            return;
        }
        setLoading(true);
        setAnswer(null);
        try {
            const payload = {
                document_ids: form.document_ids,
                question: form.question.trim(),
                mode: form.mode,
            };
            if (form.marks) payload.marks = Number(form.marks);
            const res = await askQuestion(payload);
            setAnswer(res.data);
            
            // Scroll to answer safely
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to get answer', {
                style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' }
            });
        } finally {
            setLoading(false);
        }
    };

    const confidenceUI = (score) => {
        if (score >= 70) return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: ShieldCheck };
        if (score >= 40) return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Target };
        return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: BrainCircuit };
    };

    const inputClasses = "w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-slate-200 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.02] transition-all placeholder:text-slate-600 font-medium";

    const selectedDocNames = documents
        .filter((d) => form.document_ids.includes(d.id))
        .map((d) => d.filename);

    return (
        <div className="relative min-h-[calc(100vh-64px)] bg-[#0A0F1C] overflow-hidden p-6 sm:p-10 selection:bg-indigo-500/30">
            {/* Ambient Multi-Gradients */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            <div className="relative max-w-4xl mx-auto z-10">
                
                {/* Header Profile */}
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                        <BrainCircuit size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">Ask Questions</h1>
                        <p className="text-slate-400 text-lg font-medium mt-1">Chat with your documents using advanced AI retrieval.</p>
                    </div>
                </div>

                {/* Form Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-xl shadow-2xl mb-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Source Docs Selector */}
                        <div ref={dropdownRef} className="relative z-20">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                                <BookOpen size={16} className="text-indigo-400" /> Source Documents
                                {form.document_ids.length > 1 && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">multi-doc mode</span>}
                            </label>
                            
                            <div 
                                onClick={() => setDocDropdownOpen(!docDropdownOpen)}
                                className={`cursor-pointer flex items-center justify-between ${inputClasses} ${docDropdownOpen ? 'border-indigo-500/50 bg-indigo-500/5' : ''}`}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Layers size={18} className={form.document_ids.length > 0 ? 'text-indigo-400' : 'text-slate-500'} />
                                    <span className={`truncate ${form.document_ids.length === 0 ? 'text-slate-500' : 'text-slate-200'}`}>
                                        {form.document_ids.length === 0 ? 'Select knowledge base...' : 
                                         form.document_ids.length === 1 ? selectedDocNames[0] : 
                                         `${form.document_ids.length} documents selected`}
                                    </span>
                                </div>
                                <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${docDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                            </div>

                            <AnimatePresence>
                                {docDropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5"
                                    >
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                            {documents.length > 0 && (
                                                <div 
                                                    onClick={toggleAll}
                                                    className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/5 border-b border-white/5 transition-colors"
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${form.document_ids.length === documents.length ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 bg-transparent'}`}>
                                                        {form.document_ids.length === documents.length && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <span className="font-semibold text-slate-200">Select All Knowledge</span>
                                                </div>
                                            )}
                                            {documents.map((d) => (
                                                <div 
                                                    key={d.id}
                                                    onClick={() => toggleDocument(d.id)}
                                                    className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${form.document_ids.includes(d.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 bg-transparent'}`}>
                                                        {form.document_ids.includes(d.id) && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <FileText size={16} className="text-slate-500" />
                                                    <span className="text-sm text-slate-300 truncate">{d.filename}</span>
                                                </div>
                                            ))}
                                            {documents.length === 0 && (
                                                <div className="px-5 py-6 text-center">
                                                    <BookOpen size={24} className="mx-auto text-slate-600 mb-2" />
                                                    <p className="text-sm font-medium text-slate-400">No documents available.</p>
                                                    <p className="text-xs text-slate-500 mt-1">Upload a PDF first to ask questions.</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Settings Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                                    <Sparkles size={16} className="text-cyan-400" /> Intelligence Mode
                                </label>
                                <div className="relative">
                                    <select 
                                        value={form.mode} 
                                        onChange={(e) => setForm({ ...form, mode: e.target.value })} 
                                        className={`${inputClasses} appearance-none cursor-pointer pr-10`}
                                    >
                                        <option value="detailed" className="bg-[#111827]">Detailed Analysis</option>
                                        <option value="beginner" className="bg-[#111827]">Explain to Beginner (ELI5)</option>
                                        <option value="exam" className="bg-[#111827]">Exam Focused Style</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                                    <Target size={16} className="text-emerald-400" /> Output Weighting
                                </label>
                                <div className="relative">
                                    <select 
                                        value={form.marks} 
                                        onChange={(e) => setForm({ ...form, marks: e.target.value })} 
                                        className={`${inputClasses} appearance-none cursor-pointer pr-10`}
                                    >
                                        <option value="" className="bg-[#111827]">Auto Length (Recommended)</option>
                                        <option value="2" className="bg-[#111827]">Short (2 Marks)</option>
                                        <option value="3" className="bg-[#111827]">Medium (3 Marks)</option>
                                        <option value="5" className="bg-[#111827]">Long (5 Marks)</option>
                                        <option value="10" className="bg-[#111827]">Comprehensive (10 Marks)</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Question Input */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                                <MessageSquare size={16} className="text-indigo-400" /> Your Inquiry
                            </label>
                            <textarea
                                value={form.question}
                                onChange={(e) => setForm({ ...form, question: e.target.value })}
                                placeholder="E.g., Summarize the economic impacts mentioned in the second chapter..."
                                rows={4}
                                className={`${inputClasses} resize-none`}
                            />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading || documents.length === 0}
                            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg
                                ${loading || documents.length === 0
                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' 
                                    : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/25 border border-indigo-500/50 hover:shadow-cyan-500/40'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin text-white" />
                                    <span>Synthesizing Answer...</span>
                                </>
                            ) : (
                                <>
                                    <span>Generate Intelligence</span>
                                    <ArrowRight size={20} className="opacity-70" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Answer Display */}
                <AnimatePresence>
                    {answer && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-indigo-500/[0.05] to-cyan-500/[0.05] border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(99,102,241,0.05)]"
                        >
                            {/* Answer Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <Sparkles size={20} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-200">AI Synthesis</h3>
                                        <p className="text-sm text-slate-500 font-medium">Generated via Mistral-7b</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {answer.marks && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-sm font-semibold border border-white/10">
                                            <Target size={14} /> {answer.marks} Marks
                                        </span>
                                    )}
                                    {(() => {
                                        const c = confidenceUI(answer.confidence_score);
                                        const CIcon = c.icon;
                                        return (
                                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border backdrop-blur-md ${c.bg} ${c.color} ${c.border}`}>
                                                <CIcon size={14} /> {answer.confidence_score.toFixed(1)}% Confidence
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* The Output */}
                            <div className="prose prose-invert prose-indigo max-w-none">
                                <div className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                    {answer.answer}
                                </div>
                            </div>

                            {/* Citations/Sources */}
                            {answer.source_pages?.length > 0 && (
                                <div className="mt-10 pt-8 border-t border-white/5">
                                    <button
                                        onClick={() => setSourcesOpen(!sourcesOpen)}
                                        className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors font-semibold select-none group"
                                    >
                                        <div className="w-6 h-6 rounded flex items-center justify-center bg-white/5 group-hover:bg-indigo-500/10 transition-colors">
                                            <ChevronRight size={16} className={`transition-transform duration-300 ${sourcesOpen ? 'rotate-90' : ''}`} />
                                        </div>
                                        <BookOpen size={16} /> 
                                        Citations & References ({answer.source_pages.length})
                                    </button>
                                    
                                    <AnimatePresence>
                                        {sourcesOpen && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden mt-4 space-y-3"
                                            >
                                                {answer.source_pages.map((src, i) => (
                                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-indigo-500/20 transition-colors">
                                                        <div className="shrink-0 pt-1">
                                                            <div className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold font-mono text-center min-w-[3rem]">
                                                                Pg {src.page_number}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-400 leading-relaxed font-mono">"{src.chunk_preview}..."</p>
                                                        <div className="shrink-0 flex items-start">
                                                            <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                                                {src.relevance_score.toFixed(0)}% Rel
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

