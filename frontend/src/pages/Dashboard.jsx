import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formService, authService } from '../services/api';
import {
    Plus,
    Layout,
    BarChart,
    Trash2,
    CheckCircle,
    Sparkles,
    MessageSquare,
    Calendar,
    TrendingUp,
    Home,
    FileText,
    Settings,
    PieChart,
    ChevronRight,
    Search,
    User,
    Mail,
    Shield,
    LogOut,
    Key,
    X,
    ChevronLeft,
    Clock,
    Menu
} from 'lucide-react';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000; // diff in seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <div
        className={`sidebar-nav-item ${active ? 'active' : ''}`}
        onClick={onClick}
    >
        {icon}
        <span>{label}</span>
    </div>
);

const StatCard = ({ icon, label, value, trend, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="dashboard-stat-card-enhanced stat-card-inner"
    >
        <div className="stat-icon-enhanced stat-icon-enhanced-wrapper">
            {icon}
        </div>
        <div className="stat-content-enhanced">
            <div className="stat-value-enhanced">{value}</div>
            <div className="stat-label-enhanced">{label}</div>
            {trend && (
                <div className="stat-trend-indicator">
                    <TrendingUp size={14} /> {trend}
                </div>
            )}
        </div>
    </motion.div>
);

const TemplateCard = ({ template, onClick, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        className="dashboard-template-card-enhanced"
        onClick={onClick}
    >
        <div className="template-icon-enhanced">
            {template.icon}
        </div>
        <div className="template-content">
            <div className="template-title">{template.title}</div>
            <div className="template-meta">{template.questions.length} questions</div>
        </div>
    </motion.div>
);

const FormsGrid = ({ formsList, searchTerm, activeView, createNewForm, setDeletingId, setShowDeleteModal }) => {
    if (formsList.length === 0) {
        return (
            <div className="empty-state">
                <Layout size={48} className="analytics-placeholder-icon" style={{ opacity: 0.2 }} />
                <h3 className="form-card-title-text" style={{ fontSize: '1.25rem' }}>
                    {searchTerm ? 'No matches found' : 'Your workspace is empty'}
                </h3>
                {activeView !== 'forms' && (
                    <button className="btn btn-outline" onClick={createNewForm} style={{ marginTop: '1rem' }}>
                        Create New Form
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="dashboard-forms-grid">
            {formsList.map((f, index) => (
                <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
                    <Link to={`/forms/${f.id}`} className="vellum-card-premium form-card-link-wrapper">
                        <div className="form-visual-preview">
                            <div className="form-visual-icon">
                                <Layout size={24} />
                            </div>
                            <div className="form-status-badge-container">
                                <div className={`form-status-indicator ${f.isPublic ? 'live' : 'private'}`}>
                                    <div className="form-status-dot"></div>
                                    {f.isPublic ? 'Live' : 'Private'}
                                </div>
                            </div>
                        </div>
                        <div className="form-card-body-container">
                            <h3 className="form-card-title-text">{f.title}</h3>
                            <p className="form-card-description-text">
                                {f.description || 'No description provided.'}
                            </p>
                            <div className="form-card-footer-container">
                                <div className="form-responses-count">
                                    <BarChart size={16} />
                                    <span>{f._count?.responses || 0} responses</span>
                                </div>
                                <div className="flex" style={{ gap: '0.75rem', alignItems: 'center' }}>
                                    <div className="form-responses-count" style={{ opacity: 0.7 }}>
                                        <Clock size={14} />
                                        <span>{formatDate(f.updatedAt)}</span>
                                    </div>
                                    <div
                                        className="form-delete-icon-button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDeletingId(f.id);
                                            setShowDeleteModal(true);
                                        }}
                                        title="Delete Form"
                                    >
                                        <Trash2 size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};

const ResponseTrendChart = ({ data }) => {
    const height = 200;
    const width = 600;
    const padding = 40;

    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => d.value)) || 10;
    const xStep = (width - padding * 2) / (data.length - 1);

    const points = data.map((d, i) => ({
        x: padding + i * xStep,
        y: height - padding - (d.value / maxVal) * (height - padding * 2)
    }));

    const linePath = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <div className="chart-container">
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(v => (
                    <line
                        key={v}
                        x1={padding}
                        y1={height - padding - v * (height - padding * 2)}
                        x2={width - padding}
                        y2={height - padding - v * (height - padding * 2)}
                        className="chart-grid-line"
                    />
                ))}

                {/* Area and Line */}
                <path d={areaPath} fill="hsl(var(--v-primary) / 0.1)" />
                <path d={linePath} fill="none" stroke="hsl(var(--v-primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Points */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" className="chart-dot" />
                ))}
            </svg>
            <div className="flex-between" style={{ padding: `0 ${padding}px`, marginTop: '0.5rem' }}>
                {data.map((d, i) => (
                    <span key={i} className="chart-axis-label">{d.label}</span>
                ))}
            </div>
        </div>
    );
};

