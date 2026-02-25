import { useState, useEffect } from 'react';
import { listDocuments } from '../api/documentApi';
import { askQuestion } from '../api/queryApi';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

export default function AskQuestion() {
    const [documents, setDocuments] = useState([]);
    const [form, setForm] = useState({
        document_id: '',
        question: '',
        mode: 'detailed',
        marks: '',
    });
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState(null);
    const [sourcesOpen, setSourcesOpen] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.document_id || !form.question.trim()) {
            toast.error('Select a document and enter a question');
            return;
        }
        setLoading(true);
        setAnswer(null);
        try {
            const payload = {
                document_id: Number(form.document_id),
                question: form.question.trim(),
                mode: form.mode,
            };
            // Only include marks if selected
            if (form.marks) payload.marks = Number(form.marks);
            const res = await askQuestion(payload);
            setAnswer(res.data);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to get answer');
        } finally {
            setLoading(false);
        }
    };

    const confidenceColor = (score) => {
        if (score >= 70) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
        if (score >= 40) return 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30';
        return 'text-red-400 bg-red-500/15 border-red-500/30';
    };

    const selectClass = 'w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all';

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">Ask a Question</h1>
            <p className="text-[var(--color-text-muted)] mb-8">Get AI-powered answers from your documents</p>

            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 mb-6">
                {/* Document Selector */}
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Document</label>
                    <select
                        value={form.document_id}
                        onChange={(e) => setForm({ ...form, document_id: e.target.value })}
                        className={selectClass}
                    >
                        <option value="">Select a document</option>
                        {documents.map((d) => <option key={d.id} value={d.id}>{d.filename}</option>)}
                    </select>
                </div>

                {/* Mode + Marks Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Mode</label>
                        <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className={selectClass}>
                            <option value="detailed">Detailed</option>
                            <option value="beginner">Beginner</option>
                            <option value="exam">Exam</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Marks (optional)</label>
                        <select value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} className={selectClass}>
                            <option value="">None</option>
                            <option value="2">2 Marks</option>
                            <option value="3">3 Marks</option>
                            <option value="5">5 Marks</option>
                            <option value="10">10 Marks</option>
                        </select>
                    </div>
                </div>

                {/* Question */}
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Your Question</label>
                    <textarea
                        value={form.question}
                        onChange={(e) => setForm({ ...form, question: e.target.value })}
                        placeholder="Type your question here..."
                        rows={4}
                        className={`${selectClass} resize-none`}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <><Spinner size="sm" /> Generating answer...</> : '🤖 Ask AI'}
                </button>
            </form>

            {/* Answer Display */}
            {answer && (
                <div className="glass-card p-6 animate-slide-in space-y-4">
                    {/* Header with confidence */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">💡</span>
                            <h3 className="font-semibold">Answer</h3>
                            {answer.marks && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    {answer.marks} marks
                                </span>
                            )}
                        </div>
                        <span className={`text-sm px-3 py-1 rounded-full border font-medium ${confidenceColor(answer.confidence_score)}`}>
                            {answer.confidence_score.toFixed(1)}% confidence
                        </span>
                    </div>

                    {/* Answer text */}
                    <div className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap text-sm bg-[var(--color-surface)] rounded-lg p-4">
                        {answer.answer}
                    </div>

                    {/* Source Pages */}
                    {answer.source_pages?.length > 0 && (
                        <div>
                            <button
                                onClick={() => setSourcesOpen(!sourcesOpen)}
                                className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                            >
                                <span className={`transition-transform ${sourcesOpen ? 'rotate-90' : ''}`}>▶</span>
                                {answer.source_pages.length} source{answer.source_pages.length !== 1 ? 's' : ''} referenced
                            </button>
                            {sourcesOpen && (
                                <div className="mt-3 space-y-2">
                                    {answer.source_pages.map((src, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                                            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono whitespace-nowrap">
                                                p.{src.page_number}
                                            </span>
                                            <p className="text-xs text-[var(--color-text-muted)] flex-1">{src.chunk_preview}</p>
                                            <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">{src.relevance_score.toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
