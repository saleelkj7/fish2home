import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SettingsContext = createContext();

const DEFAULTS = { siteName: 'Fishtokri', logoUrl: null };

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULTS);

    const refreshSettings = () => {
        axios.get('/api/settings')
            .then(res => setSettings({ ...DEFAULTS, ...res.data }))
            .catch(() => setSettings(DEFAULTS)); // fail quietly, keep defaults
    };

    useEffect(refreshSettings, []);

    return (
        <SettingsContext.Provider value={{ ...settings, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
