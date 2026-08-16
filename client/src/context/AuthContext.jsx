import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('f2h_user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('f2h_token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = (userData, tokenStr, isFirstLogin = false) => {
        localStorage.setItem('f2h_token', tokenStr);
        localStorage.setItem('f2h_user', JSON.stringify(userData));
        localStorage.setItem('f2h_first_login', isFirstLogin ? '1' : '0');
        setToken(tokenStr);
        setUser(userData);
    };

    const consumeFirstLogin = () => {
        const val = localStorage.getItem('f2h_first_login') === '1';
        localStorage.removeItem('f2h_first_login');
        return val;
    };

    const logout = () => {
        localStorage.removeItem('f2h_token');
        localStorage.removeItem('f2h_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, consumeFirstLogin, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
