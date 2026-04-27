import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon } from 'lucide-react';

const PublicHeader = () => {
    const { isDarkMode, toggleTheme } = useAuth();

    return (
        <nav
            className="public-header"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 3rem',
                background: 'transparent',
            }}
        >
            <Link to="/" className="brand-text" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>
                Vellum
            </Link>

            <div className="flex public-header-actions" style={{ alignItems: 'center', gap: '1rem' }}>
                <button
                    className="btn btn-ghost"
                    onClick={toggleTheme}
                    title="Toggle Theme"
                    style={{
                        padding: '0.5rem',
                        background: 'hsl(var(--v-surface) / 0.6)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid hsl(var(--v-border) / 0.5)'
                    }}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <Link
                    to="/login"
                    className="btn btn-ghost public-header-signin"
                    style={{
                        background: 'hsl(var(--v-surface) / 0.6)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid hsl(var(--v-border) / 0.5)'
                    }}
                >
                    Sign In
                </Link>

                <Link to="/register" className="btn btn-primary">
                    Get Started
                </Link>
            </div>
        </nav>
    );
};

export default PublicHeader;
