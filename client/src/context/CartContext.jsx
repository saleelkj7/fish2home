import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    let initialCart = [];
    try {
        const stored = localStorage.getItem('f2h_cart');
        if (stored) initialCart = JSON.parse(stored);
    } catch (e) {
        initialCart = [];
    }
    const [cart, setCart] = useState(initialCart);

    useEffect(() => { localStorage.setItem('f2h_cart', JSON.stringify(cart)); }, [cart]);

    const addToCart = (fish) => {
        const qtyToAdd = fish.quantity || 1;
        const existing = cart.find(item => item.id === fish.id);
        if (existing) setCart(cart.map(item => item.id === fish.id ? { ...item, quantity: item.quantity + qtyToAdd } : item));
        else setCart([...cart, { ...fish, quantity: qtyToAdd }]);
    };

    const updateQuantity = (fishId, qty) => {
        if (qty <= 0) setCart(cart.filter(item => item.id !== fishId));
        else setCart(cart.map(item => item.id === fishId ? { ...item, quantity: qty } : item));
    };

    const clearCart = () => setCart([]);

    const getTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const gst = subtotal * 0.05;
        const total = subtotal + gst;
        return { subtotal, gst, total, advance: 0, balance: total };
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart, getTotals }}>
            {children}
        </CartContext.Provider>
    );
};
