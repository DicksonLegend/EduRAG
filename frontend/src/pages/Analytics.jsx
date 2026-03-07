import { useState, useEffect } from 'react';
import { getProgressOverview } from '../api/progressApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, ComposedChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Target, BrainCircuit, BookOpen, AlertTriangle, TrendingUp, Search, Zap, Hexagon, Crosshair } from 'lucide-react';

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
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                    <Hexagon size={48} className="mb-4 text-emerald-500/50" />
                </motion.div>
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse">Loading Your Custom Analytics...</p>
            </div>
        );
    }

    if (!data || (!data.total_questions_asked && !data.total_mcq_attempts)) {
        return (
            <div className="relative min-h-[calc(100vh-64px)] bg-[#0A0F1C] overflow-hidden p-6 flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 bg-white/[0.02] border border-white/[0.05] rounded-3xl p-16 text-center max-w-lg backdrop-blur-xl shadow-2xl"
                >
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mx-auto mb-8">
                        <Activity size={40} className="text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-4">No Data Yet</h1>
                    <p className="text-slate-400 text-lg leading-relaxed">Your dashboard is empty right now. Start interacting with your documents by asking questions or generating MCQs to see your progress here.</p>
                </motion.div>
            </div>
        );
    }

    const chartData = data.progress?.map((p) => ({
        name: p.topic || `Doc #${p.document_id}`,
        score: p.performance_score || 0,
        questions: p.questions_asked || 0,
    })) || [];

    const getScoreColor = (score) => {
        if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', hex: '#34d399' };
        if (score >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', hex: '#fbbf24' };
        return { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30', hex: '#fb7185' };
    };

    const avgScoreParams = getScoreColor(data.overall_average_score);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0A0F1C]/95 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                    <p className="text-slate-300 font-bold mb-3 border-b border-white/10 pb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-6 my-1">
                            <span className="text-slate-400 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name === 'score' ? 'Score' : 'Questions'}
                            </span>
                            <span className="font-bold text-white">
                                {entry.value}{entry.name === 'score' ? '%' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] bg-[#0A0F1C] overflow-hidden p-6 sm:p-10 selection:bg-emerald-500/30">
            {/* Holographic Ambient Glow */}
            <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

            <div className="relative max-w-7xl mx-auto z-10">
                {/* Header Sequence */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex md:flex-row flex-col items-start md:items-center justify-between gap-5 mb-10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                            <Zap size={32} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Analytics</span></h1>
                            <p className="text-slate-400 font-medium">Track your learning progress and performance over time.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Cyberpunk Stat Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Stat Card 1 */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:bg-blue-500/20 transition-colors">
                                <HelpCircleIcon />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-1">Questions Asked</p>
                        <p className="text-4xl font-black text-white">{data.total_questions_asked}</p>
                    </motion.div>

                    {/* Stat Card 2 */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] group-hover:bg-purple-500/20 transition-colors">
                                <Target size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-1">Quizzes Taken</p>
                        <p className="text-4xl font-black text-white">{data.total_mcq_attempts}</p>
                    </motion.div>

                    {/* Stat Card 3 */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${data.overall_average_score}%` }} 
                                transition={{ duration: 1, delay: 0.5 }}
                                className={`h-full ${avgScoreParams.bg.replace('/20', '')}`}
                            />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl ${avgScoreParams.bg} flex items-center justify-center ${avgScoreParams.text} border ${avgScoreParams.border} shadow-[0_0_20px_currentColor] group-hover:scale-110 transition-transform`}>
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-1">Average Score</p>
                        <p className={`text-4xl font-black ${avgScoreParams.text} drop-shadow-md`}>
                            {data.overall_average_score.toFixed(1)}<span className="text-2xl text-white/50">%</span>
                        </p>
                    </motion.div>

                    {/* Stat Card 4 */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] group-hover:bg-cyan-500/20 transition-colors">
                                <BookOpen size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-1">Topics Mastered</p>
                        <p className="text-4xl font-black text-white">{data.topics_accessed}</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart Matrix */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] p-6 sm:p-8 rounded-3xl backdrop-blur-xl flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="flex items-center justify-between gap-3 mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="text-cyan-400" size={28} />
                                <div>
                                    <h2 className="text-xl font-bold text-white">Performance Overview</h2>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest">Your Scores and Questions per Topic</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 min-h-[350px] relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0}/>
                                        </linearGradient>
                                        <linearGradient id="questionGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6}/>
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} domain={[0, 100]} axisLine={false} tickLine={false} dx={-10} hide={chartData.length === 1 && chartData[0].score === 0} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} hide/>
                                    
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', strokeWidth: 1, stroke: 'rgba(255,255,255,0.1)' }} />
                                    
                                    <Bar yAxisId="left" dataKey="score" fill="url(#scoreGradient)" radius={[6, 6, 0, 0]} barSize={40} minPointSize={8} />
                                    <Line yAxisId="right" type="monotone" dataKey="questions" stroke="#a855f7" strokeWidth={3} dot={{ r: 6, fill: '#0A0F1C', stroke: '#a855f7', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#a855f7' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Weak Topics Node */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-b from-amber-500/[0.03] to-transparent border border-amber-500/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="flex items-center gap-3 mb-8 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                <Crosshair className="text-amber-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Focus Areas</h2>
                                <p className="text-xs text-amber-500/60 uppercase tracking-widest">Topics that need more review</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 relative z-10">
                            {data.weak_topics?.length > 0 ? (
                                <div className="space-y-4">
                                    {data.weak_topics.map((topic, i) => (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (i*0.1) }} key={i} className="group p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all overflow-hidden relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-rose-500" />
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-bold text-slate-200 mb-1 leading-tight">{topic.topic}</p>
                                                    <p className="text-xs font-bold text-amber-500/70 uppercase tracking-wider">{topic.suggestion}</p>
                                                </div>
                                                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#0A0F1C] flex flex-col items-center justify-center border border-amber-500/20 shadow-inner">
                                                    <span className="text-sm font-black text-amber-400">{topic.mcq_average_score.toFixed(0)}</span>
                                                    <span className="text-[9px] font-bold text-slate-500 -mt-1">%</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center text-emerald-500/60 border border-dashed border-emerald-500/20 rounded-2xl bg-emerald-500/5">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                        <Activity size={32} className="text-emerald-400" />
                                    </div>
                                    <p className="font-bold text-emerald-400">You're Doing Great!</p>
                                    <p className="text-sm mt-2 text-emerald-500/60 max-w-[200px]">No weak topics detected. Keep up the good work!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

const HelpCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>;
