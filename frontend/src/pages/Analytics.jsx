import { useState, useEffect } from 'react';
import { getProgressOverview } from '../api/progressApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Target, BrainCircuit, BookOpen, AlertTriangle, TrendingUp, Search } from 'lucide-react';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProgressOverview()
            .then((res) => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[#0A0F1C]">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Search size={40} className="mb-4 text-emerald-400/50" />
                </motion.div>
                <p className="text-lg font-bold text-slate-500">Compiling Analytics Data...</p>
            </div>
        );
    }

    if (!data || (!data.total_questions_asked && !data.total_mcq_attempts)) {
        return (
            <div className="relative min-h-[calc(100vh-64px)] bg-[#0A0F1C] overflow-hidden p-6 selection:bg-emerald-500/30 flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 bg-white/[0.02] border border-white/[0.05] rounded-3xl p-16 text-center max-w-lg backdrop-blur-xl"
                >
                    <Activity size={64} className="mx-auto text-emerald-500/50 mb-6" />
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">Insufficient Data</h1>
                    <p className="text-slate-400 text-lg">Your analytics engine is empty. Start asking questions and taking MCQ assessments to populate tracking data.</p>
                </motion.div>
            </div>
        );
    }

    const chartData = data.progress?.map((p) => ({
        name: p.topic || `Doc #${p.document_id}`,
        score: p.performance_score,
        questions: p.questions_asked,
    })) || [];

    const barColors = ['#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'];

    return (
        <div className="relative min-h-[calc(100vh-64px)] bg-[#0A0F1C] overflow-hidden p-6 sm:p-10 selection:bg-emerald-500/30">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            <div className="relative max-w-6xl mx-auto z-10">
                {/* Header */}
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                        <Activity size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight">Performance Analytics</h1>
                        <p className="text-slate-400 text-lg font-medium mt-1">Real-time metrics on your artificial learning progress.</p>
                    </div>
                </div>

                {/* Cyberpunk Stat Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20"><HelpCircleIcon /></div>
                            <p className="font-bold text-slate-400">Total Questions</p>
                        </div>
                        <p className="text-4xl font-black text-white">{data.total_questions_asked}</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20"><Target size={20} /></div>
                            <p className="font-bold text-slate-400">MCQ Attempts</p>
                        </div>
                        <p className="text-4xl font-black text-white">{data.total_mcq_attempts}</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20"><TrendingUp size={20} /></div>
                            <p className="font-bold text-slate-400">Avg Intel Score</p>
                        </div>
                        <p className={`text-4xl font-black ${data.overall_average_score >= 70 ? 'text-emerald-400' : data.overall_average_score >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {data.overall_average_score.toFixed(1)}%
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl backdrop-blur-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20"><BookOpen size={20} /></div>
                            <p className="font-bold text-slate-400">Topics Mastered</p>
                        </div>
                        <p className="text-4xl font-black text-white">{data.topics_accessed}</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    {chartData.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] p-6 sm:p-8 rounded-3xl backdrop-blur-xl flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <BrainCircuit className="text-emerald-400" />
                                <h2 className="text-xl font-bold text-slate-200">Knowledge Saturation (By Topic)</h2>
                            </div>
                            <div className="flex-1 min-h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} domain={[0, 100]} axisLine={false} tickLine={false} dx={-10} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                            contentStyle={{ backgroundColor: '#0A0F1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#10B981' }}
                                        />
                                        <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={60}>
                                            {chartData.map((_, i) => (
                                                <Cell key={i} fill={barColors[i % barColors.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    )}

                    {/* Weak Topics Side Panel */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-amber-500/[0.03] border border-amber-500/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <AlertTriangle className="text-amber-400" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-200">Focus Areas</h2>
                        </div>
                        
                        {data.weak_topics?.length > 0 ? (
                            <div className="space-y-4">
                                {data.weak_topics.map((topic, i) => (
                                    <div key={i} className="group relative p-5 rounded-2xl bg-[#0A0F1C]/50 border border-white/5 hover:border-amber-500/30 transition-colors overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-bold text-slate-200 mb-1">{topic.topic}</p>
                                                <p className="text-xs font-semibold text-amber-500/70 uppercase tracking-widest">{topic.suggestion}</p>
                                            </div>
                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 flex flex-col items-center justify-center border border-amber-500/20">
                                                <span className="text-sm font-black text-amber-400">{topic.mcq_average_score.toFixed(0)}</span>
                                                <span className="text-[9px] font-bold text-amber-500/50 -mt-1">%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[250px] flex flex-col items-center justify-center text-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                                <Target size={32} className="mb-3 opacity-50" />
                                <p className="font-bold">No Weaknesses Detected</p>
                                <p className="text-sm mt-1">You are maintaining strong performance across all topics.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

const HelpCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>;
