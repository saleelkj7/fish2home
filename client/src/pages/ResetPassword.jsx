import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        if (password.length < 8) return setMsg('Password must be at least 8 characters.');
        if (password !== confirm) return setMsg('Passwords do not match.');

        setLoading(true);
        try {
            const res = await axios.post('/api/auth/reset-password', { token, password });
            setMsg(res.data.message);
            setDone(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMsg(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
                <p className="text-red-600 font-semibold mb-4">This reset link is missing its token.</p>
                <Link to="/forgot-password" className="text-teal-600 font-bold">Request a new link</Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Set a new password</h2>
            {msg && <p className={`p-3 mb-4 rounded text-center text-sm ${done ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{msg}</p>}
            {!done && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="password" placeholder="New password" required value={password} onChange={e => setPassword(e.target.value)} className="p-2 border rounded w-full" />
                    <input type="password" placeholder="Confirm new password" required value={confirm} onChange={e => setConfirm(e.target.value)} className="p-2 border rounded w-full" />
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-2 rounded hover:bg-teal-600 font-bold disabled:opacity-50">
                        {loading ? 'Saving...' : 'Reset password'}
                    </button>
                </form>
            )}
        </div>
    );
};
export default ResetPassword;
