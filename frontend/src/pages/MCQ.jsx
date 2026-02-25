import { useState, useEffect } from 'react';
import { listDocuments } from '../api/documentApi';
import { generateMCQs, submitMCQAnswers } from '../api/mcqApi';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import MCQCard from '../components/MCQCard';

export default function MCQ() {
    const [documents, setDocuments] = useState([]);
    const [form, setForm] = useState({ document_id: '', count: 5, mode: 'study' });
    const [loading, setLoading] = useState(false);
    const [mcqData, setMcqData] = useState(null);
    const [answers, setAnswers] = useState({});       // { questionId: 'A' }
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    // Load completed documents via centralized API
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
        if (!form.document_id) return toast.error('Select a document');
        setLoading(true);
        setMcqData(null);
        setAnswers({});
        setSubmitted(false);
        setResult(null);
        try {
            const res = await generateMCQs({
                document_id: Number(form.document_id),
                count: Number(form.count),
                mode: form.mode,
            });
            setMcqData(res.data);
            if (res.data.questions.length === 0) {
                toast.error('No MCQs could be generated. Try a different document.');
            }
        } catch (err) {
            // Distinguish timeout from server errors
            if (err.code === 'ECONNABORTED') {
                toast.error('MCQ generation timed out. The LLM is still processing — try again in a moment.');
            } else {
                toast.error(err.response?.data?.detail || 'MCQ generation failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (questionId, label) => {
        setAnswers((prev) => ({ ...prev, [questionId]: label }));
    };

    const handleSubmit = async () => {
        if (!mcqData) return;
        const unanswered = mcqData.questions.filter((q) => !answers[q.id]);
        if (unanswered.length > 0) {
            toast.error(`Please answer all questions (${unanswered.length} remaining)`);
            return;
        }

        // If practice mode with attempt_id, submit to backend
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
                // Update mcqData questions with correct answers from results
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
            // Study mode — calculate locally
            const correct = mcqData.questions.filter((q) => answers[q.id] === q.correct_answer).length;
            setResult({
                total_questions: mcqData.questions.length,
                correct_count: correct,
                score: (correct / mcqData.questions.length) * 100,
            });
        }
        setSubmitted(true);
    };

    const resetQuiz = () => {
        setMcqData(null);
        setAnswers({});
        setSubmitted(false);
        setResult(null);
    };

    const selectClass = 'w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all';

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">MCQ Generator</h1>
            <p className="text-[var(--color-text-muted)] mb-8">Generate practice questions from your documents</p>

            {/* Config Panel */}
            {!mcqData && (
                <div className="glass-card p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Document</label>
                            <select value={form.document_id} onChange={(e) => setForm({ ...form, document_id: e.target.value })} className={selectClass}>
                                <option value="">Select</option>
                                {documents.map((d) => <option key={d.id} value={d.id}>{d.filename}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Mode</label>
                            <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className={selectClass}>
                                <option value="study">📖 Study — Show answers</option>
                                <option value="practice">📝 Practice — Assessment</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Questions</label>
                            <select value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} className={selectClass}>
                                {[3, 5, 7, 10, 15].map((n) => <option key={n} value={n}>{n} questions</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Mode Description */}
                    <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                        {form.mode === 'study' ? (
                            <p className="text-sm text-[var(--color-text-muted)]">📖 <strong>Study Mode</strong>: Questions, answers, and explanations shown together for learning.</p>
                        ) : (
                            <p className="text-sm text-[var(--color-text-muted)]">📝 <strong>Practice Mode</strong>: Answer all questions, then submit to see your score and review.</p>
                        )}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <><Spinner size="sm" /> Generating MCQs...</> : '✅ Generate MCQs'}
                    </button>
                </div>
            )}

            {/* MCQ Questions */}
            {mcqData && mcqData.questions.length > 0 && (
                <div className="space-y-4">
                    {/* Score Result Banner */}
                    {result && (
                        <div className={`glass-card p-6 text-center animate-fade-in ${result.score >= 70 ? 'border-emerald-500/30' : result.score >= 40 ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
                            <div className="text-4xl mb-2">{result.score >= 70 ? '🎉' : result.score >= 40 ? '💪' : '📚'}</div>
                            <h2 className="text-2xl font-bold">
                                {result.correct_count} / {result.total_questions}
                            </h2>
                            <p className={`text-lg font-semibold ${result.score >= 70 ? 'text-emerald-400' : result.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {result.score.toFixed(0)}%
                            </p>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                {result.score >= 70 ? 'Great job!' : result.score >= 40 ? 'Keep practicing!' : 'Review the material and try again'}
                            </p>
                        </div>
                    )}

                    {/* Question Cards */}
                    {mcqData.questions.map((q) => (
                        <MCQCard
                            key={q.id}
                            question={q}
                            showAnswer={mcqData.mode === 'study' || submitted}
                            selectedAnswer={answers[q.id]}
                            onSelect={(label) => handleSelect(q.id, label)}
                        />
                    ))}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {mcqData.mode === 'practice' && !submitted && (
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all"
                            >
                                Submit Answers ({Object.keys(answers).length}/{mcqData.questions.length})
                            </button>
                        )}
                        <button
                            onClick={resetQuiz}
                            className="flex-1 py-3 px-4 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-elevated)]/50 transition-all"
                        >
                            {submitted ? 'Generate New MCQs' : 'Back'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