const StatusBreakdownChart = ({ forms }) => {
    const liveForms = forms.filter(f => f.isPublic).length;
    const privateForms = forms.length - liveForms;
    const total = forms.length || 1;

    const livePercent = (liveForms / total) * 100;
    const privatePercent = (privateForms / total) * 100;

    return (
        <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Live Forms ({liveForms})</span>
                    <span style={{ fontSize: '0.875rem', color: 'hsl(var(--v-text-muted))' }}>{Math.round(livePercent)}%</span>
                </div>
                <div className="chart-bar-bg">
                    <div className="chart-bar-fill" style={{ width: `${livePercent}%`, background: 'hsl(142 76% 36%)' }} />
                </div>
            </div>
            <div>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Private Forms ({privateForms})</span>
                    <span style={{ fontSize: '0.875rem', color: 'hsl(var(--v-text-muted))' }}>{Math.round(privatePercent)}%</span>
                </div>
                <div className="chart-bar-bg">
                    <div className="chart-bar-fill" style={{ width: `${privatePercent}%`, background: 'hsl(215 16% 47%)' }} />
                </div>
            </div>
        </div>
    );
};

const OverviewView = ({ user, createNewForm, forms, totalResponses, activeForms, createFromTemplate, setActiveView, templates, setDeletingId, setShowDeleteModal }) => (
    <>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-hero-container">
            <div>
                <h1 className="dashboard-title">Hello, {user?.name.split(' ')[0]}</h1>
                <p className="dashboard-subtitle">Here's what's happening in your workspace today.</p>
            </div>
            <button className="btn btn-primary btn-large" onClick={createNewForm} style={{ gap: '0.75rem', boxShadow: '0 8px 20px -4px hsl(var(--v-primary) / 0.4)' }}>
                <Plus size={24} /> Create New Form
            </button>
        </motion.div>
        <div className="dashboard-stats-grid">
            <StatCard icon={<Layout size={24} />} label="Total Forms" value={forms.length} trend="+2 this week" delay={0.1} />
            <StatCard icon={<BarChart size={24} />} label="Total Responses" value={totalResponses} trend="+12% vs last week" delay={0.2} />
            <StatCard icon={<CheckCircle size={24} />} label="Active Forms" value={activeForms} delay={0.3} />
        </div>
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="dashboard-section">
            <div className="section-header">
                <h2 className="section-title">Start from a template</h2>
                <p className="section-description">Launch a new project quickly with our pre-built templates.</p>
            </div>
            <div className="dashboard-templates-grid">
                {templates.map((t, i) => (
                    <TemplateCard key={t.id} template={t} onClick={() => createFromTemplate(t)} delay={0.4 + (i * 0.1)} />
                ))}
            </div>
        </motion.section>
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="dashboard-section">
            <div className="section-header flex-between">
                <div>
                    <h2 className="section-title">Recent Forms</h2>
                    <p className="section-description">Manage your most recent active forms.</p>
                </div>
                <button className="btn btn-ghost" onClick={() => setActiveView('forms')} style={{ color: 'hsl(var(--v-primary))' }}>View All</button>
            </div>
            <FormsGrid formsList={forms.slice(0, 3)} searchTerm="" activeView="overview" createNewForm={createNewForm} setDeletingId={setDeletingId} setShowDeleteModal={setShowDeleteModal} />
        </motion.section>
    </>
);

