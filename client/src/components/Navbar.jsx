import { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';

const Navbar = () => {
    const { cart } = useContext(CartContext);
    const { user, isAuthenticated, logout } = useContext(AuthContext);
    const { siteName, logoUrl } = useContext(SettingsContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const avatarRef = useRef(null);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const close = () => setMenuOpen(false);
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

    // Close avatar dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => { if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
            <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2" onClick={close}>
                    <img src={logoUrl || '/images/logo.png'} alt={siteName} className="h-14 w-auto py-1" />
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
                    <Link to="/" className="hover:text-teal-700">Home</Link>
                    {isAuthenticated && user?.role !== 'ADMIN' && (
                        <Link to="/wishlist" className="hover:text-teal-700">Wishlist</Link>
                    )}
                    {isAuthenticated && user?.role !== 'ADMIN' && (
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
                        // Avatar dropdown
                        <div className="relative" ref={avatarRef}>
                            <button onClick={() => setAvatarOpen(!avatarOpen)}
                                className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center hover:bg-teal-700 transition-colors shadow"
                                aria-label="Account menu">
                                {initial}
                            </button>
                            {avatarOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-xs text-slate-400">Signed in as</p>
                                        <p className="font-bold text-slate-800 truncate text-sm">{user.name}</p>
                                    </div>
                                    {user.role !== 'ADMIN' && (
                                        <Link to="/orders" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                            My Orders
                                        </Link>
                                    )}
                                    {user.role !== 'ADMIN' && (
                                        <Link to="/wishlist" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                            My Wishlist
                                        </Link>
                                    )}
                                    <button onClick={() => { logout(); setAvatarOpen(false); }}
                                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100 mt-1">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors">Login</Link>
                    )}
                </div>

                {/* Mobile: cart + hamburger */}
                <div className="flex md:hidden items-center gap-3">
                    <Link to="/cart" className="relative flex items-center gap-1 bg-slate-900 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                        Cart
                        {itemCount > 0 && <span className="bg-teal-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-bold">{itemCount}</span>}
                    </Link>
                    {isAuthenticated && (
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center">{initial}</div>
                    )}
                    <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" className="p-2 text-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 flex flex-col gap-4 text-sm font-semibold text-slate-700">
                    {isAuthenticated && (
                        <p className="text-xs text-slate-400 -mb-2">Signed in as <span className="font-bold text-slate-600">{user?.name}</span></p>
                    )}
                    <Link to="/" onClick={close} className="hover:text-teal-700">Home</Link>
                    {isAuthenticated && user?.role !== 'ADMIN' && (
                        <Link to="/wishlist" onClick={close} className="hover:text-teal-700">Wishlist</Link>
                    )}
                    {isAuthenticated && user?.role !== 'ADMIN' && (
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
