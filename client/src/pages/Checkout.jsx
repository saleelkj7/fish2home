import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
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
    const [showPayment, setShowPayment] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [upiRef, setUpiRef] = useState('');

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

    const handlePlaceOrder = async () => {
        try {
            const res = await axios.post('/api/orders', {
                addressData: address,
                deliverySlotId: selectedSlot.id,
                items: cart.map(c => ({ fishId: c.id, quantity: c.quantity }))
            });
            setOrderData(res.data);
            setShowPayment(true);
        } catch (err) { alert(err.response?.data?.error || 'Failed to place order'); }
    };

    const handleVerifyPayment = () => {
        if(upiRef.length < 6) return alert('Enter valid UPI Reference Number');
        alert('Payment Verified! Order Placed Successfully.');
        clearCart();
        navigate('/orders');
    };

    const totals = getTotals();

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
                <div className="flex justify-between text-xl font-bold mb-4"><span>Total Payable:</span><span>₹{totals.total.toFixed(2)}</span></div>
                <div className="bg-white p-4 rounded mb-6 border border-blue-200">
                    <p className="text-sm">Advance Payment Required (25%): <span className="font-bold text-blue-800">₹{totals.advance.toFixed(2)}</span></p>
                    <p className="text-sm text-gray-600">Balance (Cash/UPI on Delivery): ₹{totals.balance.toFixed(2)}</p>
                </div>
                <button onClick={handlePlaceOrder} disabled={!selectedSlot || pincodeError !== ''} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-400">
                    Proceed to Pay ₹{totals.advance.toFixed(2)} Advance
                </button>
            </div>

            {showPayment && orderData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Complete Advance Payment</h2>
                        <p className="text-gray-600 mb-6">Scan the QR code with any UPI app to pay 25% advance.</p>
                        <div className="bg-gray-100 p-4 rounded-lg mb-4 inline-block">
                            <QRCodeSVG value={`upi://pay?pa=${orderData.upiId}&pn=Fishtokri&am=${orderData.advanceAmount}&cu=INR&tn=${orderData.order.orderNumber}`} size={200} />
                        </div>
                        <div className="mb-6">
                            <p className="text-sm text-gray-500">UPI ID</p>
                            <p className="font-bold text-lg text-blue-600">{orderData.upiId}</p>
                            <p className="font-bold text-2xl text-green-600 mt-2">₹{orderData.advanceAmount}</p>
                        </div>
                        <input type="text" placeholder="Enter UPI Transaction Reference No." value={upiRef} onChange={e => setUpiRef(e.target.value)} className="w-full p-3 border rounded mb-4" />
                        <button onClick={handleVerifyPayment} className="w-full bg-orange-500 text-white py-3 rounded font-bold">Verify Payment & Place Order</button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Checkout;
