import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [pendingStatuses, setPendingStatuses] = useState({});
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            navigate('/login');
            return;
        }
        axios.get('/api/orders/all').then(res => setOrders(res.data));
    }, [isAuthenticated, user, navigate]);

    const handleStatusSelect = (id, status) => {
        setPendingStatuses({ ...pendingStatuses, [id]: status });
    };

    const saveStatus = async (id) => {
        const newStatus = pendingStatuses[id];
        if (!newStatus) return;
        try {
            await axios.put(`/api/orders/${id}/status`, { status: newStatus });
            setOrders(orders.map(o => o.id === id ? { ...o, orderStatus: newStatus } : o));
            const { [id]: _, ...rest } = pendingStatuses;
            setPendingStatuses(rest);
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingPayments = orders.filter(o => o.paymentStatus !== 'FULLY_PAID').length;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-bold uppercase">Total Orders</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{orders.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-bold uppercase">Total Revenue</h3>
                    <p className="text-3xl font-bold text-teal-600 mt-2">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-bold uppercase">Pending Payments</h3>
                    <p className="text-3xl font-bold text-amber-600 mt-2">{pendingPayments}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Order Management</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Current Status</th>
                                <th className="p-4">Update Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-mono text-xs">{order.orderNumber}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{order.user.firstName}</div>
                                        <div className="text-slate-500 text-xs">{order.address.mobile}</div>
                                    </td>
                                    <td className="p-4 font-bold">₹{order.totalAmount}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold
                                            ${order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                                              order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                                              'bg-amber-100 text-amber-800'}`}>
                                            {order.orderStatus.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <select 
                                                defaultValue={order.orderStatus}
                                                onChange={(e) => handleStatusSelect(order.id, e.target.value)}
                                                className="p-2 border rounded text-xs bg-white focus:ring-teal-500 focus:border-teal-500"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="CONFIRMED">Confirmed</option>
                                                <option value="CLEANING">Cleaning</option>
                                                <option value="PACKED">Packed</option>
                                                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                            <button 
                                                onClick={() => saveStatus(order.id)}
                                                className="bg-teal-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
                                                disabled={!pendingStatuses[order.id]}
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;