const MyFormsView = ({ forms, searchTerm, setSearchTerm, page, totalPages, setPage, createNewForm, setDeletingId, setShowDeleteModal, filterStatus, setFilterStatus, sortOrder, setSortOrder }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="view-header-container">
            <div>
                <h1 className="view-title">My Forms</h1>
                <p className="view-subtitle">Manage, edit, and analyze all your forms.</p>
            </div>
            <button className="btn btn-primary" onClick={createNewForm} style={{ gap: '0.5rem' }}>
                <Plus size={20} /> New Form
            </button>
        </div>

        {/* Filter & Search Bar — matches landing page glassmorphism style */}
        <div className="vellum-glass" style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '16px',
        }}>
            {/* Search — nav-style input */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                flex: '1 1 180px',
                minWidth: '140px',
                background: 'hsl(var(--v-bg) / 0.6)',
                border: '1px solid hsl(var(--v-border) / 0.6)',
                borderRadius: '10px',
                padding: '0.5rem 0.875rem',
                transition: 'border-color 0.2s'
            }}>
                <Search size={15} style={{ color: 'hsl(var(--v-text-muted))', flexShrink: 0 }} />
                <input
                    type="text"
                    placeholder="Search forms…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-field-input"
                    style={{ fontSize: '0.875rem' }}
                />
            </div>

            {/* Vertical separator */}
            <div style={{ width: '1px', height: '24px', background: 'hsl(var(--v-border))', flexShrink: 0 }} />

            {/* Status pills — landing-page section-badge style */}
            <div style={{ display: 'flex', gap: '0.375rem' }}>
                {[
                    { key: 'all', label: 'All Forms' },
                    { key: 'live', label: 'Live' },
                    { key: 'private', label: 'Draft' }
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilterStatus(key)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.35rem 0.875rem',
                            fontSize: '0.8125rem',
                            borderRadius: '50px',
                            background: filterStatus === key ? 'hsl(var(--v-primary) / 0.12)' : 'transparent',
                            color: filterStatus === key ? 'hsl(var(--v-primary))' : 'hsl(var(--v-text-muted))',
                            border: filterStatus === key ? '1px solid hsl(var(--v-primary) / 0.25)' : '1px solid transparent',
                            fontWeight: filterStatus === key ? 700 : 500,
                            letterSpacing: filterStatus === key ? '0.01em' : '0',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {key === 'live' && (
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: 'hsl(142 76% 36%)',
                                display: 'inline-block',
                                boxShadow: filterStatus === key ? '0 0 6px hsl(142 76% 36% / 0.6)' : 'none'
                            }} />
                        )}
                        {key === 'private' && (
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: 'hsl(215 16% 47%)',
                                display: 'inline-block'
                            }} />
                        )}
                        {label}
                    </button>
                ))}
            </div>

            {/* Sort — right-aligned, minimal */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.775rem', color: 'hsl(var(--v-text-muted))', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort</span>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '10px',
                        background: 'hsl(var(--v-bg) / 0.6)',
                        border: '1px solid hsl(var(--v-border) / 0.6)',
                        color: 'hsl(var(--v-text-main))',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        outline: 'none',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="az">A → Z</option>
                    <option value="za">Z → A</option>
                </select>
            </div>
        </div>
        <FormsGrid formsList={forms} searchTerm={searchTerm} activeView="forms" createNewForm={createNewForm} setDeletingId={setDeletingId} setShowDeleteModal={setShowDeleteModal} />
        {totalPages > 1 && (
            <div className="flex-center" style={{ marginTop: '2rem', gap: '1rem' }}>
                <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
                <span style={{ color: 'hsl(var(--v-text-muted))' }}>Page {page} of {totalPages}</span>
                <button className="btn btn-outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
            </div>
        )}
    </motion.div>
);

