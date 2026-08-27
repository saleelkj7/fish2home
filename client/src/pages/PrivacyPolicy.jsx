import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

const PrivacyPolicy = () => {
    const { siteName } = useContext(SettingsContext);
    return (
    <div className="container mx-auto px-6 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: August 2026 · Effective under India's Digital Personal Data Protection (DPDP) Act, 2023</p>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">1. Who we are</h2>
            <p className="text-slate-600">{siteName} (<strong>fishtokri.co.in</strong>) is a fish and seafood delivery service operated from Navi Mumbai, Maharashtra, India. We are the Data Fiduciary as defined under the DPDP Act, 2023. Contact: <a href="mailto:vaibhav@fishtokri.co.in" className="text-teal-600 hover:underline">vaibhav@fishtokri.co.in</a></p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">2. Data we collect</h2>
            <p className="text-slate-600 mb-2">We collect only the personal data necessary to provide our service:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li><strong>Identity data:</strong> First name, last name</li>
                <li><strong>Contact data:</strong> Email address, mobile number</li>
                <li><strong>Delivery data:</strong> Delivery address, landmark, pincode</li>
                <li><strong>Transaction data:</strong> Order items, amounts, delivery slots</li>
                <li><strong>Account data:</strong> Hashed password (never stored in plain text)</li>
            </ul>
            <p className="text-slate-600 mt-2">We do not collect payment card details — all payments are collected in cash or via UPI at delivery.</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">3. Why we collect your data (Purpose limitation)</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>To create and manage your account</li>
                <li>To process and deliver your orders</li>
                <li>To send order confirmation and transactional emails</li>
                <li>To send account verification and password reset emails</li>
            </ul>
            <p className="text-slate-600 mt-2">We do not use your data for advertising, profiling, or sell it to any third party.</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">4. Consent</h2>
            <p className="text-slate-600">By registering on this website, you explicitly consent to the collection and use of your personal data as described in this policy. You may withdraw consent at any time by requesting account deletion (see section 7).</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">5. Data sharing</h2>
            <p className="text-slate-600">We share minimal data only with the following service providers to operate our platform:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
                <li><strong>Resend</strong> (email delivery) — email address only</li>
                <li><strong>Neon</strong> (database hosting, Singapore region) — all stored data</li>
                <li><strong>Cloudinary</strong> (image hosting) — product images only (no personal data)</li>
                <li><strong>Render</strong> (server hosting) — all data in transit</li>
                <li><strong>Vercel</strong> (frontend hosting) — no personal data processed</li>
            </ul>
            <p className="text-slate-600 mt-2">All providers are contractually bound to protect your data and not use it for their own purposes.</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">6. Data security</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>All passwords are hashed using bcrypt before storage — they are never readable</li>
                <li>All communication is encrypted via HTTPS/TLS</li>
                <li>Authentication uses signed JWT tokens with a 30-day expiry</li>
                <li>Email verification is required before an account can place orders</li>
            </ul>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">7. Your rights under the DPDP Act, 2023</h2>
            <p className="text-slate-600 mb-2">As a Data Principal you have the right to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li><strong>Access</strong> the personal data we hold about you</li>
                <li><strong>Correct</strong> inaccurate or incomplete data</li>
                <li><strong>Erase</strong> your personal data (subject to legal retention obligations)</li>
                <li><strong>Withdraw consent</strong> at any time</li>
                <li><strong>Nominate</strong> a person to exercise your rights in case of death or incapacity</li>
                <li><strong>Grieve</strong> to the Data Protection Board of India if your request is not addressed</li>
            </ul>
            <p className="text-slate-600 mt-3">To exercise these rights, email us at <a href="mailto:vaibhav@fishtokri.co.in" className="text-teal-600 hover:underline">vaibhav@fishtokri.co.in</a>. We will respond within 30 days. You can also delete your account directly from your profile settings.</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">8. Data retention</h2>
            <p className="text-slate-600">We retain your personal data for as long as your account is active, or as required for legal and business purposes (e.g. order records for accounting). Upon account deletion, your personal data is erased from our systems within 30 days, except where retention is required by law.</p>
        </section>

        <section className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-slate-800">9. Grievance officer</h2>
            <p className="text-slate-600">For any privacy-related grievances, please contact:<br/>
            <strong>Name:</strong> Vaibhav Tambe<br/>
            <strong>Email:</strong> <a href="mailto:vaibhav@fishtokri.co.in" className="text-teal-600 hover:underline">vaibhav@fishtokri.co.in</a><br/>
            We will acknowledge your grievance within 48 hours and resolve it within 30 days.</p>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-3 text-slate-800">10. Changes to this policy</h2>
            <p className="text-slate-600">We may update this policy from time to time. Any material changes will be communicated via email. Continued use of the site after such notice constitutes acceptance of the updated policy.</p>
        </section>
    </div>
    );
};
export default PrivacyPolicy;
