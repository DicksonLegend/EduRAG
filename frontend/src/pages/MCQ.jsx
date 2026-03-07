import { useState, useEffect, useRef } from 'react';
import { listDocuments } from '../api/documentApi';
import { generateMCQs, submitMCQAnswers } from '../api/mcqApi';
import toast from 'react-hot-toast';
import MCQCard from '../components/MCQCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, BookOpen, Layers, CheckCircle2, FlaskConical, PenTool, RefreshCw, Send, Loader2, Play, ChevronDown, ListChecks } from 'lucide-react';

const CustomSelect = ({ value, options, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white/[0.03] border ${isOpen ? 'border-cyan-500/50 bg-cyan-500/[0.02] shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.04]'} rounded-xl px-5 py-4 text-left text-slate-200 outline-none transition-all font-medium flex justify-between items-center`}
            >
                <span className="truncate pr-4 select-none">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-2 bg-[#0B1221]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] py-2 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-5 py-3 hover:bg-white/5 transition-colors flex items-center justify-between group
                                    ${String(value) === String(option.value) ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-slate-300'}
                                `}
                            >
                                <span className="truncate group-hover:pl-1 transition-all duration-200">{option.label}</span>
                                {String(value) === String(option.value) && <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function MCQ() {
    const [documents, setDocuments] = useState([]);
    const [form, setForm] = useState({ document_id: '', count: 5, mode: 'study', difficulty: 'medium' });
    const [loading, setLoading] = useState(false);
    const [mcqData, setMcqData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    const [studyQuestions, setStudyQuestions] = useState(null);
    const [isPracticeFromStudy, setIsPracticeFromStudy] = useState(false);

    useEffect(() => {
        listDocuments()
            .then((res) => {
                const ready = res.data.filter((d) => d.status === 'completed');
                setDocuments(ready);
                if (ready.length > 0) setForm((f) => ({ ...f, document_id: ready[0].id }));
            })
            .catch(() => { });
    }, []);

    const handleGenerate = async () => {
        if (!form.document_id) {
            toast.error('Select a document', {
                style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' }
            });
            return;
        }
        setLoading(true);
        setMcqData(null);
        setAnswers({});
        setSubmitted(false);
        setResult(null);
        setStudyQuestions(null);
        setIsPracticeFromStudy(false);
        try {
            const res = await generateMCQs({
                document_id: Number(form.document_id),
                count: Number(form.count),
                mode: form.mode,
                difficulty: form.difficulty,
            });
            setMcqData(res.data);
            if (form.mode === 'study' && res.data.questions.length > 0) {
                setStudyQuestions(res.data.questions);
            }
            if (res.data.questions.length === 0) {
                toast.error('No MCQs could be generated. Try a different document.', {
                     style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' }
                });
            }
        } catch (err) {
            const isTimeout = err.code === 'ECONNABORTED';
            toast.error(isTimeout ? 'MCQ generation timed out. The LLM is still processing.' : (err.response?.data?.detail || 'MCQ generation failed'), {
                 style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' }
            });
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSelect = (questionId, label) => {
        setAnswers((prev) => ({ ...prev, [questionId]: label }));
    };

    const handleSubmit = async () => {
        if (!mcqData) return;
        const unanswered = mcqData.questions.filter((q) => !answers[q.id]);
        if (unanswered.length > 0) {
            toast.error(`Please answer all questions (${unanswered.length} remaining)`, {
                 style: { background: '#0A0F1C', color: '#FCD34D', border: '1px solid #F59E0B' }
            });
            return;
        }

        if (mcqData.mode === 'practice' && mcqData.attempt_id) {
            try {
                const res = await submitMCQAnswers({
                    attempt_id: mcqData.attempt_id,
                    answers: Object.entries(answers).map(([qId, ans]) => ({
                        question_id: Number(qId),
                        selected_answer: ans,
                    })),
                });
                setResult(res.data);
                const updatedQuestions = mcqData.questions.map((q) => {
                    const r = res.data.results.find((r) => r.id === q.id);
                    return r ? { ...q, correct_answer: r.correct_answer, explanation: r.explanation } : q;
                });
                setMcqData({ ...mcqData, questions: updatedQuestions });
            } catch (err) {
                toast.error('Submission failed');
                return;
            }
        } else {
            const sourceQuestions = isPracticeFromStudy ? studyQuestions : mcqData.questions;
            const correct = sourceQuestions.filter((q) => answers[q.id] === q.correct_answer).length;
            setResult({
                total_questions: sourceQuestions.length,
                correct_count: correct,
                score: (correct / sourceQuestions.length) * 100,
            });
            if (isPracticeFromStudy) {
                const revealedQuestions = mcqData.questions.map((q) => {
                    const orig = studyQuestions.find((sq) => sq.id === q.id);
                    return orig ? { ...q, correct_answer: orig.correct_answer, explanation: orig.explanation } : q;
                });
                setMcqData({ ...mcqData, questions: revealedQuestions });
            }
        }
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTakePracticeTest = () => {
        if (!studyQuestions) return;
        const practiceQuestions = studyQuestions.map((q) => ({
            ...q,
            correct_answer: null,
            explanation: null,
        }));
        setMcqData({
            document_id: mcqData.document_id,
            topic: mcqData.topic,
            mode: 'practice',
            questions: practiceQuestions,
            attempt_id: null,
        });
        setAnswers({});
        setSubmitted(false);
        setResult(null);
        setIsPracticeFromStudy(true);
        toast.success('Practice test ready!', {
             style: { background: '#0A0F1C', color: '#34D399', border: '1px solid #10B981' }
        });
    };

    const resetQuiz = () => {
        setMcqData(null);
        setAnswers({});
        setSubmitted(false);
        setResult(null);
        setStudyQuestions(null);
        setIsPracticeFromStudy(false);
    };

    const inputClasses = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-slate-200 outline-none focus:border-cyan-500/50 focus:bg-cyan-500/[0.02] transition-all font-medium appearance-none cursor-pointer pr-10";

    const getDifficultyIcon = (diff) => {
        if (diff === 'easy') return <span className="text-emerald-400">🟢</span>;
        if (diff === 'medium') return <span className="text-amber-400">🟡</span>;
        return <span className="text-rose-400">🔴</span>;
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] bg-[#0A0F1C] overflow-hidden p-6 sm:p-10 selection:bg-cyan-500/30">
            {/* Ambient Base Gradients */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            <div className="relative max-w-5xl mx-auto z-10">
                {/* Header */}
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                        <ListChecks size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-tight">Assessments & MCQs</h1>
                        <p className="text-slate-400 text-lg font-medium mt-1">Generate AI quizzes to test your knowledge.</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!mcqData ? (
                        <motion.div
                            key="config-panel"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Document */}
                                <div className="space-y-3 relative z-40">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                        <BookOpen size={16} className="text-indigo-400" /> Source Material
                                    </label>
                                    <CustomSelect
                                        value={form.document_id}
                                        onChange={(val) => setForm({ ...form, document_id: val })}
                                        placeholder="Select Document..."
                                        options={documents.map(d => ({ value: d.id, label: d.filename }))}
                                    />
                                </div>

                                {/* Mode */}
                                <div className="space-y-3 relative z-30">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                        <FlaskConical size={16} className="text-cyan-400" /> Assessment Mode
                                    </label>
                                    <CustomSelect
                                        value={form.mode}
                                        onChange={(val) => setForm({ ...form, mode: val })}
                                        options={[
                                            { value: 'study', label: '📖 Study Mode (Answers shown)' },
                                            { value: 'practice', label: '📝 Practice Mode (Blind Test)' }
                                        ]}
                                    />
                                </div>

                                {/* Difficulty */}
                                <div className="space-y-3 relative z-20">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                        <Target size={16} className="text-rose-400" /> Difficulty Level
                                    </label>
                                    <CustomSelect
                                        value={form.difficulty}
                                        onChange={(val) => setForm({ ...form, difficulty: val })}
                                        options={[
                                            { value: 'easy', label: '🟢 Easy (Recall)' },
                                            { value: 'medium', label: '🟡 Medium (Comprehension)' },
                                            { value: 'hard', label: '🔴 Hard (Application)' }
                                        ]}
                                    />
                                </div>

                                {/* Count */}
                                <div className="space-y-3 relative z-10">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                        <Layers size={16} className="text-emerald-400" /> Question Count
                                    </label>
                                    <CustomSelect
                                        value={form.count}
                                        onChange={(val) => setForm({ ...form, count: val })}
                                        options={[3, 5, 7, 10, 15, 20].map((n) => ({ value: n, label: `${n} Questions` }))}
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGenerate}
                                disabled={loading}
                                className={`w-full py-5 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl
                                    ${loading 
                                        ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' 
                                        : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/25 border border-cyan-500/50 hover:shadow-cyan-500/40'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        <span>Generating via LLM...</span>
                                    </>
                                ) : (
                                    <>
                                        <PenTool size={20} />
                                        <span>Generate Assessment</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mcq-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            {/* Header Stats */}
                            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-sm">
                                        {mcqData.mode.toUpperCase()} MODE
                                    </span>
                                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-bold text-sm flex items-center gap-2">
                                        {getDifficultyIcon(form.difficulty)} {form.difficulty.toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-slate-400 font-medium">
                                    Topic: <span className="text-white font-bold">{mcqData.topic || 'General'}</span>
                                </div>
                            </div>

                            {/* Results Banner */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className={`p-8 rounded-3xl border-2 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl
                                            ${result.score >= 70 ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 
                                              result.score >= 40 ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.1)]' : 
                                              'bg-rose-500/10 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.1)]'}`}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] pointer-events-none" />
                                        <div className="relative z-10">
                                            <div className="text-6xl mb-4 drop-shadow-lg">
                                                {result.score >= 70 ? '🏆' : result.score >= 40 ? '🥈' : '📚'}
                                            </div>
                                            <h2 className="text-3xl font-extrabold text-white mb-2">
                                                {result.correct_count} out of {result.total_questions} Correct
                                            </h2>
                                            <p className={`text-2xl font-black ${result.score >= 70 ? 'text-emerald-400' : result.score >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                {result.score.toFixed(0)}% Score
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* The Questions */}
                            <div className="space-y-6">
                                {mcqData.questions.map((q, idx) => (
                                    <motion.div
                                        key={q.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <MCQCard
                                            question={q}
                                            showAnswer={mcqData.mode === 'study' || submitted}
                                            selectedAnswer={answers[q.id]}
                                            onSelect={(label) => handleSelect(q.id, label)}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Action Bottom Bar */}
                            <div className="sticky bottom-6 z-40 bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-wrap gap-4 mt-10">
                                {mcqData.mode === 'practice' && !submitted && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmit}
                                        className="flex-1 min-w-[200px] py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-lg"
                                    >
                                        <Send size={20} /> Submit Answers ({Object.keys(answers).length}/{mcqData.questions.length})
                                    </motion.button>
                                )}

                                {mcqData.mode === 'study' && studyQuestions && !isPracticeFromStudy && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleTakePracticeTest}
                                        className="flex-1 min-w-[200px] py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-lg"
                                    >
                                        <Play size={20} /> Take Practice Test
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={resetQuiz}
                                    className="flex-[0.5] min-w-[150px] py-4 px-6 rounded-xl border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-bold transition-all flex items-center justify-center gap-2 text-lg"
                                >
                                    <RefreshCw size={20} /> {submitted ? 'New Quiz' : 'Reset'}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
