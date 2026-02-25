import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await login(username, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.detail || 'Login failed';
            toast.error(typeof msg === 'string' ? msg : 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
            <div className="animate-fade-in w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 animate-pulse-glow">
                        E
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">EduRAG</h1>
                    <p className="text-[var(--color-text-muted)] mt-2">AI-Powered Learning Assistant</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
                    <h2 className="text-xl font-semibold text-center mb-2">Sign In</h2>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? <Spinner size="sm" /> : 'Sign In'}
                    </button>

                    <p className="text-center text-sm text-[var(--color-text-muted)]">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[var(--color-primary-light)] hover:underline font-medium">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
