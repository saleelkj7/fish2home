import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { cart } = useContext(CartContext);
    const { user, isAuthenticated, logout } = useContext(AuthContext);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
            <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/images/logo.png" alt="Fishtokri" className="h-14 w-auto py-1" />
                    </Link>
                    <a href="https://youtube.com/@vaibhavtambe6579?si=yTGf6f6WsDXjLZze" target="_blank" rel="noreferrer" aria-label="Fishtokri on YouTube" className="text-slate-400 hover:text-red-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.12C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.391.521A2.994 2.994 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.994 2.994 0 0 0 2.107 2.12c1.886.521 9.391.521 9.391.521s7.505 0 9.391-.521a2.994 2.994 0 0 0 2.107-2.12C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
                        </svg>
                    </a>
                </div>
                <div className="flex items-center gap-6 text-sm font-semibold text-slate-600">
                    <Link to="/" className="hover:text-teal-700 hidden md:block">Home</Link>
                    {user?.role !== 'ADMIN' && (
                        <Link to="/orders" className="hover:text-teal-700 hidden md:block">My Orders</Link>
                    )}
                    {isAuthenticated && user?.role === 'ADMIN' && (
                        <Link to="/admin" className="hover:text-teal-700 hidden md:block">Admin</Link>
                    )}
                    <Link to="/cart" className="relative flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors">
                        Cart
                        {itemCount > 0 && <span className="bg-teal-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-bold">{itemCount}</span>}
                    </Link>
                    {isAuthenticated ? (
                        <button onClick={logout} className="text-red-600 hover:text-red-700">Logout</button>
                    ) : (
                        <Link to="/login" className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
export default Navbar;
