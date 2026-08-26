import validator from 'validator';

// Password policy per requirements:
// - 8 to 12 characters
// - At least one uppercase letter
// - At least one special character
// No maximum below 12 to avoid breaking UX, but enforced server-side.
export const PASSWORD_POLICY = {
    minLength: 8,
    maxLength: 12,
    message: 'Password must be 8–12 characters, include at least one uppercase letter (A-Z) and one special character (!@#$%^&* etc.)'
};

export const validatePassword = (password) => {
    if (!password || typeof password !== 'string') return false;
    if (password.length < PASSWORD_POLICY.minLength || password.length > PASSWORD_POLICY.maxLength) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false; // at least one special char
    return true;
};

// Strip HTML tags and control characters from user-supplied strings to
// prevent stored XSS. Does NOT affect legitimate content — names,
// addresses, etc. just lose any <script> or <img> injections.
export const sanitiseString = (str) => {
    if (!str || typeof str !== 'string') return str;
    return validator.escape(validator.stripLow(str.trim(), true));
};

// Sanitise a plain object's string values one level deep (for req.body).
export const sanitiseBody = (body) => {
    if (!body || typeof body !== 'object') return body;
    const clean = {};
    for (const [key, val] of Object.entries(body)) {
        clean[key] = typeof val === 'string' ? sanitiseString(val) : val;
    }
    return clean;
};
