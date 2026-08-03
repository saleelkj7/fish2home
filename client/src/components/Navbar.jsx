import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaFish } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { cart } = useContext(CartContext);
    const { isAuthenticated, logout } = useContext(AuthContext);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
            <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                    <span className="bg-teal-600 text-white p-2 rounded-xl"><FaFish /></span>
                    Fish<span className="text-teal-600 -ml-1">2</span>Home
                </Link>
                <div className="flex items-center gap-6 text-sm font-semibold text-slate-600">
                    <Link to="/" className="hover:text-teal-700 hidden md:block">Home</Link>
                    <Link to="/orders" className="hover:text-teal-700 hidden md:block">My Orders</Link>
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
