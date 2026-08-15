import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const POPULAR = ['Mackerel (Bangda)', 'Mud Crab', 'Pomfret (White)', 'Surmai (King Fish)'];
const NEW_ARRIVALS = ['Surmai (King Fish)', 'Bombil (Bombay Duck)'];

const wLabel = (w) => (w < 1 ? `${w * 1000} g` : `${w} kg`);
const weightOptions = (name) => (name.includes('Crab') ? [0.5, 1, 2] : name.includes('Bombil') ? [0.25, 0.5, 1] : [0.25, 0.5, 1, 2]);

const Home = () => {
    const [fishes, setFishes] = useState([]);
    const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'error'
    const [tab, setTab] = useState('all');
    const [weights, setWeights] = useState({});
    const [checkPin, setCheckPin] = useState('');
    const [checkMsg, setCheckMsg] = useState(null);
    const { addToCart } = useContext(CartContext);
    const { isAuthenticated } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState(new Set());

    useEffect(() => {
        if (isAuthenticated) {
            axios.get('/api/wishlist').then(res => {
                setWishlist(new Set(res.data.map(w => w.fishId)));
            }).catch(() => {});
        }
    }, [isAuthenticated]);

    const toggleWishlist = async (fish) => {
        if (!isAuthenticated) return;
        if (wishlist.has(fish.id)) {
            await axios.delete(`/api/wishlist/${fish.id}`).catch(() => {});
            setWishlist(prev => { const s = new Set(prev); s.delete(fish.id); return s; });
        } else {
            await axios.post('/api/wishlist', { fishId: fish.id }).catch(() => {});
            setWishlist(prev => new Set([...prev, fish.id]));
        }
    };

    const fetchFishes = async (attempt = 1) => {
        try {
            const res = await axios.get('/api/fishes', { timeout: 60000 });
            setFishes(res.data);
            setLoadState('ready');
        } catch (err) {
            // Render's free tier sleeps when idle, and Neon's database can
            // also go cold — the very first request after a quiet period
            // can fail while both wake up. Retry a few times before giving up.
            if (attempt < 4) {
                setTimeout(() => fetchFishes(attempt + 1), 4000);
            } else {
                setLoadState('error');
            }
        }
    };

    useEffect(() => { fetchFishes(); }, []);

    const filtered = fishes.filter(f =>
        tab === 'popular' ? POPULAR.includes(f.name) : tab === 'new' ? NEW_ARRIVALS.includes(f.name) : true
    );

    const checkDelivery = () => {
        if (['400706', '400614', '400705'].includes(checkPin)) setCheckMsg({ ok: true, text: 'Great news! We deliver to your area.' });
        else setCheckMsg({ ok: false, text: 'We currently do not deliver to this location. Delivery extending soon.' });
    };

    return (
        <div className="bg-slate-50">
            {/* ============ HERO ============ */}
            <section className="relative min-h-[520px] flex items-center"
                style={{ backgroundImage: 'url(/images/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-900/40"></div>
                <div className="relative container mx-auto px-6 py-20 text-white">
                    <p className="text-teal-300 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4">Today's catch · landed this morning</p>
                    <h1 className="font-display text-4xl md:text-6xl font-bold max-w-3xl leading-[1.05] mb-5">
                        Fresh fish from the coast, cleaned exactly how you like it.
                    </h1>
                    <p className="text-slate-300 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
                        Bangda, Surmai, Pomfret, Bombil and live crab — sourced daily from Navi Mumbai's boats and delivered to your kitchen the next day, cleaned exactly how you like it.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="#delivery" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-7 py-3.5 rounded-full transition-all shadow-lg shadow-teal-500/25">Check delivery in your area</a>
                        <a href="#catch" className="border border-white/30 bg-white/5 hover:bg-white/15 backdrop-blur font-bold px-7 py-3.5 rounded-full transition-all">Browse today's catch</a>
                    </div>
                </div>
            </section>

            {/* ============ FEATURE STRIP ============ */}
            <section className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-start gap-4">
                        <span className="text-3xl">🕒</span>
                        <div><h3 className="font-bold text-slate-900">Next-day delivery slots</h3><p className="text-sm text-slate-500 mt-1">7–10 AM, 10 AM–1 PM, 1–4 PM, 4–7 PM</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                        <span className="text-3xl">🧊</span>
                        <div><h3 className="font-bold text-slate-900">Ice-packed delivery</h3><p className="text-sm text-slate-500 mt-1">Sealed, chilled, never frozen</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                        <span className="text-3xl">🔪</span>
                        <div><h3 className="font-bold text-slate-900">Cleaned to order</h3><p className="text-sm text-slate-500 mt-1">Whole, gutted, curry cut or fillet</p></div>
                    </div>
                </div>
            </section>

            {/* ============ TODAY'S CATCH ============ */}
            <section id="catch" className="container mx-auto px-6 py-14">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">Today's catch</h2>
                        <p className="text-sm text-slate-500 mt-2">Minimum order ₹500 · prices per kilogram, billed on chosen weight</p>
                    </div>
                    <div className="flex gap-2">
                        {[{ id: 'all', label: 'All catch' }, { id: 'popular', label: 'Popular' }, { id: 'new', label: 'New arrivals' }].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === t.id ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-500'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loadState === 'loading' && (
                    <div className="text-center py-16 text-slate-400">
                        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p>Loading today's catch — this can take up to a minute if the site's been quiet a while.</p>
                    </div>
                )}
                {loadState === 'error' && (
                    <div className="text-center py-16">
                        <p className="text-slate-500 mb-4">Couldn't load today's catch right now.</p>
                        <button onClick={() => { setLoadState('loading'); fetchFishes(); }} className="bg-slate-900 text-white px-5 py-2 rounded-full font-bold hover:bg-teal-600">Try Again</button>
                    </div>
                )}
                {loadState === 'ready' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(fish => {
                        const w = weights[fish.id] || null;
                        return (
                            <div key={fish.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
                                <div className="relative h-44 overflow-hidden">
                                    <img src={fish.image} alt={fish.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/default-fish.jpg'; }} />
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                    {isAuthenticated && (
                                        <button onClick={() => toggleWishlist(fish)} className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white shadow transition-colors" aria-label="Toggle wishlist">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-5 h-5 ${wishlist.has(fish.id) ? 'fill-red-500 text-red-500' : 'fill-none text-slate-400'}`} stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                            </svg>
                                        </button>
                                    )}
                                        <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow">{fish.freshness || 'Fresh Today'}</span>
                                        {POPULAR.includes(fish.name) && <span className="bg-amber-400 text-slate-900 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow">Popular</span>}
                                        {NEW_ARRIVALS.includes(fish.name) && <span className="bg-sky-500 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow">New arrival</span>}
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="font-bold text-lg text-slate-900">{fish.name}</h3>
                                        <p className="text-right"><span className="font-extrabold text-slate-900">₹{fish.price.toLocaleString('en-IN')}</span><span className="text-xs text-slate-500 block -mt-0.5">per kg</span></p>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{fish.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {weightOptions(fish.name).map(opt => (
                                            <button key={opt} onClick={() => setWeights({ ...weights, [fish.id]: opt })}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${w === opt ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-teal-500'}`}>
                                                {wLabel(opt)}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => w && addToCart({ ...fish, quantity: w })}
                                        disabled={!w || fish.stock === 0}
                                        className="w-full py-2.5 rounded-full font-bold text-sm transition-all bg-slate-900 text-white hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
                                        {fish.stock === 0 ? 'Out of Stock' : w ? `Add to Cart · ₹${(fish.price * w).toLocaleString('en-IN')}` : 'Choose weight'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                )}
            </section>

            {/* ============ DELIVERY CHECKER ============ */}
            <section id="delivery" className="relative py-20"
                style={{ backgroundImage: 'url(/images/boat.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-slate-950/75"></div>
                <div className="relative container mx-auto px-6 text-center text-white">
                    <h3 className="font-display text-3xl md:text-4xl font-bold mb-3">Sourced daily from Navi Mumbai's boats</h3>
                    <p className="text-slate-300 mb-8 max-w-xl mx-auto">Delivering to Nerul (400706), Belapur (400614) & Juinagar (400705). More areas soon.</p>
                    <div className="max-w-md mx-auto flex gap-2">
                        <input type="text" maxLength={6} placeholder="Enter your pincode" value={checkPin}
                            onChange={e => setCheckPin(e.target.value)}
                            className="flex-1 p-3.5 rounded-full text-slate-900 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" />
                        <button onClick={checkDelivery} className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-7 py-3.5 rounded-full font-bold transition-all">Check</button>
                    </div>
                    {checkMsg && <p className={`mt-5 font-bold ${checkMsg.ok ? 'text-teal-300' : 'text-red-300'}`}>{checkMsg.text}</p>}
                </div>
            </section>
        </div>
    );
};
export default Home;
