import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

const TermsOfService = () => {
    const { siteName } = useContext(SettingsContext);
    return (
    <div className="container mx-auto px-6 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: August 2026</p>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">1. Acceptance</h2>
            <p className="text-slate-600">By creating an account or placing an order on fishtokri.co.in, you agree to these Terms of Service. If you do not agree, please do not use this service.</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">2. Service description</h2>
            <p className="text-slate-600">{siteName} provides an online ordering platform for fresh fish and seafood delivery in designated service areas of Navi Mumbai. Current delivery pincodes are 400706, 400614, and 400705. We reserve the right to change the service area at any time.</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">3. Orders and payment</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Orders must be placed at least one day in advance — same-day delivery is not offered.</li>
                <li>Payment is collected in full via <strong>cash or UPI at the time of delivery</strong>. No online payment is required at checkout.</li>
                <li>Prices are listed per kilogram (kg) inclusive of 5% GST.</li>
                <li>Once an order is confirmed, cancellation requests should be made at least 2 hours before the delivery slot.</li>
            </ul>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">4. Account responsibility</h2>
            <p className="text-slate-600">You are responsible for maintaining the confidentiality of your account password and for all activity under your account. Notify us immediately at vaibhav@fishtokri.co.in if you suspect unauthorized access.</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">5. Product quality</h2>
            <p className="text-slate-600">We source fish daily from local Navi Mumbai markets and boats. While we take every effort to ensure freshness, fish is a perishable product — please inspect your order at delivery and raise any quality concerns immediately with the delivery person or by emailing us within 2 hours of delivery.</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">6. Limitation of liability</h2>
            <p className="text-slate-600">{siteName}'s liability is limited to the value of the order in question. We are not liable for indirect, incidental, or consequential damages arising from use of this service.</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">7. Governing law</h2>
            <p className="text-slate-600">These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Navi Mumbai, Maharashtra.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800">8. Contact</h2>
            <p className="text-slate-600">For questions about these terms, contact us at <a href="mailto:vaibhav@fishtokri.co.in" className="text-teal-600 hover:underline">vaibhav@fishtokri.co.in</a>.</p>
        </section>
    </div>
    );
};
export default TermsOfService;