const AnalyticsView = ({ forms, totalResponses }) => {
    const statsData = [
        { label: 'Mon', value: 12 },
        { label: 'Tue', value: 18 },
        { label: 'Wed', value: 15 },
        { label: 'Thu', value: 25 },
        { label: 'Fri', value: 20 },
        { label: 'Sat', value: 32 },
        { label: 'Sun', value: 28 },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="view-header-container">
                <div>
                    <h1 className="view-title">Analytics Overview</h1>
                    <p className="view-subtitle">Insights into your form performance.</p>
                </div>
                <div className="vellum-chip">Last 7 Days</div>
            </div>

            <div className="dashboard-stats-grid" style={{ marginBottom: '2.5rem' }}>
                <StatCard icon={<Layout size={24} />} label="Total Forms" value={forms.length} delay={0.1} />
                <StatCard icon={<BarChart size={24} />} label="Total Responses" value={totalResponses} trend="+12%" delay={0.2} />
                <StatCard icon={<CheckCircle size={24} />} label="Avg. Completion" value="84.2%" trend="+5.4%" delay={0.3} />
            </div>

            <div className="flex" style={{ gap: '2rem', flexWrap: 'wrap' }}>
                <div className="vellum-card-premium" style={{ flex: '2 1 600px', padding: '2rem' }}>
                    <div className="flex-between" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Response Trends</h3>
                        <TrendingUp size={20} color="hsl(var(--v-primary))" />
                    </div>
                    <ResponseTrendChart data={statsData} />
                </div>

                <div className="vellum-card-premium" style={{ flex: '1 1 300px', padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>Form Status</h3>
                    <StatusBreakdownChart forms={forms} />
                    <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: 'hsl(var(--v-primary) / 0.05)', borderRadius: '12px', border: '1px solid hsl(var(--v-primary) / 0.1)' }}>
                        <div className="flex" style={{ gap: '0.75rem', color: 'hsl(var(--v-primary))', marginBottom: '0.5rem' }}>
                            <Sparkles size={18} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Pro Insight</span>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--v-text-muted))', lineHeight: '1.5' }}>
                            Your "Customer Feedback" form has 40% higher engagement than your workspace average.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AVATAR_COLORS = [
    { name: 'Purple', value: 'hsl(262, 80%, 52%)' },
    { name: 'Blue', value: 'hsl(217, 91%, 60%)' },
    { name: 'Green', value: 'hsl(142, 76%, 36%)' },
    { name: 'Red', value: 'hsl(0, 72%, 51%)' },
    { name: 'Orange', value: 'hsl(24, 94%, 50%)' },
    { name: 'Indigo', value: 'hsl(239, 84%, 67%)' }
];

