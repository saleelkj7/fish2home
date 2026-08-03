import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', mobile: '', password: '' });
    const [msg, setMsg] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); setMsg('');
        try {
            if (isLogin) {
                const res = await axios.post('/api/auth/login', { email: form.email, password: form.password });
                login(res.data.user, res.data.token);
                // Redirect based on role
                if (res.data.user.role === 'ADMIN') navigate('/admin');
                else navigate('/');
            } else {
                const res = await axios.post('/api/auth/register', form);
                setMsg(res.data.message);
                setTimeout(() => setIsLogin(true), 2500);
            }
        } catch (err) { setMsg(err.response?.data?.error || 'An error occurred'); }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login to Fish2Home' : 'Create Account'}</h2>
            {msg && <p className={`p-3 mb-4 rounded text-center ${msg.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{msg}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="First Name" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="p-2 border rounded w-full" />
                        <input type="text" placeholder="Last Name" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="p-2 border rounded w-full" />
                    </div>
                )}
                <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="p-2 border rounded w-full" />
                {!isLogin && <input type="text" placeholder="Mobile Number" required value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="p-2 border rounded w-full" />}
                <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="p-2 border rounded w-full" />
                <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded hover:bg-teal-600 font-bold">{isLogin ? 'Login' : 'Register'}</button>
            </form>
            <p className="text-center mt-4 text-sm text-slate-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLogin(!isLogin)} className="text-teal-600 font-bold ml-1">{isLogin ? 'Register' : 'Login'}</button>
            </p>
        </div>
    );
};
export default Auth;
