const Footer = () => (
    <footer className="bg-slate-950 text-slate-300 mt-16">
        <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
                <img src="/images/logo.png" alt="Fishtokri" className="h-12 w-auto mb-3 bg-white rounded-lg p-1" />
                <p className="text-sm text-slate-400">Fresh fish from the coast, cleaned exactly how you like it. Sourced daily from Navi Mumbai's boats.</p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Delivery Areas</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li>Nerul — 400706</li>
                    <li>Belapur — 400614</li>
                    <li>Juinagar — 400705</li>
                    <li className="text-teal-400">More areas extending soon</li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Delivery Slots</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li>7 AM – 10 AM</li>
                    <li>10 AM – 1 PM</li>
                    <li>1 PM – 4 PM</li>
                    <li>4 PM – 7 PM</li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Contact Us</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li>📞 9967794964</li>
                    <li>✉️ skannanj7@gmail.com</li>
                </ul>
            </div>
        </div>
        <div className="border-t border-slate-800">
            <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500">
                <span>© 2026 Fishtokri. All rights reserved.</span>
                <span className="flex gap-4">
                    <a href="#" className="hover:text-teal-400">About Us</a>
                    <a href="#" className="hover:text-teal-400">FAQ</a>
                    <a href="#" className="hover:text-teal-400">Terms & Conditions</a>
                    <a href="#" className="hover:text-teal-400">Privacy Policy</a>
                </span>
            </div>
        </div>
    </footer>
);
export default Footer;
