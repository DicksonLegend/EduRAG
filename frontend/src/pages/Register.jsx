import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Orbit, Loader2, ArrowRight } from 'lucide-react';

export default function Register() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'student',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.email || !form.password) {
            toast.error('Please fill in all required fields', { style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' } });
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters', { style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' } });
            return;
        }
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created! Please sign in.', { style: { background: '#0A0F1C', color: '#34D399', border: '1px solid #10B981' } });
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.detail || 'Registration failed';
            toast.error(typeof msg === 'string' ? msg : 'Registration failed', { style: { background: '#0A0F1C', color: '#F87171', border: '1px solid #EF4444' } });
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all placeholder:text-slate-600 font-medium';

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] px-6 py-12 relative overflow-hidden selection:bg-cyan-500/30">
            {/* Ambient Multi-Gradients */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            <div className="w-full max-w-lg relative z-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.2)] mb-6">
                        <Orbit size={40} />
                    </div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-400 tracking-tight mb-3">Initialize Node</h1>
                    <p className="text-slate-400 text-lg font-medium">Join the EduRAG network</p>
                </motion.div>

                <motion.form 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit} 
                    className="bg-white/[0.02] border border-white/[0.05] p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-5"
                >
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-cyan-500" />

                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Username *</label>
                        <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="e.g. neuro_student_01" className={inputClass} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Email *</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@network.com" className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Full Name</label>
                            <input type="text" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Optional" className={inputClass} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Password *</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 chars" className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Role</label>
                            <select name="role" value={form.role} onChange={handleChange} className={`${inputClass} appearance-none`}>
                                <option value="student" className="bg-[#0A0F1C] text-white">Student</option>
                                <option value="mentor" className="bg-[#0A0F1C] text-white">Mentor</option>
                            </select>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-8 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <><Loader2 className="animate-spin" size={24} /> Processing...</> : <><ArrowRight size={24} /> Register Node</>}
                    </motion.button>

                    <p className="text-center mt-6 text-slate-400 font-medium">
                        Returning entity?{' '}
                        <Link to="/login" className="text-cyan-400 hover:text-indigo-400 transition-colors font-bold underline decoration-cyan-500/30 underline-offset-4">
                            Access System
                        </Link>
                    </p>
                </motion.form>
            </div>
        </div>
    );
}
