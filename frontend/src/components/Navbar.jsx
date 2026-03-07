import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, UploadCloud, MessageSquareText, FileQuestion, History, BarChart3, LogOut, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/upload', label: 'Upload', icon: <UploadCloud size={18} /> },
    { to: '/ask', label: 'Ask', icon: <MessageSquareText size={18} /> },
    { to: '/mcq', label: 'MCQ', icon: <FileQuestion size={18} /> },
    { to: '/history', label: 'History', icon: <History size={18} /> },
    { to: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
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
        <motion.nav 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 px-4 py-3 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 p-[1px] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-full h-full bg-[#0a0f1d] rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg bg-gradient-to-br from-indigo-400 to-cyan-300 bg-clip-text text-transparent">E</span>
                        </div>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Edu<span className="text-indigo-400">RAG</span></span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center justify-center gap-1 bg-white/5 rounded-2xl p-1 border border-white/5">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-white/10 rounded-xl"
                                    />
                                )}
                                <span className={`relative z-10 ${isActive ? 'text-indigo-400' : ''}`}>{link.icon}</span>
                                <span className="relative z-10 hidden md:inline">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2.5 bg-white/5 pl-2 pr-3 py-1.5 rounded-full border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-medium text-slate-300">{user.username}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors px-3 py-2 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                    >
                        <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </motion.nav>
    );
}
