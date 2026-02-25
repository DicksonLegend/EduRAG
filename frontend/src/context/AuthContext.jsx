import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getCurrentUser, registerUser } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('edurag_token'));
    const [loading, setLoading] = useState(true);

    // On mount, verify token by fetching current user
    useEffect(() => {
        if (token) {
            getCurrentUser()
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('edurag_token');
                    localStorage.removeItem('edurag_user');
                    setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (username, password) => {
        const res = await loginUser({ username, password });
        const { access_token } = res.data;
        localStorage.setItem('edurag_token', access_token);
        setToken(access_token);
        // Fetch user info with the new token
        const userRes = await getCurrentUser();
        setUser(userRes.data);
        localStorage.setItem('edurag_user', JSON.stringify(userRes.data));
        return userRes.data;
    };

    const register = async (data) => {
        const res = await registerUser(data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('edurag_token');
        localStorage.removeItem('edurag_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
