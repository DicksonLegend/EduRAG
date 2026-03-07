import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BrainCircuit, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Please fill in all fields', { style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' } });
            return;
        }
        setLoading(true);
        try {
            await login(username, password);
            toast.success('Authentication successful', { style: { background: '#0A0F1C', color: '#34D399', border: '1px solid #10B981' } });
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.detail || 'Login failed';
            toast.error(typeof msg === 'string' ? msg : 'Invalid credentials', { style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' } });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] px-6 relative overflow-hidden selection:bg-indigo-500/30">
            {/* Ambient Multi-Gradients */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            <div className="w-full max-w-md relative z-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.2)] mb-6">
                        <BrainCircuit size={40} />
                    </div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 tracking-tight mb-3">EduRAG</h1>
                    <p className="text-slate-400 text-lg font-medium">Neural Learning Environment</p>
                </motion.div>

                <motion.form 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit} 
                    className="bg-white/[0.02] border border-white/[0.05] p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500" />
                    
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Establish Connection</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your identifier"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600 font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your passkey"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all placeholder:text-slate-600 font-medium"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <><Loader2 className="animate-spin" size={24} /> Initiating...</> : <><ArrowRight size={24} /> Access System</>}
                        </motion.button>
                    </div>

                    <p className="text-center mt-8 text-slate-400 font-medium">
                        Unregistered entity?{' '}
                        <Link to="/register" className="text-indigo-400 hover:text-cyan-400 transition-colors font-bold underline decoration-indigo-500/30 underline-offset-4">
                            Initialize Node
                        </Link>
                    </p>
                </motion.form>
            </div>
        </div>
    );
}
