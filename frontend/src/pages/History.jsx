import { useState, useEffect } from 'react';
import { getQuestionHistory, getMCQHistory } from '../api/historyApi';
import toast from 'react-hot-toast';

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
            .catch(() => toast.error('Failed to load history'))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const modeLabel = { beginner: '🟢 Beginner', exam: '📝 Exam', detailed: '📚 Detailed' };
    const diffLabel = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' };

    const tabClass = (tab) =>
        `px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === tab
            ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-indigo-500/20'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]/50'
        }`;

    return (
        <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">History</h1>
            <p className="text-[var(--color-text-muted)] mb-6">Review your past questions, answers, and MCQ attempts</p>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button className={tabClass('qa')} onClick={() => setActiveTab('qa')}>
                    💬 Q&A History ({qaHistory.length})
                </button>
                <button className={tabClass('mcq')} onClick={() => setActiveTab('mcq')}>
                    ✅ MCQ History ({mcqHistory.length})
                </button>
            </div>

            {loading && (
                <div className="text-center py-16 text-[var(--color-text-muted)]">Loading history...</div>
            )}

            {/* Q&A Tab */}
            {!loading && activeTab === 'qa' && (
                <div className="space-y-4">
                    {qaHistory.length === 0 ? (
                        <div className="glass-card p-8 text-center text-[var(--color-text-muted)]">
                            <div className="text-4xl mb-3">💬</div>
                            <p>No Q&A history yet. Ask your first question!</p>
                        </div>
                    ) : (
                        qaHistory.map((item) => (
                            <div key={item.id} className="glass-card p-5 space-y-3">
                                {/* Header row */}
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                                            {modeLabel[item.mode] || item.mode}
                                        </span>
                                        {item.marks && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                                                {item.marks} marks
                                            </span>
                                        )}
                                        {item.confidence_score != null && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.confidence_score >= 70 ? 'bg-emerald-500/20 text-emerald-300' : item.confidence_score >= 40 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {item.confidence_score.toFixed(0)}% confidence
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-[var(--color-text-muted)]">{formatDate(item.created_at)}</span>
                                </div>
                                {/* Question */}
                                <div>
                                    <p className="text-sm font-semibold text-[var(--color-primary-light)] mb-1">Q: {item.question}</p>
                                </div>
                                {/* Answer */}
                                <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                                    <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap leading-relaxed">{item.answer}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* MCQ Tab */}
            {!loading && activeTab === 'mcq' && (
                <div className="space-y-3">
                    {mcqHistory.length === 0 ? (
                        <div className="glass-card p-8 text-center text-[var(--color-text-muted)]">
                            <div className="text-4xl mb-3">✅</div>
                            <p>No MCQ history yet. Generate your first quiz!</p>
                        </div>
                    ) : (
                        mcqHistory.map((item) => (
                            <div key={item.id} className="glass-card p-5 space-y-3">
                                {/* Header */}
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                            {diffLabel[item.difficulty] || item.difficulty}
                                        </span>
                                        {item.topic && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                                                {item.topic}
                                            </span>
                                        )}
                                        {/* Correct/Incorrect badge */}
                                        {item.is_correct != null && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.is_correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {item.is_correct ? '✅ Correct' : '❌ Incorrect'}
                                            </span>
                                        )}
                                        {item.is_correct == null && item.selected_answer == null && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                                                Not attempted
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-[var(--color-text-muted)]">{formatDate(item.created_at)}</span>
                                </div>

                                {/* Question */}
                                <p className="text-sm font-semibold">{item.question}</p>

                                {/* Options grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(item.options).map(([label, text]) => {
                                        const isCorrect = label === item.correct_answer;
                                        const isSelected = label === item.selected_answer;
                                        let optClass = 'p-2.5 rounded-lg text-sm border ';
                                        if (isSelected && isCorrect) {
                                            optClass += 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
                                        } else if (isSelected && !isCorrect) {
                                            optClass += 'border-red-500/50 bg-red-500/10 text-red-300';
                                        } else if (isCorrect && item.selected_answer) {
                                            optClass += 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
                                        } else {
                                            optClass += 'border-[var(--color-border)] text-[var(--color-text-muted)]';
                                        }
                                        return (
                                            <div key={label} className={optClass}>
                                                <span className="font-semibold">{label}.</span> {text}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Answer summary */}
                                {item.selected_answer && (
                                    <div className="text-xs text-[var(--color-text-muted)]">
                                        Your answer: <strong>{item.selected_answer}</strong> | Correct: <strong>{item.correct_answer}</strong>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
