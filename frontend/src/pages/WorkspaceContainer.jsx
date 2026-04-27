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
    ArrowLeft
} from 'lucide-react';

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
        className="dashboard-stat-card-enhanced"
        style={{
            background: 'linear-gradient(145deg, hsl(var(--v-surface)), hsl(var(--v-bg)))',
            border: '1px solid hsl(var(--v-border))',
            color: 'hsl(var(--v-text-main))'
        }}
    >
        <div className="stat-icon-enhanced" style={{ background: 'hsl(var(--v-primary) / 0.1)', color: 'hsl(var(--v-primary))' }}>
            {icon}
        </div>
        <div className="stat-content-enhanced">
            <div className="stat-value-enhanced">{value}</div>
            <div className="stat-label-enhanced">{label}</div>
            {trend && (
                <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
        <ChevronRight size={20} style={{ color: 'hsl(var(--v-text-muted))', opacity: 0.5 }} />
    </motion.div>
);

const Dashboard = () => {
    const { user, isDarkMode, toggleTheme, updateUser } = useAuth();
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
    const [avatarColor, setAvatarColor] = useState(() => {
        const pref = localStorage.getItem('vellum_avatar_pref');
        return pref ? JSON.parse(pref).color : '#3b82f6'; // Match ProfileDropdown default
    });

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
                search: searchTerm
            });
            // Handle both new structure { forms, pagination } and potential old/direct structure
            if (res.data.forms) {
                setForms(res.data.forms);
                setTotalPages(res.data.pagination.totalPages);
            } else {
                setForms(res.data); // Fallback
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Use effect to fetch when page or search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchForms();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [page, searchTerm]);

    // Derived state for stats only (if needed, otherwise rely on backend stats endpoint)
    // Note: This is an approximation since we're paginating now.
    // Ideally, we should have a `formService.stats()` endpoint.
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
                    <div className="dashboard-orb d-orb-1"></div>
                    <div className="dashboard-orb d-orb-2"></div>
                </div>
                <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
                    <div className="spinner" style={{ width: 40, height: 40, border: '3px solid hsl(var(--v-border))', borderTopColor: 'hsl(var(--v-primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: 'hsl(var(--v-text-muted))' }}>Loading workspace...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const renderOverview = () => (
        <>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dashboard-hero"
            >
                <div>
                    <h1 className="dashboard-title">
                        Hello, {user?.name.split(' ')[0]}
                    </h1>
                    <p className="dashboard-subtitle">
                        Here's what's happening in your workspace today.
                    </p>
                </div>
                <button
                    className="btn btn-primary btn-large"
                    onClick={createNewForm}
                    style={{ gap: '0.75rem', boxShadow: '0 8px 20px -4px hsl(var(--v-primary) / 0.4)' }}
                >
                    <Plus size={24} /> Create New Form
                </button>
            </motion.div>

            {/* Stats Overview */}
            <div className="dashboard-stats-grid">
                <StatCard
                    icon={<Layout size={24} />}
                    label="Total Forms"
                    value={forms.length}
                    trend="+2 this week"
                    delay={0.1}
                />
                <StatCard
                    icon={<BarChart size={24} />}
                    label="Total Responses"
                    value={totalResponses}
                    trend="+12% vs last week"
                    delay={0.2}
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    label="Active Forms"
                    value={activeForms}
                    delay={0.3}
                />
            </div>

            {/* Templates Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="dashboard-section"
            >
                <div className="section-header">
                    <h2 className="section-title">Start from a template</h2>
                    <p className="section-description">Launch a new project quickly with our pre-built templates.</p>
                </div>
                <div className="dashboard-templates-grid">
                    {templates.map((t, i) => (
                        <TemplateCard
                            key={t.id}
                            template={t}
                            onClick={() => createFromTemplate(t)}
                            delay={0.4 + (i * 0.1)}
                        />
                    ))}
                </div>
            </motion.section>

            {/* Recent Forms (Limited) */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="dashboard-section"
            >
                <div className="section-header flex-between">
                    <div>
                        <h2 className="section-title">Recent Forms</h2>
                        <p className="section-description">Manage your most recent active forms.</p>
                    </div>
                    <button className="btn btn-ghost" onClick={() => setActiveView('forms')} style={{ color: 'hsl(var(--v-primary))' }}>View All</button>
                </div>
                {renderFormsGrid(forms.slice(0, 3))}
            </motion.section>
        </>
    );

    const renderMyForms = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="view-header">
                <div>
                    <h1 className="view-title">My Forms</h1>
                    <p className="view-subtitle">Manage, edit, and analyze all your forms.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={createNewForm}
                    style={{ gap: '0.5rem' }}
                >
                    <Plus size={20} /> New Form
                </button>
            </div>

            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div className="vellum-input" style={{ width: '300px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Search size={20} color="hsl(var(--v-text-muted))" />
                    <input
                        type="text"
                        placeholder="Search forms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: 'inherit', width: '100%' }}
                    />
                </div>
                {/* Future: Filters */}
            </div>

            {renderFormsGrid(forms)}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex-center" style={{ marginTop: '2rem', gap: '1rem' }}>
                    <button
                        className="btn btn-outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>
                    <span style={{ color: 'hsl(var(--v-text-muted))' }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="btn btn-outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </button>
                </div>
            )}
        </motion.div>
    );

    const renderAnalytics = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="view-header">
                <div>
                    <h1 className="view-title">Analytics Overview</h1>
                    <p className="view-subtitle">Insights into your form performance.</p>
                </div>
                <div className="vellum-chip">Last 30 Days</div>
            </div>

            <div className="dashboard-stats-grid" style={{ marginBottom: '3rem' }}>
                <StatCard icon={<Layout size={24} />} label="Total Forms" value={forms.length} delay={0.1} />
                <StatCard icon={<BarChart size={24} />} label="Total Responses" value={totalResponses} trend="+12%" delay={0.2} />
                <StatCard icon={<CheckCircle size={24} />} label="Avg. Completion" value="84%" trend="+5%" delay={0.3} />
            </div>

            <div className="vellum-card-premium" style={{ padding: '3rem', textAlign: 'center' }}>
                <PieChart size={64} style={{ color: 'hsl(var(--v-primary) / 0.3)', marginBottom: '1.5rem', marginInline: 'auto' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Detailed Analytics Coming Soon</h3>
                <p style={{ color: 'hsl(var(--v-text-muted))' }}>We're building advanced charts and breakdown reports.</p>
            </div>
        </motion.div>
    );


    const renderSettings = () => {
        const [name, setName] = useState(user?.name || '');
        const [saving, setSaving] = useState(false);

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

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '2rem'
                }}
            >
                <div className="view-header" style={{ width: '100%', marginBottom: '3rem', textAlign: 'center', position: 'relative' }}>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setActiveView('overview')}
                        style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div>
                        <h1 className="view-title" style={{ fontSize: '2.5rem' }}>Account Settings</h1>
                        <p className="view-subtitle">Manage your profile, theme, and security preferences.</p>
                    </div>
                </div>

                <div className="settings-grid-centered" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '2.5rem',
                    width: '100%',
                    justifyContent: 'center'
                }}>
                    {/* Profile Section */}
                    <div className="vellum-card-premium" style={{ flex: '1 1 450px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%', background: avatarColor,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2rem', fontWeight: 700, color: 'white',
                                boxShadow: '0 0 20px hsl(var(--v-primary) / 0.2)',
                                transition: 'background 0.3s ease'
                            }}>
                                {user?.name.charAt(0)}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user?.name}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#6C5CE7'].map(color => (
                                        <div
                                            key={color}
                                            onClick={() => {
                                                setAvatarColor(color);
                                                localStorage.setItem('vellum_avatar_pref', JSON.stringify({ color }));
                                                window.dispatchEvent(new Event('storage'));
                                            }}
                                            style={{
                                                width: '24px', height: '24px', borderRadius: '50%', background: color,
                                                cursor: 'pointer', border: avatarColor === color ? '3px solid white' : 'none',
                                                boxShadow: '0 0 0 1px hsl(var(--v-border))',
                                                transition: 'transform 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
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

                    {/* Security/Password Section */}
                    <div className="vellum-card-premium" style={{ flex: '1 1 350px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <Shield size={24} style={{ color: 'hsl(var(--v-primary))' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Security</h3>
                        </div>

                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--v-text-muted))' }}>Update your password to keep your account secure.</p>
                            <button
                                className="btn btn-outline"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => window.dispatchEvent(new CustomEvent('vellum-notify', { detail: { msg: 'Please use the profile dropdown to change your password.', type: 'info' } }))}
                            >
                                <Shield size={18} /> Change Password
                            </button>
                        </div>

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

    const renderFormsGrid = (formsList) => {
        if (formsList.length === 0) {
            return (
                <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                    <Layout size={48} style={{ marginBottom: '1rem', opacity: 0.2, color: 'hsl(var(--v-text-main))' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
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
                        <Link to={`/forms/${f.id}`} className="vellum-card-premium" style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}>
                            <div className="form-visual-preview">
                                <div className="form-visual-icon">
                                    <Layout size={24} />
                                </div>
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                    <div className={`form-status-badge ${f.isPublic ? 'live' : 'private'}`} style={{
                                        background: f.isPublic ? 'hsl(142 76% 36% / 0.1)' : 'hsl(215 16% 47% / 0.1)',
                                        color: f.isPublic ? 'hsl(142 76% 36%)' : 'hsl(215 16% 47%)',
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '999px',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div>
                                        {f.isPublic ? 'Live' : 'Private'}
                                    </div>
                                </div>
                            </div>
                            <div className="form-card-body" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 className="form-card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.4', color: 'hsl(var(--v-text-main))', fontWeight: 600 }}>{f.title}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--v-text-muted))', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {f.description || 'No description provided.'}
                                </p>
                                <div className="form-card-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid hsl(var(--v-border) / 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="form-responses" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--v-text-muted))' }}>
                                        <BarChart size={16} />
                                        <span>{f._count?.responses || 0} responses</span>
                                    </div>
                                    <div
                                        className="form-delete-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDeletingId(f.id);
                                            setShowDeleteModal(true);
                                        }}
                                        title="Delete Form"
                                        style={{ padding: '0.5rem', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Trash2 size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-background">
                <div className="dashboard-orb d-orb-1"></div>
                <div className="dashboard-orb d-orb-2"></div>
                <div className="dashboard-orb d-orb-3"></div>
            </div>

            <div className="dashboard-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
                {/* Sidebar */}
                <div className="dashboard-sidebar vellum-glass">
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

                    <div style={{ marginTop: 'auto', padding: '1.5rem' }}>
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
                <main className="dashboard-content-wrapper" style={{ flex: 1, overflowY: 'auto', height: '100vh', paddingBottom: '2rem' }}>
                    {activeView === 'overview' && renderOverview()}
                    {activeView === 'forms' && renderMyForms()}
                    {activeView === 'analytics' && renderAnalytics()}
                    {activeView === 'settings' && renderSettings()}
                </main>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Delete Form?</h2>
                        <p style={{ marginBottom: '2rem' }}>This action is permanent and will delete all questions and responses.</p>
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
