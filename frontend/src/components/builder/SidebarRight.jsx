import { motion } from 'framer-motion';
import { Settings, Info, Zap, ChevronDown, X } from 'lucide-react';

const SidebarRight = ({ selectedQuestion, onUpdateQuestion, isOpen, onClose }) => {
    if (!selectedQuestion) {
        return (
            <div className={`sidebar-right vellum-glass empty ${isOpen ? 'open' : ''}`}>
                <div className="empty-state">
                    <Settings size={48} className="empty-icon" />
                    <p>Select a question to edit its settings</p>
                </div>
                {window.innerWidth < 1024 && (
                    <button className="close-sidebar-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                )}
                <style>{`
                    .sidebar-right {
                        width: 320px;
                        height: calc(100vh - 64px);
                        border-left: 1px solid hsl(var(--v-border));
                        background: hsl(var(--v-surface) / 0.5);
                        display: flex;
                        flex-direction: column;
                        z-index: 40;
                        transition: transform 0.3s ease;
                    }
                    .sidebar-right.empty {
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                    }
                    .empty-icon {
                        color: hsl(var(--v-text-muted) / 0.3);
                        margin-bottom: 1rem;
                    }
                    .empty-state p {
                        color: hsl(var(--v-text-muted));
                        font-size: 0.9375rem;
                    }
                    .close-sidebar-btn {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        background: none;
                        border: none;
                        color: hsl(var(--v-text-muted));
                        cursor: pointer;
                    }
                    @media (max-width: 1024px) {
                        .sidebar-right {
                            position: fixed;
                            right: 0;
                            top: 64px;
                            bottom: 0;
                            transform: translateX(100%);
                            z-index: 100;
                            background: hsl(var(--v-surface));
                            box-shadow: -10px 0 30px rgba(0,0,0,0.1);
                        }
                        .sidebar-right.open {
                            transform: translateX(0);
                        }
                    }
                `}</style>
            </div>
        );
    }

    const handleChange = (field, value) => {
        onUpdateQuestion(selectedQuestion.id, { ...selectedQuestion, [field]: value });
    };

    return (
        <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className={`sidebar-right vellum-glass ${isOpen ? 'open' : ''}`}
        >
            <div className="sidebar-header">
                <div className="flex-between">
                    <h3>Settings</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close Settings">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="sidebar-content">
                <div className="sidebar-section">
                    <div className="section-header">
                        <Info size={16} />
                        <h4>Question Settings</h4>
                    </div>

                    <div className="settings-group">
                        <div className="setting-item-row">
                            <span className="label-text">Required Field</span>
                            <label className="switch-wrapper">
                                <input
                                    type="checkbox"
                                    checked={selectedQuestion.required || false}
                                    onChange={(e) => handleChange('required', e.target.checked)}
                                />
                                <span className="switch-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item-col">
                            <label className="input-label">Description (Optional)</label>
                            <textarea
                                className="vellum-input"
                                value={selectedQuestion.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Add a help text for users..."
                                rows={3}
                                style={{ resize: 'none', fontSize: '0.875rem' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="section-header">
                        <Zap size={16} />
                        <h4>Validation & Logic</h4>
                    </div>

                    <div className="settings-group">
                        <div className="collapsible-box">
                            <div className="collapsible-trigger">
                                <span>Conditional Logic</span>
                                <ChevronDown size={14} />
                            </div>
                            <div className="collapsible-content">
                                <p className="hint-text">Show this question only if certain conditions are met.</p>
                                <button className="btn btn-ghost btn-xs full-width" style={{ marginTop: '0.5rem' }}>
                                    Add Condition
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .sidebar-right {
                    width: 320px;
                    height: calc(100vh - 64px);
                    border-left: 1px solid hsl(var(--v-border));
                    background: hsl(var(--v-surface) / 0.8);
                    backdrop-filter: blur(12px);
                    display: flex;
                    flex-direction: column;
                    z-index: 40;
                    transition: transform 0.3s ease;
                }
                .sidebar-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid hsl(var(--v-border));
                }
                .sidebar-header h3 {
                    font-size: 1rem;
                    font-weight: 600;
                }
                .sidebar-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                }
                .sidebar-section {
                    margin-bottom: 2rem;
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    color: hsl(var(--v-text-muted));
                }
                .section-header h4 {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .settings-group {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .setting-item-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .setting-item-col {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .input-label {
                    font-size: 0.8125rem;
                    font-weight: 500;
                    color: hsl(var(--v-text-muted));
                }
                .label-text {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: hsl(var(--v-text-main));
                }
                .switch-wrapper {
                    position: relative;
                    width: 36px;
                    height: 20px;
                }
                .switch-wrapper input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .switch-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: hsl(var(--v-border));
                    transition: .4s;
                    border-radius: 20px;
                }
                .switch-slider:before {
                    position: absolute;
                    content: "";
                    height: 14px;
                    width: 14px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .switch-slider {
                    background-color: hsl(var(--v-primary));
                }
                input:checked + .switch-slider:before {
                    transform: translateX(16px);
                }
                .collapsible-box {
                    border: 1px solid hsl(var(--v-border));
                    border-radius: var(--radius-sm);
                    padding: 0.75rem;
                    background: hsl(var(--v-surface));
                }
                .collapsible-trigger {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .hint-text {
                    font-size: 0.75rem;
                    color: hsl(var(--v-text-muted));
                    margin-top: 0.5rem;
                }
                .full-width {
                    width: 100%;
                }

                @media (max-width: 1024px) {
                    .sidebar-right {
                        position: fixed;
                        right: 0;
                        top: 64px;
                        bottom: 0;
                        transform: translateX(100%);
                        z-index: 100;
                        background: hsl(var(--v-surface));
                        box-shadow: -10px 0 30px rgba(0,0,0,0.1);
                    }
                    .sidebar-right.open {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default SidebarRight;
