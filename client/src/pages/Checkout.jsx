import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const ALLOWED_PINCODES = ['400706', '400614', '400705'];

const Checkout = () => {
    const { getTotals, cart, clearCart } = useContext(CartContext);
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const [address, setAddress] = useState({ name: '', mobile: '', address: '', landmark: '', pincode: '', instructions: '' });
    const [pincodeError, setPincodeError] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [placing, setPlacing] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponResult, setCouponResult] = useState(null); // { valid, discountAmount, finalAmount, code }
    const [couponLoading, setCouponLoading] = useState(false);

    // No same-day delivery — fish is sourced fresh each morning, so the
    // earliest a customer can choose is tomorrow.
    const dates = [
        { label: 'Tomorrow', value: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
        { label: 'Day After Tomorrow', value: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] }
    ];

    useEffect(() => { if (!isAuthenticated) navigate('/login'); }, [isAuthenticated, navigate]);

    const handlePincodeChange = (e) => {
        const val = e.target.value;
        setAddress({...address, pincode: val});
        if (val.length === 6 && !ALLOWED_PINCODES.includes(val)) setPincodeError("We currently do not deliver to this location. Delivery extending soon.");
        else setPincodeError('');
    };

    useEffect(() => { if (selectedDate) axios.get(`/api/slots?date=${selectedDate}`).then(res => setSlots(res.data)); }, [selectedDate]);

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true); setCouponResult(null);
        try {
            const res = await axios.post('/api/coupons/validate', { code: couponCode, orderAmount: totals.total });
            setCouponResult(res.data);
        } catch (err) {
            setCouponResult({ valid: false, error: err.response?.data?.error || 'Invalid coupon' });
        } finally {
            setCouponLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (placing) return;
        setPlacing(true);
        try {
            const res = await axios.post('/api/orders', {
                addressData: address,
                deliverySlotId: selectedSlot.id,
                items: cart.map(c => ({ fishId: c.id, quantity: c.quantity })),
                couponCode: couponResult?.valid ? couponResult.code : undefined
            });
            clearCart();
            setPlacedOrder({ ...res.data.order, deliverySlot: selectedSlot, discountAmount: res.data.discountAmount });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    const totals = getTotals();

    if (placedOrder) {
        return (
            <div className="container mx-auto p-6 max-w-2xl">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-green-50 border-b border-green-100 p-8 text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Order Placed Successfully!</h2>
                        <p className="text-slate-600 mt-1">Order No: <span className="font-mono font-bold">{placedOrder.orderNumber}</span></p>
                    </div>

                    <div className="p-6">
                        <div className="mb-6 pb-6 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Delivery Date</h3>
                            <p className="text-slate-900 font-semibold">
                                {new Date(placedOrder.deliverySlot.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-slate-600 text-sm">{placedOrder.deliverySlot.label}</p>
                        </div>

                        <div className="mb-6 pb-6 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Items Ordered</h3>
                            {placedOrder.items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm mb-2">
                                    <span>{item.fish.name} × {item.quantity}kg</span>
                                    <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-lg font-bold text-slate-900">
                                <span>Total Payable</span>
                                <span>₹{placedOrder.totalAmount}</span>
                            </div>
                            {placedOrder.discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-700 font-semibold mt-1">
                                    <span>🎉 You saved</span>
                                    <span>Rs. {placedOrder.discountAmount}</span>
                                </div>
                            )}
                            <p className="text-sm text-amber-600 font-semibold mt-1">Pay via Cash or UPI when your order is delivered.</p>
                        </div>

                        <button onClick={() => navigate('/orders')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-teal-600 transition-colors">
                            View My Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Checkout</h2>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold mb-4">Delivery Address</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" required value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="p-2 border rounded" />
                    <input type="text" placeholder="Mobile" required value={address.mobile} onChange={e => setAddress({...address, mobile: e.target.value})} className="p-2 border rounded" />
                    <textarea placeholder="Address" required value={address.address} onChange={e => setAddress({...address, address: e.target.value})} className="p-2 border rounded col-span-2"></textarea>
                    <input type="text" placeholder="Landmark" value={address.landmark} onChange={e => setAddress({...address, landmark: e.target.value})} className="p-2 border rounded" />
                    <div>
                        <input type="text" placeholder="Pincode" maxLength={6} required value={address.pincode} onChange={handlePincodeChange} className="p-2 border rounded w-full" />
                        {pincodeError && <p className="text-red-500 text-sm mt-1">{pincodeError}</p>}
                    </div>
                </div>
            </div>

            {pincodeError === '' && address.pincode.length === 6 && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-xl font-semibold mb-4">Select Delivery Slot</h3>
                    <div className="flex space-x-4 mb-4">
                        {dates.map(d => (
                            <button key={d.value} onClick={() => setSelectedDate(d.value)} className={`px-4 py-2 rounded ${selectedDate === d.value ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{d.label}</button>
                        ))}
                    </div>
                    {selectedDate && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {slots.map(slot => (
                                <button key={slot.startTime} disabled={!slot.isAvailable} onClick={() => setSelectedSlot(slot)}
                                    className={`p-4 border rounded-lg text-center transition ${selectedSlot?.startTime === slot.startTime ? 'border-blue-600 bg-blue-50' : ''} ${!slot.isAvailable ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:border-blue-600'}`}>
                                    <div className="font-bold">{slot.label}</div>
                                    {slot.isFull && <div className="text-xs text-red-500">FULL</div>}
                                    {slot.isTimePassed && <div className="text-xs text-gray-500">Time Passed</div>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                {/* Coupon code input */}
                <div className="mb-4">
                    <p className="text-sm font-bold text-slate-700 mb-2">Have a coupon code?</p>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Enter code" value={couponCode}
                            onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
                            className="flex-1 p-2 border rounded text-sm font-mono uppercase" />
                        <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                            className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-bold hover:bg-teal-600 disabled:opacity-50">
                            {couponLoading ? '...' : 'Apply'}
                        </button>
                    </div>
                    {couponResult && (
                        <p className={`mt-1.5 text-sm font-semibold ${couponResult.valid ? 'text-green-700' : 'text-red-600'}`}>
                            {couponResult.valid ? `✅ ${couponResult.discountPercentage}% off applied — You save Rs. ${couponResult.discountAmount}` : `❌ ${couponResult.error}`}
                        </p>
                    )}
                </div>

                <div className="border-t border-blue-200 pt-4">
                    <div className="flex justify-between text-base mb-1"><span className="text-slate-600">Subtotal + GST</span><span>Rs. {totals.total.toFixed(2)}</span></div>
                    {couponResult?.valid && (
                        <div className="flex justify-between text-base mb-1 text-green-700 font-semibold"><span>Coupon Discount ({couponResult.code})</span><span>- Rs. {couponResult.discountAmount}</span></div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-slate-900 mt-2">
                        <span>Total Payable</span>
                        <span>Rs. {couponResult?.valid ? couponResult.finalAmount.toFixed(2) : totals.total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded my-4 border border-blue-200">
                    <p className="text-sm text-gray-700">Pay the full amount via <span className="font-bold">Cash or UPI</span> when your order is delivered — no payment needed now.</p>
                </div>
                <button onClick={handlePlaceOrder} disabled={!selectedSlot || pincodeError !== '' || placing} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-400">
                    {placing ? 'Placing Order...' : 'Place Order'}
                </button>
            </div>
        </div>
    );
};
export default Checkout;
