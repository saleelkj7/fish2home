import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Cart = () => {
    const { cart, updateQuantity, getTotals } = useContext(CartContext);
    const totals = getTotals();

    if (cart.length === 0) return <div className="container mx-auto p-6 text-center"><h2 className="text-2xl">Your cart is empty</h2><Link to="/" className="text-blue-600">Continue Shopping</Link></div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b py-4">
                        <div>
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-gray-600">₹{item.price} / kg</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 bg-gray-200 rounded">-</button>
                            <span className="font-bold">{item.quantity} kg</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 bg-gray-200 rounded">+</button>
                            <span className="font-bold w-24 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                <div className="flex justify-between mb-2"><span>Subtotal:</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between mb-2"><span>GST (5%):</span><span>₹{totals.gst.toFixed(2)}</span></div>
                <div className="flex justify-between text-xl font-bold border-t pt-2 mb-4"><span>Total:</span><span>₹{totals.total.toFixed(2)}</span></div>
                <div className="bg-white p-4 rounded mb-4 border border-blue-200">
                    <p className="text-sm text-gray-600">Advance Payment Required (25%): <span className="font-bold text-blue-800">₹{totals.advance.toFixed(2)}</span></p>
                    <p className="text-sm text-gray-600">Balance (Cash/UPI on Delivery): <span className="font-bold">₹{totals.balance.toFixed(2)}</span></p>
                </div>
                <Link to="/checkout" className="block w-full bg-green-600 text-white py-3 rounded-lg font-bold text-center hover:bg-green-700">Proceed to Checkout</Link>
            </div>
        </div>
    );
};
export default Cart;
