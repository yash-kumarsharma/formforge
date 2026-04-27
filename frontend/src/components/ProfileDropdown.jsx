import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Settings, LogOut, Sun, Moon,
    X, CheckCircle, Key, Shield, Mail,
    ChevronRight, CreditCard, Bell, Sparkles,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const ProfileDropdown = () => {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedColor, setSelectedColor] = useState(
        JSON.parse(localStorage.getItem('vellum_avatar_pref'))?.color || 'hsl(262, 80%, 52%)'
    );

    useEffect(() => {
        const handleColorChange = () => {
            const pref = localStorage.getItem('vellum_avatar_pref');
            if (pref) {
                setSelectedColor(JSON.parse(pref).color);
            }
        };
        window.addEventListener('avatar-color-changed', handleColorChange);
        return () => window.removeEventListener('avatar-color-changed', handleColorChange);
    }, []);

    const avatarColor = selectedColor;

    return (
        <div className="profile-dropdown-container" style={{ position: 'relative' }}>
            {/* Avatar Trigger */}
            <div
                className="profile-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: avatarColor,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    transition: 'transform 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                {user?.name?.[0].toUpperCase() || 'U'}
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {showDropdown && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="dropdown-overlay"
                            onClick={() => setShowDropdown(false)}
                            style={{ position: 'fixed', inset: 0, zIndex: 900 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="vellum-card vellum-glass profile-menu"
                            style={{
                                position: 'absolute',
                                top: '120%',
                                right: 0,
                                width: '280px',
                                padding: '0.5rem',
                                zIndex: 1000,
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid hsl(var(--v-border))',
                                borderRadius: 'var(--radius-lg)'
                            }}
                        >
                            {/* User Info Header */}
                            <div style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--v-border))', marginBottom: '0.5rem' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'hsl(var(--v-text-main))' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--v-text-muted))', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                            </div>

                            {/* Menu Items */}
                            <div className="menu-sections">
                                <button className="menu-item logout" onClick={() => { logout(); setShowDropdown(false); }}>
                                    <LogOut size={16} /> <span>Sign out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .profile-menu button {
                    font-family: inherit;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                }
                .menu-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius-sm);
                    color: hsl(var(--v-text-main));
                    background: transparent;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: var(--transition);
                }
                .menu-item:hover {
                    background: hsl(var(--v-primary-low));
                    color: hsl(var(--v-primary));
                }
                .menu-item.logout {
                    color: #ef4444;
                }
                .menu-item.logout:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
            `}</style>
        </div>
    );
};

export default ProfileDropdown;
