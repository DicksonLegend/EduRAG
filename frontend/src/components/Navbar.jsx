import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📄' },
    { to: '/upload', label: 'Upload', icon: '⬆️' },
    { to: '/ask', label: 'Ask', icon: '💬' },
    { to: '/mcq', label: 'MCQ', icon: '✅' },
    { to: '/history', label: 'History', icon: '📋' },
    { to: '/analytics', label: 'Analytics', icon: '📊' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="glass-card sticky top-0 z-50 border-b border-[var(--color-border)] px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                        E
                    </div>
                    <span className="text-lg font-bold gradient-text hidden sm:block">EduRAG</span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]'
                                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]/50'
                                    }`}
                            >
                                <span className="text-base">{link.icon}</span>
                                <span className="hidden md:inline">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User + Logout */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm text-[var(--color-text-muted)]">{user.username}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--color-danger)]/10"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
