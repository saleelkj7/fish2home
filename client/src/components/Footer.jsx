const Footer = () => (
    <footer className="bg-slate-950 text-slate-300 mt-16">
        <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
                <img src="/images/logo.png" alt="Fishtokri" className="h-12 w-auto mb-3 bg-white rounded-lg p-1" />
                <p className="text-sm text-slate-400 mb-3">Fresh fish from the coast, cleaned exactly how you like it. Sourced daily from Navi Mumbai's boats.</p>
                <a href="https://youtube.com/@vaibhavtambe6579?si=yTGf6f6WsDXjLZze" target="_blank" rel="noreferrer" aria-label="Fishtokri on YouTube" className="inline-flex text-slate-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.12C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.391.521A2.994 2.994 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.994 2.994 0 0 0 2.107 2.12c1.886.521 9.391.521 9.391.521s7.505 0 9.391-.521a2.994 2.994 0 0 0 2.107-2.12C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
                    </svg>
                </a>
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
                    <li>📞 9004668229</li>
                    <li>✉️ vaibhav@fishtokri.co.in</li>
                </ul>
            </div>
        </div>
        <div className="border-t border-slate-800">
            <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500">
                <span>© 2026 Fishtokri. All rights reserved. · Designed and Developed by Saleel K</span>
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
