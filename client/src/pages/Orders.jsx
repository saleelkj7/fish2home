import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { SettingsContext } from '../context/SettingsContext';

const UPI_ID = 'vaibhav@icici';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [qrOpenFor, setQrOpenFor] = useState(null);
    const { isAuthenticated } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const { siteName } = useContext(SettingsContext);
    const navigate = useNavigate();

    const repeatOrder = (order) => {
        order.items.forEach(item => addToCart({ ...item.fish, quantity: item.quantity }));
        navigate('/cart');
    };

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }

        const fetchOrders = () => {
            axios.get('/api/orders/my-orders').then(res => setOrders(res.data));
        };

        fetchOrders();

        // Auto-poll every 5 seconds to get real-time status updates from Admin
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated, navigate]);

    const downloadInvoice = async (order) => {
        try {
            const res = await axios.get(order.invoiceUrl, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `INV-${order.orderNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to download invoice. Please try again.');
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Orders</h2>
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Auto-updating status...
                </span>
            </div>

            {orders.length === 0 ? <p className="text-center text-gray-500">You haven't placed any orders yet.</p> : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const isPaid = order.paymentStatus === 'FULLY_PAID';
                        return (
                        <div key={order.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                                    <p className="text-sm text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-600 mt-1">Delivery: {new Date(order.deliverySlot.date).toLocaleDateString()} ({order.deliverySlot.startTime}:00 - {order.deliverySlot.endTime}:00)</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold
                                    ${order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                      order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                      'bg-amber-100 text-amber-800'}`}>
                                    {order.orderStatus.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="border-t pt-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm mb-1">
                                        <span>{item.fish.name} x {item.quantity}kg</span>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                <div className="text-sm">
                                    {isPaid ? (
                                        <p className="text-green-600 font-bold">✓ Paid</p>
                                    ) : (
                                        <>
                                            <p className="text-amber-600 font-bold">Due at Delivery (Cash or UPI): ₹{order.balanceAmount}</p>
                                            <button onClick={() => setQrOpenFor(qrOpenFor === order.id ? null : order.id)} className="text-teal-600 text-xs font-semibold hover:underline mt-1">
                                                {qrOpenFor === order.id ? 'Hide UPI QR' : 'Pay via UPI now'}
                                            </button>
                                        </>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">Total: ₹{order.totalAmount}</p>
                                    {order.invoiceUrl && <button onClick={() => downloadInvoice(order)} className="text-teal-600 text-sm hover:underline">Download Invoice</button>}
                                    <button onClick={() => repeatOrder(order)} className="text-slate-600 text-sm hover:underline font-semibold">🔁 Repeat Order</button>
                                </div>
                            </div>
                            {qrOpenFor === order.id && !isPaid && (
                                <div className="mt-4 pt-4 border-t text-center">
                                    <div className="bg-gray-50 p-4 rounded-lg inline-block">
                                        <QRCodeSVG value={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(siteName)}&am=${order.totalAmount}&cu=INR&tn=${order.orderNumber}`} size={180} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Scan with any UPI app · {UPI_ID}</p>
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
export default Orders;