const SettingsView = ({ user, updateUser }) => {
    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [selectedColor, setSelectedColor] = useState(
        JSON.parse(localStorage.getItem('vellum_avatar_pref'))?.color || AVATAR_COLORS[0].value
    );

    const handleColorChange = (color) => {
        setSelectedColor(color);
        localStorage.setItem('vellum_avatar_pref', JSON.stringify({ color }));
        window.dispatchEvent(new Event('avatar-color-changed'));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await authService.updateProfile({ name });
            updateUser(res.data);
            window.dispatchEvent(new CustomEvent('vellum-notify', { detail: { msg: 'Profile updated successfully!', type: 'success' } }));
        } catch (err) {
            window.dispatchEvent(new CustomEvent('vellum-notify', { detail: { msg: err.response?.data?.message || 'Update failed', type: 'error' } }));
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            window.dispatchEvent(new CustomEvent('vellum-notify', { detail: { msg: 'Passwords do not match', type: 'error' } }));
            return;
        }
        setChangingPassword(true);
        try {
            await authService.updatePassword({ currentPassword, newPassword });
            window.dispatchEvent(new CustomEvent('vellum-notify', { detail: { msg: 'Password updated successfully!', type: 'success' } }));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            window.dispatchEvent(new CustomEvent('vellum-notify', { detail: { msg: err.response?.data?.message || 'Update failed', type: 'error' } }));
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="view-header-container">
                <div>
                    <h1 className="view-title">Account Settings</h1>
                    <p className="view-subtitle">Manage your profile and security preferences.</p>
                </div>
            </div>
            <div className="flex" style={{ gap: '2rem', flexWrap: 'wrap' }}>
                {/* Profile Section */}
                <div className="vellum-card-premium" style={{ flex: '1 1 450px', padding: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                        <div style={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: selectedColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: 'white',
                            boxShadow: `0 0 25px ${selectedColor}44`,
                            transition: 'background 0.3s'
                        }}>
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Avatar Color</h3>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {AVATAR_COLORS.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => handleColorChange(color.value)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: color.value,
                                            border: selectedColor === color.value ? '3px solid white' : 'none',
                                            boxShadow: selectedColor === color.value ? '0 0 0 2px hsl(var(--v-primary))' : 'none',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s'
                                        }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.625rem', color: 'hsl(var(--v-text-muted))', textTransform: 'uppercase' }}>Full Name</label>
                            <div className="vellum-input" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <User size={18} color="hsl(var(--v-text-muted))" />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.625rem', color: 'hsl(var(--v-text-muted))', textTransform: 'uppercase' }}>Email Address</label>
                            <div className="vellum-input" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.6, cursor: 'not-allowed' }}>
                                <Mail size={18} color="hsl(var(--v-text-muted))" />
                                <input type="email" value={user?.email} readOnly style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none', cursor: 'not-allowed' }} />
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--v-border))' }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Section */}
                <div className="vellum-card-premium" style={{ flex: '1 1 350px', padding: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <Shield size={24} style={{ color: 'hsl(var(--v-primary))' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Security</h3>
                    </div>

                    <form onSubmit={handlePasswordUpdate} style={{ display: 'grid', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--v-text-muted))' }}>Current Password</label>
                            <div className="vellum-input" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Key size={18} color="hsl(var(--v-text-muted))" />
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--v-text-muted))' }}>New Password</label>
                            <div className="vellum-input" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Key size={18} color="hsl(var(--v-text-muted))" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--v-text-muted))' }}>Confirm Password</label>
                            <div className="vellum-input" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Key size={18} color="hsl(var(--v-text-muted))" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={changingPassword}>
                            {changingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>

                    <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--v-border))' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#ef4444' }}>Danger Zone</h4>
                        <button className="btn btn-outline" style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444', justifyContent: 'center' }}>
                            <Trash2 size={18} /> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const { user, updateUser, isDarkMode, toggleTheme } = useAuth();
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    const [activeView, setActiveView] = useState('overview');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all'); // all, live, private
    const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, az, za

    const notify = (msg, type = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const handleSearch = (e) => setSearchTerm(e.detail);
        const handleNotify = (e) => notify(e.detail.msg, e.detail.type);
        window.addEventListener('vellum-search', handleSearch);
        window.addEventListener('vellum-notify', handleNotify);
        return () => {
            window.removeEventListener('vellum-search', handleSearch);
            window.removeEventListener('vellum-notify', handleNotify);
        };
    }, []);

    const templates = [
        { id: 't1', title: 'Customer Feedback', type: 'FEEDBACK', icon: <MessageSquare size={28} color="white" />, questions: [{ label: 'How would you rate our service?', type: 'MULTIPLE_CHOICE', options: ['Excellent', 'Good', 'Average', 'Poor'] }, { label: 'Any suggestions for improvement?', type: 'TEXT' }] },
        { id: 't2', title: 'Event Registration', type: 'EVENT', icon: <Calendar size={28} color="white" />, questions: [{ label: 'Full Name', type: 'TEXT', required: true }, { label: 'Email', type: 'TEXT', required: true }, { label: 'Dietary Requirements', type: 'TEXT' }] },
        { id: 't3', title: 'Product Market Fit', type: 'RESEARCH', icon: <TrendingUp size={28} color="white" />, questions: [{ label: 'How disappointed would you be if you could no longer use Vellum?', type: 'MULTIPLE_CHOICE', options: ['Very disappointed', 'Somewhat disappointed', 'Not disappointed'] }] }
    ];

    const fetchForms = async () => {
        try {
            setLoading(true);
            const res = await formService.list({
                page,
                limit: 12,
                search: searchTerm,
                sort: sortOrder,
                status: filterStatus
            });
            if (res.data.forms) {
                setForms(res.data.forms);
                setTotalPages(res.data.pagination.totalPages);
            } else {
                setForms(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchForms();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, searchTerm, filterStatus, sortOrder]);

    const activeForms = forms.filter(f => f.isPublic).length;
    const totalResponses = forms.reduce((acc, form) => acc + (form._count?.responses || 0), 0);

    const createFromTemplate = async (template) => {
        try {
            setLoading(true);
            const res = await formService.create({
                title: template.title,
                questions: template.questions
            });
            navigate(`/forms/${res.data.id}`);
        } catch (err) {
            console.error("Template creation failed:", err);
            setLoading(false);
        }
    };

    const createNewForm = async () => {
        try {
            const res = await formService.create({ title: 'Untitled Form' });
            navigate(`/forms/${res.data.id}`);
        } catch (err) {
            console.error("Failed to create new form:", err);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await formService.delete(deletingId);
            fetchForms();
            setShowDeleteModal(false);
            setDeletingId(null);
            notify('Form deleted successfully', 'success');
        } catch (err) {
            notify('Failed to delete form.', 'error');
        }
    };

    if (loading && forms.length === 0) {
        return (
            <div className="dashboard-wrapper">
                <div className="dashboard-background">
                    <div className="dashboard-orb d-orb-1" />
                    <div className="dashboard-orb d-orb-2" />
                </div>
                <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
                    <div className="spinner" style={{ width: 40, height: 40, border: '3px solid hsl(var(--v-border))', borderTopColor: 'hsl(var(--v-primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: 'hsl(var(--v-text-muted))' }}>Loading workspace...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }


    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-background">
                <div className="dashboard-orb d-orb-1"></div>
                <div className="dashboard-orb d-orb-2"></div>
                <div className="dashboard-orb d-orb-3"></div>
            </div>

            <div className="dashboard-container" style={{ display: 'flex', height: '100vh' }}>
                {/* Mobile sidebar overlay */}
                {isMobileMenuOpen && (
                    <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
                )}

                {/* Sidebar */}
                <div className={`dashboard-sidebar vellum-glass ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'open' : ''}`}>
                    <button
                        className="sidebar-toggle-btn"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        style={{ display: 'none' }}
                    >
                        <ChevronLeft size={14} style={{ transform: isSidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                    </button>

                    {/* Mobile close button — shown only on small screens */}
                    <div className="sidebar-mobile-header">
                        <span className="sidebar-mobile-brand">Vellum</span>
                        <button
                            className="sidebar-mobile-close"
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label="Close menu"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="sidebar-nav">
                        <SidebarItem
                            icon={<Home size={20} />}
                            label="Overview"
                            active={activeView === 'overview'}
                            onClick={() => setActiveView('overview')}
                        />
                        <SidebarItem
                            icon={<FileText size={20} />}
                            label="My Forms"
                            active={activeView === 'forms'}
                            onClick={() => setActiveView('forms')}
                        />
                        <SidebarItem
                            icon={<PieChart size={20} />}
                            label="Analytics"
                            active={activeView === 'analytics'}
                            onClick={() => setActiveView('analytics')}
                        />
                        <SidebarItem
                            icon={<Settings size={20} />}
                            label="Settings"
                            active={activeView === 'settings'}
                            onClick={() => setActiveView('settings')}
                        />
                    </div>

                    <div className="sidebar-pro-card">
                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, hsl(var(--v-primary) / 0.1), hsl(var(--v-accent) / 0.1))',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid hsl(var(--v-primary) / 0.2)'
                        }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--v-text-main))' }}>Pro Plan</h4>
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--v-text-muted))', marginBottom: '0.75rem' }}>Unlock advanced features</p>
                            <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}>Upgrade</button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className={`dashboard-content-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                    {/* Mobile top bar */}
                    <div className="mobile-topbar">
                        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open menu">
                            <Menu size={20} />
                        </button>
                        <span className="mobile-topbar-title">
                            {activeView === 'overview' ? 'Overview' :
                                activeView === 'forms' ? 'My Forms' :
                                    activeView === 'analytics' ? 'Analytics' : 'Settings'}
                        </span>
                        <div style={{ width: 40 }} />{/* spacer */}
                    </div>

                    {activeView === 'overview' && (
                        <OverviewView
                            user={user}
                            createNewForm={createNewForm}
                            forms={forms}
                            totalResponses={totalResponses}
                            activeForms={activeForms}
                            createFromTemplate={createFromTemplate}
                            setActiveView={setActiveView}
                            templates={templates}
                        />
                    )}
                    {activeView === 'forms' && (
                        <MyFormsView
                            forms={forms}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            page={page}
                            totalPages={totalPages}
                            setPage={setPage}
                            createNewForm={createNewForm}
                            setDeletingId={setDeletingId}
                            setShowDeleteModal={setShowDeleteModal}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                        />
                    )}
                    {activeView === 'analytics' && (
                        <AnalyticsView
                            forms={forms}
                            totalResponses={totalResponses}
                        />
                    )}
                    {activeView === 'settings' && (
                        <SettingsView
                            user={user}
                            updateUser={updateUser}
                        />
                    )}
                </main>
            </div>

            {/* Mobile Bottom Tab Nav */}
            <nav className="mobile-bottom-nav">
                {[
                    { view: 'overview', icon: <Home size={20} />, label: 'Home' },
                    { view: 'forms', icon: <FileText size={20} />, label: 'Forms' },
                    { view: 'analytics', icon: <PieChart size={20} />, label: 'Analytics' },
                    { view: 'settings', icon: <Settings size={20} />, label: 'Settings' },
                ].map(({ view, icon, label }) => (
                    <button
                        key={view}
                        className={`mobile-nav-tab ${activeView === view ? 'active' : ''}`}
                        onClick={() => { setActiveView(view); setIsMobileMenuOpen(false); }}
                    >
                        <div className="mobile-nav-icon">{icon}</div>
                        {label}
                    </button>
                ))}
            </nav>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                            <X size={20} />
                        </button>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Delete Form?</h2>
                        <p style={{ marginBottom: '2rem', color: 'hsl(var(--v-text-muted))' }}>This action is permanent and will delete all questions and responses.</p>
                        <div className="flex" style={{ gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ background: '#ef4444' }} onClick={handleDelete}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="vellum-toast fade-in" style={{ borderColor: toast.type === 'error' ? '#ef4444' : 'hsl(var(--v-primary))' }}>
                    {toast.type === 'error' ? <LogOut size={18} style={{ transform: 'rotate(180deg)', color: '#ef4444' }} /> : <CheckCircle size={18} color="hsl(var(--v-primary))" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
