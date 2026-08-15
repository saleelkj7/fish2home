import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const wLabel = (w) => (w < 1 ? `${w * 1000} g` : `${w} kg`);
const weightOptions = (name) => (name.includes('Crab') ? [0.5, 1, 2] : name.includes('Bombil') ? [0.25, 0.5, 1] : [0.25, 0.5, 1, 2]);

const Wishlist = () => {
    const [items, setItems] = useState([]);
    const [weights, setWeights] = useState({});
    const { isAuthenticated } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }
        axios.get('/api/wishlist').then(res => setItems(res.data));
    }, [isAuthenticated, navigate]);

    const remove = async (fishId) => {
        await axios.delete(`/api/wishlist/${fishId}`);
        setItems(items.filter(i => i.fishId !== fishId));
    };

    const handleAddToCart = (fish) => {
        const w = weights[fish.id];
        if (!w) return alert('Please select a weight first');
        addToCart({ ...fish, quantity: w });
    };

    if (items.length === 0) return (
        <div className="container mx-auto p-6 max-w-2xl text-center py-20">
            <p className="text-4xl mb-4">🤍</p>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your wishlist is empty</h2>
            <p className="text-slate-500 mb-6">Save your favourite fish to order them quickly next time.</p>
            <Link to="/" className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-600 transition-colors">Browse Today's Catch</Link>
        </div>
    );

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(({ fish }) => {
                    const w = weights[fish.id];
                    const opts = weightOptions(fish.name);
                    return (
                        <div key={fish.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="relative h-40">
                                <img src={fish.image} alt={fish.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/default-fish.jpg'; }} />
                                <button onClick={() => remove(fish.id)} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow" aria-label="Remove from wishlist">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-red-500 text-red-500" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900">{fish.name}</h3>
                                <p className="text-teal-600 font-bold text-sm mb-3">Rs. {fish.price}/kg</p>
                                {fish.stock === 0 ? (
                                    <p className="text-red-500 text-sm font-semibold">Out of Stock</p>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {opts.map(opt => (
                                                <button key={opt} onClick={() => setWeights({ ...weights, [fish.id]: opt })}
                                                    className={`px-2 py-1 rounded text-xs font-semibold border ${w === opt ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:border-teal-500'}`}>
                                                    {wLabel(opt)}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => handleAddToCart(fish)} disabled={!w}
                                            className="w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors">
                                            {w ? `Add to Cart · Rs. ${(fish.price * w).toLocaleString('en-IN')}` : 'Choose weight'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default Wishlist;
