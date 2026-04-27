import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Eye, Share2, Save, CheckCircle,
    Moon, Sun, User, MoreHorizontal, Globe, Lock, Menu,
    BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';

import ProfileDropdown from '../ProfileDropdown';
import { useAuth } from '../../context/AuthContext';

const BuilderNavbar = ({
    title,
    onTitleChange,
    onSave,
    onPreview,
    onShare,
    saving,
    isPublic,
    onTogglePublic,
    onBack,
    onToggleLeft
}) => {
    const { isDarkMode, toggleTheme } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    return (
        <nav className="builder-navbar vellum-glass sticky">
            <div className="nav-left">
                <button className="btn btn-ghost btn-icon menu-btn" onClick={onToggleLeft}>
                    <Menu size={20} />
                </button>
                <button className="btn btn-ghost btn-icon back-btn" onClick={onBack}>
                    <ArrowLeft size={20} />
                </button>
                <div className="logo-placeholder">
                    <span className="brand-text">Vellum</span>
                </div>
            </div>

            <div className="nav-center">
                {isEditingTitle ? (
                    <input
                        autoFocus
                        className="title-input"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    />
                ) : (
                    <h2
                        className="form-title-display"
                        onClick={() => setIsEditingTitle(true)}
                        title="Click to edit"
                    >
                        {title || 'Untitled Form'}
                    </h2>
                )}
                <div className="save-status">
                    {saving ? (
                        <span className="saving-text">Auto-saving...</span>
                    ) : (
                        <span className="saved-text"><CheckCircle size={14} /> Saved</span>
                    )}
                </div>
            </div>

            <div className="nav-right">
                <div
                    className={`privacy-toggle ${isPublic ? 'public' : 'private'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onTogglePublic();
                    }}
                    title={isPublic ? 'Form is Public' : 'Form is Private'}
                >
                    {isPublic ? <Globe size={16} /> : <Lock size={16} />}
                    <span>{isPublic ? 'Public' : 'Private'}</span>
                </div>

                <div className="nav-divider"></div>

                <button className="btn btn-ghost" onClick={() => navigate(`/forms/${id}/responses`)} title="View Responses">
                    <BarChart2 size={18} />
                    <span className="hide-tablet">Responses</span>
                </button>

                <button
                    className="btn btn-ghost"
                    onClick={onSave}
                    disabled={saving}
                    title="Save Form"
                >
                    <Save size={18} className={saving ? 'animate-pulse' : ''} />
                    <span className="hide-tablet">{saving ? 'Saving...' : 'Save'}</span>
                </button>

                <button className="btn btn-ghost" onClick={onPreview} title="Preview Form">
                    <Eye size={18} />
                    <span className="hide-tablet">Preview</span>
                </button>

                <button className="btn btn-primary btn-share" onClick={onShare}>
                    <Share2 size={18} />
                    <span className="hide-tablet">Share</span>
                </button>

                <button
                    className="btn btn-ghost"
                    onClick={toggleTheme}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        color: 'hsl(var(--v-text-main))'
                    }}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="nav-divider"></div>

                <ProfileDropdown />
            </div>

            <style>{`
                .builder-navbar {
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1rem;
                    border-bottom: 1px solid hsl(var(--v-border));
                    background: hsl(var(--v-surface) / 0.8);
                    backdrop-filter: blur(12px);
                    z-index: 100;
                    box-shadow: var(--shadow-sm);
                }
                .nav-left, .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex: 1;
                }
                .nav-right {
                    justify-content: flex-end;
                }
                .nav-center {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 2;
                }
                .logo-placeholder {
                    margin-left: 0.5rem;
                }
                .form-title-display {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: hsl(var(--v-text-main));
                    cursor: pointer;
                    padding: 2px 8px;
                    border-radius: 4px;
                    transition: background 0.2s;
                    max-width: 300px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .form-title-display:hover {
                    background: hsl(var(--v-primary-low));
                }
                .title-input {
                    font-size: 1.125rem;
                    font-weight: 600;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid hsl(var(--v-primary));
                    color: hsl(var(--v-text-main));
                    outline: none;
                    text-align: center;
                    width: 100%;
                    max-width: 300px;
                }
                .save-status {
                    font-size: 0.75rem;
                    margin-top: 2px;
                }
                .saving-text {
                    color: hsl(var(--v-text-muted));
                    font-style: italic;
                }
                .saved-text {
                    color: #10b981;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .privacy-toggle {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    padding: 4px 10px;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .privacy-toggle.private {
                    color: hsl(var(--v-text-muted));
                    background: hsl(var(--v-border) / 0.5);
                }
                .privacy-toggle.public {
                    color: #10b981;
                    background: rgba(16, 185, 129, 0.1);
                }
                .nav-divider {
                    width: 1px;
                    height: 24px;
                    background: hsl(var(--v-border));
                    margin: 0 4px;
                }
                .btn-share {
                   background: linear-gradient(135deg, #8b5cf6, #d946ef);
                   color: white;
                   border: none;
                }
                .avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: hsl(var(--v-primary-low));
                    color: hsl(var(--v-primary));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid hsl(var(--v-primary) / 0.2);
                }
                .menu-btn {
                    display: none;
                }
                @media (max-width: 1024px) {
                    .menu-btn {
                        display: flex;
                    }
                }
            `}</style>
        </nav>
    );
};

export default BuilderNavbar;
