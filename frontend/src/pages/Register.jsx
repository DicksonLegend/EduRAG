import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

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
            toast.error('Please fill in all required fields');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.detail || 'Registration failed';
            toast.error(typeof msg === 'string' ? msg : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all';

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
            <div className="animate-fade-in w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                        E
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Create Account</h1>
                    <p className="text-[var(--color-text-muted)] mt-2">Join EduRAG today</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Username *</label>
                        <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Email *</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Full Name</label>
                        <input type="text" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Your full name" className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Password *</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Role</label>
                        <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
                            <option value="student">Student</option>
                            <option value="mentor">Mentor</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? <Spinner size="sm" /> : 'Create Account'}
                    </button>

                    <p className="text-center text-sm text-[var(--color-text-muted)]">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[var(--color-primary-light)] hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
