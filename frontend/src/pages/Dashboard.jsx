import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listDocuments } from '../api/documentApi';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function Dashboard() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    // Fetch documents via centralized API module
    const fetchDocuments = async () => {
        try {
            const res = await listDocuments();
            setDocuments(res.data);
        } catch {
            // no docs yet
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status) => {
        const styles = {
            completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            pending: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            failed: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return (
            <span className={`text-xs px-2.5 py-1 rounded-full border ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold">
                    Welcome back, <span className="gradient-text">{user?.full_name || user?.username}</span>
                </h1>
                <p className="text-[var(--color-text-muted)] mt-1">
                    {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { to: '/upload', icon: '📤', label: 'Upload PDF', desc: 'Add new study material' },
                    { to: '/ask', icon: '💬', label: 'Ask Question', desc: 'Get AI-powered answers' },
                    { to: '/mcq', icon: '✅', label: 'Generate MCQ', desc: 'Practice with quizzes' },
                    { to: '/analytics', icon: '📊', label: 'Analytics', desc: 'Track your progress' },
                ].map((action) => (
                    <Link
                        key={action.to}
                        to={action.to}
                        className="glass-card p-5 hover:border-[var(--color-primary)]/40 transition-all duration-300 group"
                    >
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">{action.icon}</div>
                        <h3 className="font-semibold text-sm">{action.label}</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">{action.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Documents List */}
            <div className="glass-card">
                <div className="p-5 border-b border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Your Documents</h2>
                        <Link to="/upload" className="text-sm text-[var(--color-primary-light)] hover:underline">
                            + Upload
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12"><Spinner /></div>
                ) : documents.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-4xl mb-3">📄</p>
                        <p className="text-[var(--color-text-muted)]">No documents yet</p>
                        <Link to="/upload" className="text-[var(--color-primary-light)] text-sm hover:underline mt-2 inline-block">
                            Upload your first PDF
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {documents.map((doc) => (
                            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-[var(--color-surface-elevated)]/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg">
                                        📄
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{doc.filename}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            {doc.total_pages} pages · {doc.total_chunks} chunks
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {statusBadge(doc.status)}
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
