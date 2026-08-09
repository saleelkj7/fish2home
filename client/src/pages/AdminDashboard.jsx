import { useState, useEffect, useContext, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CLEANING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

const dateOnly = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
const todayStr = () => dateOnly(new Date());
const tomorrowStr = () => dateOnly(new Date(Date.now() + 86400000));
const dayAfterStr = () => dateOnly(new Date(Date.now() + 2 * 86400000));

const AdminDashboard = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tab, setTab] = useState('orders');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') navigate('/login');
    }, [isAuthenticated, user, navigate]);

    if (!isAuthenticated || user?.role !== 'ADMIN') return null;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-slate-900">Admin Dashboard</h1>
            <div className="flex gap-2 mb-8 border-b border-slate-200">
                {[
                    { id: 'orders', label: 'Orders' },
                    { id: 'fish', label: 'Fish Management' },
                    { id: 'users', label: 'User Management' }
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-5 py-3 font-bold text-sm border-b-2 transition-colors ${tab === t.id ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'orders' && <OrdersTab />}
            {tab === 'fish' && <FishTab />}
            {tab === 'users' && <UsersTab />}
        </div>
    );
};

// ==================== ORDERS TAB ====================
const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [pendingStatuses, setPendingStatuses] = useState({});
    const [dateFilter, setDateFilter] = useState('ALL');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => { axios.get('/api/orders/all').then(res => setOrders(res.data)); }, []);

    const handleStatusSelect = (id, status) => setPendingStatuses({ ...pendingStatuses, [id]: status });

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

    const markPaid = async (id) => {
        try {
            await axios.put(`/api/orders/${id}/payment-status`, { paymentStatus: 'FULLY_PAID' });
            setOrders(orders.map(o => o.id === id ? { ...o, paymentStatus: 'FULLY_PAID' } : o));
        } catch (err) {
            alert('Failed to update payment status');
        }
    };

    const deleteOrder = async (order) => {
        if (!confirm(`Delete order ${order.orderNumber}? This restores stock and cannot be undone.`)) return;
        try {
            await axios.delete(`/api/orders/${order.id}`);
            setOrders(orders.filter(o => o.id !== order.id));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete order');
        }
    };

    const downloadInvoice = async (order) => {
        try {
            const res = await axios.get(`/api/orders/${order.id}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `INV-${order.orderNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to download invoice');
        }
    };

    const filteredOrders = orders.filter(o => {
        if (dateFilter === 'ALL') return true;
        const slotDate = o.deliverySlot ? dateOnly(o.deliverySlot.date) : null;
        if (dateFilter === 'TODAY') return slotDate === todayStr();
        if (dateFilter === 'TOMORROW') return slotDate === tomorrowStr();
        if (dateFilter === 'DAY_AFTER') return slotDate === dayAfterStr();
        return true;
    });

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingPayments = filteredOrders.filter(o => o.paymentStatus !== 'FULLY_PAID').length;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-bold uppercase">Orders (filtered)</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{filteredOrders.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-bold uppercase">Revenue (filtered)</h3>
                    <p className="text-3xl font-bold text-teal-600 mt-2">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-bold uppercase">Pending Payments</h3>
                    <p className="text-3xl font-bold text-amber-600 mt-2">{pendingPayments}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Order Management</h2>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-slate-600">Delivery date:</label>
                        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="p-2 border rounded text-sm bg-white">
                            <option value="TODAY">Today</option>
                            <option value="TOMORROW">Tomorrow</option>
                            <option value="DAY_AFTER">Day After Tomorrow</option>
                            <option value="ALL">All</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Delivery Date</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Current Status</th>
                                <th className="p-4">Update Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredOrders.map(order => (
                                <Fragment key={order.id}>
                                <tr className="hover:bg-slate-50">
                                    <td className="p-4 font-mono text-xs">{order.orderNumber}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{order.user.firstName}</div>
                                        <div className="text-slate-500 text-xs">{order.address.mobile}</div>
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)} className="text-teal-600 font-bold hover:underline text-xs">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} {expandedOrderId === order.id ? '▲' : '▼'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-xs">
                                        {order.deliverySlot ? new Date(order.deliverySlot.date).toLocaleDateString('en-IN') : '—'}
                                    </td>
                                    <td className="p-4 font-bold">₹{order.totalAmount}</td>
                                    <td className="p-4">
                                        {order.paymentStatus === 'FULLY_PAID' ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">Paid</span>
                                        ) : (
                                            <button onClick={() => markPaid(order.id)} className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors">
                                                Mark Paid (Cash/UPI)
                                            </button>
                                        )}
                                    </td>
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
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
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
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5">
                                            <button onClick={() => downloadInvoice(order)} className="text-teal-600 font-bold hover:underline text-xs text-left">Invoice</button>
                                            <button onClick={() => deleteOrder(order)} className="text-red-600 font-bold hover:underline text-xs text-left">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedOrderId === order.id && (
                                    <tr className="bg-slate-50">
                                        <td colSpan={9} className="p-4">
                                            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Order Items</div>
                                            <table className="w-full text-sm">
                                                <tbody>
                                                    {order.items.map(item => (
                                                        <tr key={item.id} className="border-b border-slate-200 last:border-0">
                                                            <td className="py-1.5">{item.fish.name}</td>
                                                            <td className="py-1.5 text-slate-500">{item.quantity}kg × ₹{item.price}</td>
                                                            <td className="py-1.5 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="text-xs text-slate-500 mt-2">
                                                Delivery address: {order.address.address}, {order.address.landmark ? `${order.address.landmark}, ` : ''}{order.address.pincode}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </Fragment>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr><td colSpan={9} className="p-8 text-center text-slate-400">No orders for this filter.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

// ==================== FISH MANAGEMENT TAB ====================
const emptyFishForm = { name: '', scientificName: '', price: '', stock: '', description: '', freshness: '', categoryId: '', categoryName: '', image: null };

const FishTab = () => {
    const [fishes, setFishes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyFishForm);
    const [editingId, setEditingId] = useState(null);
    const [msg, setMsg] = useState('');
    const [saving, setSaving] = useState(false);

    const load = () => {
        axios.get('/api/fishes').then(res => setFishes(res.data));
        axios.get('/api/fishes/categories').then(res => setCategories(res.data));
    };
    useEffect(load, []);

    const resetForm = () => { setForm(emptyFishForm); setEditingId(null); };

    const startEdit = (fish) => {
        setEditingId(fish.id);
        setForm({
            name: fish.name, scientificName: fish.scientificName || '', price: fish.price,
            stock: fish.stock, description: fish.description || '', freshness: fish.freshness || '',
            categoryId: fish.categoryId, categoryName: '', image: null
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg('');
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('scientificName', form.scientificName);
            fd.append('price', form.price);
            fd.append('stock', form.stock);
            fd.append('description', form.description);
            fd.append('freshness', form.freshness);
            if (form.categoryId) fd.append('categoryId', form.categoryId);
            if (form.categoryName) fd.append('categoryName', form.categoryName);
            if (form.image) fd.append('image', form.image);

            if (editingId) {
                await axios.put(`/api/fishes/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                setMsg('Fish updated.');
            } else {
                await axios.post('/api/fishes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                setMsg('Fish added.');
            }
            resetForm();
            load();
        } catch (err) {
            setMsg('Error: ' + (err.response?.data?.error || 'Failed to save fish.'));
        } finally {
            setSaving(false);
        }
    };

    const toggleStockZero = async (fish) => {
        try {
            await axios.put(`/api/fishes/${fish.id}`, { stock: fish.stock > 0 ? 0 : 10 });
            load();
        } catch { alert('Failed to update stock'); }
    };

    const updateStockValue = async (fish, value) => {
        try {
            await axios.put(`/api/fishes/${fish.id}`, { stock: value });
            load();
        } catch { alert('Failed to update stock'); }
    };

    const updatePriceValue = async (fish, value) => {
        try {
            await axios.put(`/api/fishes/${fish.id}`, { price: value });
            load();
        } catch { alert('Failed to update price'); }
    };

    const deleteFish = async (id) => {
        if (!confirm('Delete this fish? This cannot be undone.')) return;
        try {
            await axios.delete(`/api/fishes/${id}`);
            load();
        } catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{editingId ? 'Edit Fish' : 'Add New Fish'}</h2>
                {msg && <p className="mb-4 text-sm font-semibold">{msg}</p>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="p-2 border rounded" />
                    <input type="text" placeholder="Scientific name (optional)" value={form.scientificName} onChange={e => setForm({ ...form, scientificName: e.target.value })} className="p-2 border rounded" />
                    <input type="number" step="0.01" placeholder="Price (per kg)" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="p-2 border rounded" />
                    <input type="number" placeholder="Stock" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="p-2 border rounded" />
                    <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value, categoryName: '' })} className="p-2 border rounded">
                        <option value="">Select existing category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="text" placeholder="Or type a new category name" value={form.categoryName} onChange={e => setForm({ ...form, categoryName: e.target.value, categoryId: '' })} className="p-2 border rounded" />
                    <input type="text" placeholder="Freshness label (e.g. 'Fresh Today')" value={form.freshness} onChange={e => setForm({ ...form, freshness: e.target.value })} className="p-2 border rounded md:col-span-2" />
                    <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="p-2 border rounded md:col-span-2"></textarea>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Fish photo (JPG only{editingId ? ' — leave blank to keep current image' : ''})</label>
                        <input type="file" accept="image/jpeg" onChange={e => setForm({ ...form, image: e.target.files[0] })} className="text-sm" />
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                        <button type="submit" disabled={saving} className="bg-teal-600 text-white px-5 py-2 rounded font-bold hover:bg-teal-700 disabled:opacity-50">
                            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Fish'}
                        </button>
                        {editingId && <button type="button" onClick={resetForm} className="bg-slate-200 text-slate-700 px-5 py-2 rounded font-bold hover:bg-slate-300">Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">All Fish</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Photo</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price/kg</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Availability</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {fishes.map(fish => (
                                <tr key={fish.id} className="hover:bg-slate-50">
                                    <td className="p-4"><img src={fish.image} alt={fish.name} className="w-12 h-12 rounded object-cover" /></td>
                                    <td className="p-4 font-bold text-slate-900">{fish.name}</td>
                                    <td className="p-4 text-slate-500">{fish.category?.name}</td>
                                    <td className="p-4">
                                        <input type="number" step="0.01" defaultValue={fish.price}
                                            onBlur={e => e.target.value != fish.price && updatePriceValue(fish, e.target.value)}
                                            className="w-24 p-1.5 border rounded" />
                                    </td>
                                    <td className="p-4">
                                        <input type="number" defaultValue={fish.stock}
                                            onBlur={e => e.target.value != fish.stock && updateStockValue(fish, e.target.value)}
                                            className="w-20 p-1.5 border rounded" />
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => toggleStockZero(fish)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold ${fish.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {fish.stock === 0 ? 'Out of Stock' : 'In Stock'}
                                        </button>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => startEdit(fish)} className="text-teal-600 font-bold hover:underline text-xs">Edit</button>
                                        <button onClick={() => deleteFish(fish.id)} className="text-red-600 font-bold hover:underline text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

// ==================== USER MANAGEMENT TAB ====================
const emptyUserForm = { firstName: '', lastName: '', email: '', mobile: '', password: '', role: 'CUSTOMER' };

const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(emptyUserForm);
    const [msg, setMsg] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // { id, firstName, lastName, email, mobile }

    const load = () => axios.get('/api/auth/users').then(res => setUsers(res.data));
    useEffect(load, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg('');
        try {
            await axios.post('/api/auth/users', form);
            setMsg('User created.');
            setForm(emptyUserForm);
            load();
        } catch (err) {
            setMsg('Error: ' + (err.response?.data?.error || 'Failed to create user.'));
        } finally {
            setSaving(false);
        }
    };

    const toggleRole = async (u) => {
        const newRole = u.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
        if (!confirm(`Change ${u.email} to ${newRole}?`)) return;
        try {
            await axios.put(`/api/auth/users/${u.id}/role`, { role: newRole });
            load();
        } catch { alert('Failed to update role'); }
    };

    const toggleActive = async (u) => {
        const nextActive = !u.isActive;
        if (!confirm(`${nextActive ? 'Reactivate' : 'Deactivate'} ${u.email}?`)) return;
        try {
            await axios.put(`/api/auth/users/${u.id}/active`, { isActive: nextActive });
            load();
        } catch { alert('Failed to update account status'); }
    };

    const deleteUserRow = async (u) => {
        if (!confirm(`Permanently delete ${u.email}? This only works if they have no order history.`)) return;
        try {
            await axios.delete(`/api/auth/users/${u.id}`);
            load();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const startEdit = (u) => setEditingUser({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, mobile: u.mobile });

    const saveEdit = async () => {
        try {
            await axios.put(`/api/auth/users/${editingUser.id}`, editingUser);
            setEditingUser(null);
            load();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save changes');
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Add New User</h2>
                <p className="text-xs text-slate-500 mb-4">Users created here skip email verification and are active immediately.</p>
                {msg && <p className="mb-4 text-sm font-semibold">{msg}</p>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="First name" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="p-2 border rounded" />
                    <input type="text" placeholder="Last name" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="p-2 border rounded" />
                    <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="p-2 border rounded" />
                    <input type="text" placeholder="Mobile" required value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="p-2 border rounded" />
                    <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="p-2 border rounded" />
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="p-2 border rounded">
                        <option value="CUSTOMER">Customer</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <button type="submit" disabled={saving} className="md:col-span-2 bg-teal-600 text-white px-5 py-2 rounded font-bold hover:bg-teal-700 disabled:opacity-50">
                        {saving ? 'Creating...' : 'Create User'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">All Users</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Mobile</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50">
                                    {editingUser?.id === u.id ? (
                                        <>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    <input value={editingUser.firstName} onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })} className="w-20 p-1 border rounded text-xs" placeholder="First" />
                                                    <input value={editingUser.lastName} onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })} className="w-20 p-1 border rounded text-xs" placeholder="Last" />
                                                </div>
                                            </td>
                                            <td className="p-4"><input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full p-1 border rounded text-xs" /></td>
                                            <td className="p-4"><input value={editingUser.mobile} onChange={e => setEditingUser({ ...editingUser, mobile: e.target.value })} className="w-full p-1 border rounded text-xs" /></td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}`}>{u.role}</span>
                                            </td>
                                            <td className="p-4">{u.isActive ? 'Active' : 'Deactivated'}</td>
                                            <td className="p-4 flex gap-2">
                                                <button onClick={saveEdit} className="text-teal-600 font-bold hover:underline text-xs">Save</button>
                                                <button onClick={() => setEditingUser(null)} className="text-slate-500 font-bold hover:underline text-xs">Cancel</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-4 font-bold text-slate-900">{u.firstName} {u.lastName}</td>
                                            <td className="p-4">{u.email}</td>
                                            <td className="p-4">{u.mobile}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}`}>{u.role}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {u.isActive ? 'Active' : 'Deactivated'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <button onClick={() => startEdit(u)} className="text-teal-600 font-bold hover:underline text-xs">Edit</button>
                                                    <button onClick={() => toggleRole(u)} className="text-purple-600 font-bold hover:underline text-xs">
                                                        {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                                                    </button>
                                                    <button onClick={() => toggleActive(u)} className="text-amber-600 font-bold hover:underline text-xs">
                                                        {u.isActive ? 'Deactivate' : 'Reactivate'}
                                                    </button>
                                                    <button onClick={() => deleteUserRow(u)} className="text-red-600 font-bold hover:underline text-xs">Delete</button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
