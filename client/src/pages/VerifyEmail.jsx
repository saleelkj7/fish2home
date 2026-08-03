import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            axios.get(`/api/auth/verify-email?token=${token}`)
                .then(() => setStatus('success'))
                .catch(() => setStatus('error'));
        } else {
            setStatus('error');
        }
    }, [searchParams]);

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-md text-center">
            {status === 'verifying' && <p className="text-lg text-slate-600">Verifying your email...</p>}
            {status === 'success' && (
                <>
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h2>
                    <p className="text-slate-600 mb-6">Your account is now active. You can log in.</p>
                    <Link to="/login" className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600">Go to Login</Link>
                </>
            )}
            {status === 'error' && (
                <>
                    <div className="text-5xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
                    <p className="text-slate-600 mb-6">The link is invalid or has expired.</p>
                    <Link to="/login" className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900">Back to Login</Link>
                </>
            )}
        </div>
    );
};
export default VerifyEmail;
