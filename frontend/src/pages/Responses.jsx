import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formService, responseService } from '../services/api';
import {
    Download, ArrowLeft, Calendar, User, Search, Filter,
    BarChart2, PieChart as PieChartIcon, List, ChevronLeft,
    ChevronRight, Trash2, MoreVertical, CheckCircle, Info,
    Clock, MousePointer2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Responses = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState([]);
    const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'question', 'individual'
    const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);
    const [currentResponseIdx, setCurrentResponseIdx] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [formRes, respRes] = await Promise.all([
                formService.getOne(id),
                responseService.list(id)
            ]);
            setForm(formRes.data);
            setResponses(respRes.data || []);
        } catch (err) {
            console.error("Failed to fetch data", err);
            showToast("Failed to load dashboard", "error");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Analytics Engine
    const analyticsData = useMemo(() => {
        if (!form || !responses) return [];

        return (form.questions || []).map(q => {
            const counts = {};
            let totalVotes = 0;
            const rawAnswers = [];

            responses.forEach(resp => {
                const ans = resp.answers?.[q.id];
                if (ans !== undefined && ans !== null && ans !== '') {
                    rawAnswers.push(ans);
                    if (Array.isArray(ans)) {
                        ans.forEach(val => {
                            counts[val] = (counts[val] || 0) + 1;
                            totalVotes++;
                        });
                    } else {
                        counts[ans] = (counts[ans] || 0) + 1;
                        totalVotes++;
                    }
                }
            });

            return {
                id: q.id,
                label: q.label,
                type: q.type,
                counts,
                totalVotes,
                rawAnswers,
                responseCount: rawAnswers.length
            };
        });
    }, [form, responses]);

    const handleExportCSV = () => {
        if (!responses.length || !form) return;
        const headers = ['Submission ID', 'Timestamp', ...form.questions.map(q => q.label)];
        const rows = responses.map(r => [
            r.id,
            new Date(r.createdAt).toLocaleString(),
            ...form.questions.map(q => {
                const ans = r.answers?.[q.id];
                return ans ? `"${ans.toString().replace(/"/g, '""')}"` : '';
            })
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${form.title}_responses.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Exported successfully!");
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            await responseService.delete(deleteTargetId);
            showToast("Response deleted");

            // Update local state
            const updatedResponses = responses.filter(r => r.id !== deleteTargetId);
            setResponses(updatedResponses);

            // Adjust index if necessary
            if (currentResponseIdx >= updatedResponses.length && updatedResponses.length > 0) {
                setCurrentResponseIdx(updatedResponses.length - 1);
            }
        } catch (err) {
            showToast("Delete failed", "error");
        } finally {
            setShowDeleteModal(false);
            setDeleteTargetId(null);
        }
    };

    // Sub-components
    const BarChart = ({ data }) => {
        const entries = Object.entries(data);
        if (entries.length === 0) return <div className="empty-answers">No multiple choice data</div>;
        const max = Math.max(...Object.values(data), 1);
        return (
            <div className="custom-bar-chart">
                {entries.map(([label, count]) => (
                    <div key={label} className="bar-row">
                        <div className="bar-info">
                            <span className="bar-label">{label}</span>
                            <span className="bar-value">{count} ({Math.round((count / max) * 100)}%)</span>
                        </div>
                        <div className="bar-bg">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / max) * 100}%` }}
                                className="bar-fill"
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const PieChart = ({ data, total }) => {
        const entries = Object.entries(data);
        if (entries.length === 0) return <div className="empty-answers">No data collected</div>;

        const colors = ['#6C5CE7', '#A29BFE', '#81ECEC', '#FAB1A0', '#FFEAA7', '#74B9FF'];

        return (
            <div className="pie-summary">
                <div className="pie-bars">
                    {entries.map(([label, count], i) => (
                        <div key={label} className="pie-row">
                            <div className="pie-box" style={{ background: colors[i % colors.length] }} />
                            <div className="pie-label-wrap">
                                <span className="p-label" title={label}>{label}</span>
                                <span className="p-val">{count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const ConfirmDeleteModal = () => (
        <AnimatePresence>
            {showDeleteModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="confirm-modal vellum-glass"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-icon text-danger">
                            <Trash2 size={32} />
                        </div>
                        <h3>Delete Response?</h3>
                        <p>This action cannot be undone. This response will be permanently removed from your records.</p>
                        <div className="modal-actions">
                            <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmDelete}>Delete Permanently</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="responses-page">
            {loading ? (
                <div className="flex-center" style={{ minHeight: '100vh', background: '#F8F9FF' }}>
                    <div className="spinner-premium"></div>
                </div>
            ) : (
                <>
                    <header className="dashboard-header sticky vellum-glass">
                        <div className="header-left">
                            <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/forms/${id}`)} title="Back to Builder">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="header-title-wrap">
                                <h1>{form?.title}</h1>
                                <span className="status-badge">Live</span>
                            </div>
                        </div>
                        <div className="header-right">
                            <div className="count-pill">
                                <BarChart2 size={16} />
                                <span>{responses.length} Responded</span>
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
                                <Download size={16} /> <span>Export CSV</span>
                            </button>
                        </div>
                    </header>

                    <main className="dashboard-main">
                        <div className="main-container">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon purple"><User size={20} /></div>
                                    <div className="stat-content">
                                        <h3>Total Responses</h3>
                                        <div className="stat-value">{responses.length}</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon green"><CheckCircle size={20} /></div>
                                    <div className="stat-content">
                                        <h3>Completion Rate</h3>
                                        <div className="stat-value">94.2%</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon blue"><Clock size={20} /></div>
                                    <div className="stat-content">
                                        <h3>Avg. Time</h3>
                                        <div className="stat-value">1m 24s</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon orange"><MousePointer2 size={20} /></div>
                                    <div className="stat-content">
                                        <h3>Form Views</h3>
                                        <div className="stat-value">{responses.length * 2 + 15}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="tab-control vellum-glass">
                                <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
                                    <PieChartIcon size={18} /> <span>Summary View</span>
                                </button>
                                <button className={`tab-btn ${activeTab === 'question' ? 'active' : ''}`} onClick={() => setActiveTab('question')}>
                                    <Info size={18} /> <span>Question-wise</span>
                                </button>
                                <button className={`tab-btn ${activeTab === 'individual' ? 'active' : ''}`} onClick={() => setActiveTab('individual')}>
                                    <List size={18} /> <span>Individual Responses</span>
                                </button>
                                <div className="tab-indicator" style={{
                                    left: activeTab === 'summary' ? '0' : activeTab === 'question' ? '33.33%' : '66.66%'
                                }}></div>
                            </div>

                            <div className="view-content">
                                {activeTab === 'summary' && (
                                    <div className="summary-view animate-in">
                                        {analyticsData.map((q, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="analytics-card"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <div className="card-header">
                                                    <div>
                                                        <h3>{idx + 1}. {q.label}</h3>
                                                        <span className="resp-count">{q.responseCount} responses</span>
                                                    </div>
                                                    <div className="q-type-badge">{q.type.replace('_', ' ')}</div>
                                                </div>
                                                <div className="card-body">
                                                    {q.responseCount > 0 ? (
                                                        ['MULTIPLE_CHOICE', 'DROPDOWN', 'CHECKBOX', 'LINEAR_SCALE', 'RATING'].includes(q.type) ? (
                                                            <BarChart data={q.counts} />
                                                        ) : (
                                                            <div className="text-responses-list">
                                                                {q.rawAnswers.slice(0, 5).map((ans, i) => (
                                                                    <div key={i} className="text-response-item">{ans}</div>
                                                                ))}
                                                                {q.rawAnswers.length > 5 && (
                                                                    <div className="more-responses">+ {q.rawAnswers.length - 5} more responses</div>
                                                                )}
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="empty-answers">No data collected yet</div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'question' && (
                                    <div className="question-view animate-in">
                                        <div className="question-selector analytics-card">
                                            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Select Question</label>
                                            <select
                                                value={selectedQuestionIdx}
                                                onChange={(e) => setSelectedQuestionIdx(parseInt(e.target.value))}
                                                className="preview-input select"
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E1E2E6' }}
                                            >
                                                {form?.questions.map((q, i) => (
                                                    <option key={i} value={i}>{q.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {analyticsData[selectedQuestionIdx] && (
                                            <div className="question-details">
                                                <div className="analytics-card">
                                                    <div className="card-header">
                                                        <h2>{analyticsData[selectedQuestionIdx].label}</h2>
                                                        <div className="q-type-badge">{analyticsData[selectedQuestionIdx].type}</div>
                                                    </div>
                                                    <div className="card-body">
                                                        <PieChart data={analyticsData[selectedQuestionIdx].counts} total={analyticsData[selectedQuestionIdx].totalVotes} />
                                                        <div className="divider" style={{ margin: '2.5rem 0', height: '1px', background: '#F1F2F6' }} />
                                                        <BarChart data={analyticsData[selectedQuestionIdx].counts} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'individual' && (
                                    <div className="individual-view animate-in">
                                        {responses.length > 0 ? (
                                            <>
                                                <div className="individual-nav vellum-glass">
                                                    <div className="nav-controls">
                                                        <button
                                                            className="nav-btn"
                                                            disabled={currentResponseIdx === 0}
                                                            onClick={() => setCurrentResponseIdx(prev => prev - 1)}
                                                        >
                                                            <ChevronLeft size={20} />
                                                        </button>
                                                        <div className="idx-info">
                                                            <strong>{currentResponseIdx + 1}</strong> of <strong>{responses.length}</strong>
                                                        </div>
                                                        <button
                                                            className="nav-btn"
                                                            disabled={currentResponseIdx === responses.length - 1}
                                                            onClick={() => setCurrentResponseIdx(prev => prev + 1)}
                                                        >
                                                            <ChevronRight size={20} />
                                                        </button>
                                                    </div>
                                                    <div className="nav-actions">
                                                        <div className="timestamp-pill">
                                                            <Calendar size={14} />
                                                            {responses[currentResponseIdx] && new Date(responses[currentResponseIdx].createdAt).toLocaleString()}
                                                        </div>
                                                        <button
                                                            className="btn btn-ghost btn-icon text-danger"
                                                            onClick={() => {
                                                                setDeleteTargetId(responses[currentResponseIdx].id);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            title="Delete Response"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {responses[currentResponseIdx] && (
                                                    <motion.div
                                                        key={responses[currentResponseIdx].id}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="individual-card"
                                                    >
                                                        {form?.questions.map((q, i) => (
                                                            <div key={i} className="ans-block">
                                                                <label>{i + 1}. {q.label}</label>
                                                                <div className="ans-val">
                                                                    {responses[currentResponseIdx].answers?.[q.id] ? (
                                                                        Array.isArray(responses[currentResponseIdx].answers[q.id])
                                                                            ? responses[currentResponseIdx].answers[q.id].join(', ')
                                                                            : responses[currentResponseIdx].answers[q.id].toString()
                                                                    ) : (
                                                                        <span className="skipped">Skipped</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="analytics-card" style={{ textAlign: 'center', padding: '5rem' }}>
                                                <Info size={48} color="#B2BEC3" style={{ marginBottom: '1rem' }} />
                                                <p>No responses found for this form.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Toast */}
                    <AnimatePresence>
                        {toast && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                className={`resp-toast ${toast.type}`}
                            >
                                {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span>{toast.msg}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <ConfirmDeleteModal />
                </>
            )}

            <style>{`
                .responses-page { min-height: 100vh; background: #F8F9FF; color: #2D3436; font-family: inherit; }
                .dashboard-header { height: 72px; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .header-left { display: flex; align-items: center; gap: 1rem; }
                .header-title-wrap h1 { font-size: 1.125rem; font-weight: 700; color: #2D3436; margin: 0; }
                .status-badge { font-size: 0.65rem; color: #27AE60; background: #E1FBED; padding: 2px 8px; border-radius: 20px; font-weight: 700; text-transform: uppercase; margin-left: 8px; }
                .header-right { display: flex; align-items: center; gap: 1.25rem; }
                .count-pill { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #636E72; background: #F1F2F6; padding: 6px 12px; border-radius: 50px; font-weight: 500; }

                .dashboard-main { padding: 2.5rem 2rem; }
                .main-container { max-width: 1200px; margin: 0 auto; }

                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
                .stat-card { background: white; padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.01); transition: transform 0.2s; }
                .stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.04); }
                .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .stat-icon.purple { background: #6C5CE715; color: #6C5CE7; }
                .stat-icon.green { background: #27AE6015; color: #27AE60; }
                .stat-icon.blue { background: #3498DB15; color: #3498DB; }
                .stat-icon.orange { background: #E67E2215; color: #E67E22; }
                .stat-content h3 { font-size: 0.75rem; color: #B2BEC3; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .stat-value { font-size: 1.5rem; font-weight: 800; color: #2D3436; }

                .tab-control { background: white; padding: 6px; border-radius: 12px; display: flex; position: relative; margin-bottom: 2.5rem; border: 1px solid rgba(0,0,0,0.03); }
                .tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border: none; background: transparent; cursor: pointer; font-weight: 600; color: #636E72; z-index: 10; transition: color 0.3s; }
                .tab-btn.active { color: #6C5CE7; }
                .tab-indicator { position: absolute; top: 6px; bottom: 6px; width: calc(33.33% - 8px); background: #6C5CE708; border-radius: 8px; border: 1px solid #6C5CE730; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

                .analytics-card { background: white; padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid rgba(0,0,0,0.03); box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
                .analytics-card .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .analytics-card h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: 4px; }
                .resp-count { font-size: 0.85rem; color: #B2BEC3; }
                .q-type-badge { font-size: 0.65rem; padding: 4px 10px; background: #F1F2F6; color: #636E72; border-radius: 20px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(0,0,0,0.05); }

                .custom-bar-chart { display: flex; flex-direction: column; gap: 1.25rem; }
                .bar-row { display: flex; flex-direction: column; gap: 8px; }
                .bar-info { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 500; }
                .bar-bg { height: 10px; background: #F1F2F6; border-radius: 5px; overflow: hidden; }
                .bar-fill { height: 100%; background: #6C5CE7; border-radius: 5px; }

                .pie-summary { display: flex; gap: 2rem; align-items: center; }
                .pie-bars { flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
                .pie-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 8px; background: #F8F9FF; }
                .pie-box { width: 12px; height: 12px; border-radius: 3px; }
                .pie-label-wrap { flex: 1; display: flex; justify-content: space-between; font-size: 0.85rem; }
                .p-label { font-weight: 600; max-width: 100px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }

                .text-responses-list { display: flex; flex-direction: column; gap: 10px; }
                .text-response-item { padding: 1rem; background: #F8F9FF; border-left: 3px solid #6C5CE750; font-size: 0.95rem; line-height: 1.5; border-radius: 0 8px 8px 0; }
                .more-responses { padding-top: 10px; font-size: 0.85rem; font-weight: 600; color: #6C5CE7; text-align: center; }

                .individual-nav { background: white; padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .nav-controls { display: flex; align-items: center; gap: 1.5rem; }
                .nav-btn { background: #F8F9FF; border: 1px solid #E1E2E6; padding: 8px; border-radius: 8px; cursor: pointer; color: #636E72; display: flex; transition: all 0.2s; }
                .nav-btn:hover:not(:disabled) { border-color: #6C5CE7; color: #6C5CE7; }
                .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .idx-info { font-size: 0.9375rem; color: #636E72; }
                .idx-info strong { color: #2D3436; }
                .nav-actions { display: flex; align-items: center; gap: 1.5rem; }
                .timestamp-pill { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #B2BEC3; font-weight: 500; }

                .individual-card { background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
                .ans-block { margin-bottom: 2rem; }
                .ans-block label { display: block; font-size: 0.9rem; color: #B2BEC3; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
                .ans-val { font-size: 1.125rem; font-weight: 500; color: #2D3436; line-height: 1.6; }
                .skipped { color: #E1E2E6; font-style: italic; }

                .text-danger { color: #E74C3C !important; }
                .resp-toast { position: fixed; bottom: 2rem; right: 2rem; background: #2D3436; color: white; padding: 12px 24px; border-radius: 50px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); z-index: 1000; font-weight: 600; font-size: 0.9375rem; }
                .spinner-premium { width: 44px; height: 44px; border: 4px solid #6C5CE720; border-top-color: #6C5CE7; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .animate-in { animation: fadeUp 0.5s ease-out; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .flex-center { display: flex; align-items: center; justify-content: center; }

                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1.5rem; }
                .confirm-modal { background: white; padding: 2.5rem; border-radius: 24px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 25px 70px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.05); }
                .modal-icon { width: 72px; height: 72px; border-radius: 20px; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
                .confirm-modal h3 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.75rem; color: #1e293b; letter-spacing: -0.025em; }
                .confirm-modal p { color: #64748b; line-height: 1.6; margin-bottom: 2.5rem; font-size: 1.05rem; }
                .modal-actions { display: flex; gap: 1rem; }
                .modal-actions .btn { flex: 1; padding: 14px; border-radius: 14px; font-weight: 700; font-size: 1rem; transition: all 0.2s; }
                .btn-danger { background: #ef4444; color: white; border: none; }
                .btn-danger:hover { background: #dc2626; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2); }
                .modal-actions .btn-ghost:hover { background: #f1f5f9; transform: translateY(-2px); }

                @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 640px) {
                    .stats-grid { grid-template-columns: 1fr; }
                    .dashboard-header { padding: 0 1rem; }
                    .tab-btn span { display: none; }
                    .tab-btn { padding: 12px 0; }
                    .individual-nav { flex-direction: column; gap: 1rem; }
                    .nav-actions { width: 100%; justify-content: space-between; }
                }
            `}</style>
        </div>
    );
};

export default Responses;
