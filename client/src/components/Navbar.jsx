import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { cart } = useContext(CartContext);
    const { user, isAuthenticated, logout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const close = () => setMenuOpen(false);

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
            <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2" onClick={close}>
                    <img src="/images/logo.png" alt="Fishtokri" className="h-14 w-auto py-1" />
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
                    <Link to="/" className="hover:text-teal-700">Home</Link>
                    {user?.role !== 'ADMIN' && (
                        <Link to="/orders" className="hover:text-teal-700">My Orders</Link>
                    )}
                    {isAuthenticated && user?.role === 'ADMIN' && (
                        <Link to="/admin" className="hover:text-teal-700">Admin</Link>
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

                {/* Mobile: cart icon always visible + hamburger toggle */}
                <div className="flex md:hidden items-center gap-3">
                    <Link to="/cart" className="relative flex items-center gap-1 bg-slate-900 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                        Cart
                        {itemCount > 0 && <span className="bg-teal-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-bold">{itemCount}</span>}
                    </Link>
                    <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" className="p-2 text-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 flex flex-col gap-4 text-sm font-semibold text-slate-700">
                    <Link to="/" onClick={close} className="hover:text-teal-700">Home</Link>
                    {user?.role !== 'ADMIN' && (
                        <Link to="/orders" onClick={close} className="hover:text-teal-700">My Orders</Link>
                    )}
                    {isAuthenticated && user?.role === 'ADMIN' && (
                        <Link to="/admin" onClick={close} className="hover:text-teal-700">Admin</Link>
                    )}
                    {isAuthenticated ? (
                        <button onClick={() => { logout(); close(); }} className="text-left text-red-600">Logout</button>
                    ) : (
                        <Link to="/login" onClick={close} className="text-teal-700">Login</Link>
                    )}
                </div>
            )}
        </nav>
    );
};
export default Navbar;
