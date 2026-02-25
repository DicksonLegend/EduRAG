import { useState, useEffect } from 'react';
import { getProgressOverview } from '../api/progressApi';
import Spinner from '../components/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch progress data via centralized API
    useEffect(() => {
        getProgressOverview()
            .then((res) => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
                <h1 className="text-2xl font-bold mb-8">Analytics</h1>
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-3">📊</p>
                    <p className="text-[var(--color-text-muted)]">No progress data yet.</p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Start asking questions and taking MCQs to see your analytics.</p>
                </div>
            </div>
        );
    }

    // Build chart data from progress entries
    const chartData = data.progress?.map((p) => ({
        name: p.topic || `Doc #${p.document_id}`,
        score: p.performance_score,
        questions: p.questions_asked,
    })) || [];

    const barColors = ['#818cf8', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'];

    return (
        <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
            <h1 className="text-2xl font-bold mb-8">Analytics Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="glass-card p-5">
                    <p className="text-sm text-[var(--color-text-muted)]">Questions Asked</p>
                    <p className="text-3xl font-bold gradient-text mt-1">{data.total_questions_asked}</p>
                </div>
                <div className="glass-card p-5">
                    <p className="text-sm text-[var(--color-text-muted)]">MCQ Attempts</p>
                    <p className="text-3xl font-bold gradient-text mt-1">{data.total_mcq_attempts}</p>
                </div>
                <div className="glass-card p-5">
                    <p className="text-sm text-[var(--color-text-muted)]">Average Score</p>
                    <p className={`text-3xl font-bold mt-1 ${data.overall_average_score >= 70 ? 'text-emerald-400' : data.overall_average_score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {data.overall_average_score.toFixed(1)}%
                    </p>
                </div>
                <div className="glass-card p-5">
                    <p className="text-sm text-[var(--color-text-muted)]">Topics Studied</p>
                    <p className="text-3xl font-bold gradient-text mt-1">{data.topics_accessed}</p>
                </div>
            </div>

            {/* Performance Chart */}
            {chartData.length > 0 && (
                <div className="glass-card p-6 mb-8">
                    <h2 className="font-semibold mb-4">Performance by Topic</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={barColors[i % barColors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Weak Topics */}
            {data.weak_topics?.length > 0 && (
                <div className="glass-card p-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <span className="text-yellow-400">⚠️</span> Weak Topics — Revision Recommended
                    </h2>
                    <div className="space-y-3">
                        {data.weak_topics.map((topic, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface)] border border-yellow-500/20">
                                <div>
                                    <p className="font-medium text-sm">{topic.topic}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{topic.suggestion}</p>
                                </div>
                                <span className="text-sm font-medium text-yellow-400">
                                    {topic.mcq_average_score.toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
