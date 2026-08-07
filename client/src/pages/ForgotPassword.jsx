import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setMsg('');
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setMsg(res.data.message);
            setDone(true);
        } catch (err) {
            setMsg(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2 text-center">Reset your password</h2>
            <p className="text-sm text-slate-500 text-center mb-6">Enter the email you registered with and we'll send you a reset link.</p>
            {msg && <p className={`p-3 mb-4 rounded text-center text-sm ${done ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{msg}</p>}
            {!done && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className="p-2 border rounded w-full" />
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-2 rounded hover:bg-teal-600 font-bold disabled:opacity-50">
                        {loading ? 'Sending...' : 'Send reset link'}
                    </button>
                </form>
            )}
            <p className="text-center mt-4 text-sm text-slate-600">
                <Link to="/login" className="text-teal-600 font-bold">Back to login</Link>
            </p>
        </div>
    );
};
export default ForgotPassword;
