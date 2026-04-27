import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formService, responseService } from '../services/api';
import {
    Calendar, Star, Upload, Info, AlertCircle, CheckCircle,
    ChevronLeft, ChevronRight, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const PublicForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchForm = useCallback(async () => {
        try {
            const res = await formService.getById(id);
            if (!res.data) throw new Error("Form not found");
            setForm(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchForm();
    }, [fetchForm]);

    // Split questions into sections if any exist
    const sections = useMemo(() => {
        if (!form?.questions) return [];
        const result = [];
        let currentSection = { questions: [] };

        form.questions.forEach(q => {
            if (q.type === 'SECTION') {
                if (currentSection.questions.length > 0 || currentSection.title) {
                    result.push(currentSection);
                }
                currentSection = { title: q.label, description: q.description, questions: [] };
            } else {
                currentSection.questions.push(q);
            }
        });

        if (currentSection.questions.length > 0 || currentSection.title) {
            result.push(currentSection);
        }

        // Fallback for forms with no sections
        return result.length > 0 ? result : [{ questions: form.questions }];
    }, [form]);

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
        if (errors[qId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[qId];
                return newErrors;
            });
        }
    };

    const validatePage = (pageIdx) => {
        const newErrors = {};
        const pageQuestions = sections[pageIdx]?.questions || [];

        pageQuestions.forEach(q => {
            if (q.required) {
                const ans = answers[q.id];
                if (ans === undefined || ans === '' || (Array.isArray(ans) && ans.length === 0)) {
                    newErrors[q.id] = 'This field is required';
                }
            }
        });

        setErrors(prev => ({ ...prev, ...newErrors }));

        const firstErrorId = Object.keys(newErrors)[0];
        if (firstErrorId) {
            const el = document.getElementById(`question-${firstErrorId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Validate all pages before final submission
        let allValid = true;
        for (let i = 0; i <= currentPage; i++) {
            if (!validatePage(i)) {
                setCurrentPage(i);
                allValid = false;
                break;
            }
        }
        if (!allValid) return;

        setSubmitting(true);
        try {
            await responseService.submit(id, { answers });
            setSubmitted(true);
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#6C5CE7', '#A29BFE', '#FFFFFF']
            });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Submission failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex-center" style={{ minHeight: '100vh', background: '#F8F9FF' }}>
            <div className="spinner-premium"></div>
        </div>
    );

    if (!form || (!form.isPublic && !submitted)) return (
        <div className="flex-center" style={{ minHeight: '100vh', background: '#F8F9FF', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="error-card vellum-glass">
                <AlertCircle size={48} className="text-danger" style={{ marginBottom: '1.5rem' }} />
                <h2>Form Unavailable</h2>
                <p>This form is either private, closed, or does not exist.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>Back to Vellum</button>
            </motion.div>
        </div>
    );

    const renderQuestionInput = (q) => {
        switch (q.type) {
            case 'TEXT':
                return (
                    <input
                        type="text"
                        className="public-input"
                        placeholder="Your answer"
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                );
            case 'PARAGRAPH':
                return (
                    <textarea
                        className="public-input textarea"
                        placeholder="Your long answer"
                        rows={4}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                );
            case 'MULTIPLE_CHOICE':
                return (
                    <div className="options-group">
                        {q.options?.map((opt, i) => (
                            <label key={i} className={`option-item ${answers[q.id] === opt ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name={q.id}
                                    value={opt}
                                    checked={answers[q.id] === opt}
                                    onChange={() => handleAnswerChange(q.id, opt)}
                                />
                                <span className="radio-dot"></span>
                                <span className="option-label">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'CHECKBOX':
                return (
                    <div className="options-group">
                        {q.options?.map((opt, i) => (
                            <label key={i} className={`option-item checkbox ${answers[q.id]?.includes(opt) ? 'active' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={answers[q.id]?.includes(opt) || false}
                                    onChange={(e) => {
                                        const current = answers[q.id] || [];
                                        if (e.target.checked) handleAnswerChange(q.id, [...current, opt]);
                                        else handleAnswerChange(q.id, current.filter(v => v !== opt));
                                    }}
                                />
                                <span className="checkbox-box"></span>
                                <span className="option-label">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'DROPDOWN':
                return (
                    <select
                        className="public-input select"
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    >
                        <option value="">Select option</option>
                        {q.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'DATE':
                return (
                    <div className="input-with-icon">
                        <Calendar size={18} className="input-icon" />
                        <input
                            type="date"
                            className="public-input with-icon"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        />
                    </div>
                );
            case 'LINEAR_SCALE':
                return (
                    <div className="linear-scale-group">
                        {[1, 2, 3, 4, 5].map(val => (
                            <button
                                key={val}
                                type="button"
                                className={`scale-btn ${answers[q.id] === val ? 'active' : ''}`}
                                onClick={() => handleAnswerChange(q.id, val)}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                );
            case 'RATING':
                return (
                    <div className="rating-group">
                        {[1, 2, 3, 4, 5].map(val => (
                            <Star
                                key={val}
                                size={32}
                                className={`star-icon ${answers[q.id] >= val ? 'active' : ''}`}
                                fill={answers[q.id] >= val ? 'currentColor' : 'none'}
                                onClick={() => handleAnswerChange(q.id, val)}
                            />
                        ))}
                    </div>
                );
            case 'FILE_UPLOAD':
                return (
                    <label className="file-upload-zone">
                        <Upload size={24} />
                        <span>Upload File</span>
                        <input type="file" className="hidden" onChange={() => handleAnswerChange(q.id, 'file_uploaded')} />
                        {answers[q.id] && <div className="file-chip">File Selected</div>}
                    </label>
                );
            default:
                return null;
        }
    };

    const currentSection = sections[currentPage];

    return (
        <div className="public-page">
            <header className="public-header minimal vellum-glass">
                <div className="header-content">
                    <div className="brand" onClick={() => navigate('/')}>
                        <Globe size={20} className="brand-icon" />
                        <span>Vellum</span>
                    </div>
                    {sections.length > 1 && (
                        <div className="form-progress">
                            <div className="progress-text">Page {currentPage + 1} of {sections.length}</div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${((currentPage + 1) / sections.length) * 100}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="public-main">
                <div className="form-container">
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.div
                                key={currentPage}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="form-card"
                            >
                                {currentPage === 0 && (
                                    <div className="form-head">
                                        <h1>{form.title}</h1>
                                        <p>{form.description}</p>
                                        <div className="divider"></div>
                                    </div>
                                )}

                                {currentSection?.title && (
                                    <div className="section-head">
                                        <h2>{currentSection.title}</h2>
                                        {currentSection.description && <p>{currentSection.description}</p>}
                                    </div>
                                )}

                                <div className="questions-list">
                                    {currentSection?.questions.map((q, i) => (
                                        <div
                                            key={q.id}
                                            id={`question-${q.id}`}
                                            className={`question-block ${errors[q.id] ? 'has-error' : ''}`}
                                        >
                                            <div className="question-header">
                                                <label className="q-label">
                                                    {q.label}
                                                    {q.required && <span className="required">*</span>}
                                                </label>
                                            </div>
                                            {q.description && <p className="q-desc">{q.description}</p>}
                                            <div className="q-input-wrapper">
                                                {renderQuestionInput(q)}
                                            </div>
                                            <AnimatePresence>
                                                {errors[q.id] && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="error-msg"
                                                    >
                                                        <AlertCircle size={14} /> {errors[q.id]}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-footer-actions">
                                    {currentPage > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                        >
                                            <ChevronLeft size={20} /> Previous
                                        </button>
                                    )}

                                    {currentPage < sections.length - 1 ? (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-large"
                                            onClick={() => {
                                                if (validatePage(currentPage)) {
                                                    setCurrentPage(prev => prev + 1);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }
                                            }}
                                        >
                                            Next <ChevronRight size={20} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-large"
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <span className="flex-center gap-2">
                                                    <div className="spinner-small"></div> Submitting...
                                                </span>
                                            ) : 'Submit Response'}
                                        </button>
                                    )}
                                </div>
                                <div className="branding-subtle">
                                    Powered by <strong>Vellum</strong>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="success-card vellum-glass"
                            >
                                <div className="success-icon-wrap">
                                    <CheckCircle size={64} className="text-success" />
                                </div>
                                <h1>Response Recorded!</h1>
                                <p>Thank you for filling out <strong>{form.title}</strong>. Your response has been securely saved.</p>
                                <button className="btn btn-outline" onClick={() => window.location.reload()}>
                                    Submit another response
                                </button>
                                <div className="branding-footer">Powered by <span>Vellum</span></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <style>{`
                .public-page {
                    min-height: 100vh;
                    background: #F8F9FF;
                    color: #1E293B;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
                .public-header {
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 1.5rem;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .header-content {
                    width: 100%;
                    max-width: 720px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 800;
                    font-size: 1.25rem;
                    color: #6C5CE7;
                    cursor: pointer;
                }
                .form-progress { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
                .progress-text { font-size: 0.75rem; font-weight: 600; color: #64748B; }
                .progress-bar-bg { width: 100px; height: 6px; background: #E2E8F0; border-radius: 10px; overflow: hidden; }
                .progress-bar-fill { height: 100%; background: #6C5CE7; transition: width 0.3s ease; }

                .public-main { padding: 3rem 1.5rem 6rem; }
                .form-container { max-width: 720px; margin: 0 auto; }

                .form-card {
                    background: white;
                    padding: 3rem;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.02);
                }
                .form-head { margin-bottom: 3rem; }
                .form-head h1 { font-size: 2.75rem; font-weight: 800; color: #0F172A; margin-bottom: 1rem; letter-spacing: -0.025em; line-height: 1.1; }
                .form-head p { font-size: 1.125rem; color: #64748B; line-height: 1.6; }
                .divider { height: 6px; background: #6C5CE7; border-radius: 10px; width: 80px; margin-top: 1.5rem; }

                .section-head { margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #F1F5F9; }
                .section-head h2 { font-size: 1.75rem; font-weight: 700; color: #1E293B; margin-bottom: 0.5rem; }
                .section-head p { color: #64748B; font-size: 1rem; }

                .question-block {
                    margin-bottom: 2.5rem;
                    padding: 1.5rem;
                    border-radius: 16px;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }
                .question-block:hover { background: #F8FAFC; }
                .question-block.has-error { background: #FEF2F2; border-color: #FECACA; }

                .q-label { font-size: 1.125rem; font-weight: 700; color: #0F172A; line-height: 1.4; display: block; margin-bottom: 0.75rem; }
                .required { color: #EF4444; margin-left: 4px; }
                .q-desc { font-size: 0.925rem; color: #64748B; margin-bottom: 1.25rem; line-height: 1.5; }

                .public-input {
                    width: 100%;
                    padding: 0.875rem 0;
                    border: none;
                    border-bottom: 2px solid #E2E8F0;
                    background: transparent;
                    font-size: 1.05rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .public-input:focus { border-color: #6C5CE7; }
                .public-input.textarea { border: 2px solid #E2E8F0; border-radius: 12px; padding: 1rem; background: #FFFFFF; }
                .public-input.textarea:focus { border-color: #6C5CE7; }
                .public-input.select { border: 2px solid #E2E8F0; border-radius: 12px; padding: 0.875rem 1rem; background: #FFFFFF; }

                .options-group { display: flex; flex-direction: column; gap: 0.75rem; }
                .option-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 1rem 1.25rem;
                    background: white;
                    border: 1.5px solid #E2E8F0;
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .option-item:hover { border-color: #CBD5E1; background: #F8FAFC; }
                .option-item.active { border-color: #6C5CE7; background: #EEF2FF; }
                .option-item input { display: none; }
                .radio-dot, .checkbox-box {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #CBD5E1;
                    border-radius: 50%;
                    position: relative;
                    transition: all 0.2s;
                }
                .checkbox-box { border-radius: 6px; }
                .option-item.active .radio-dot { border-color: #6C5CE7; background: #6C5CE7; }
                .option-item.active .radio-dot::after {
                    content: '';
                    position: absolute;
                    inset: 5px;
                    background: white;
                    border-radius: 50%;
                }
                .option-item.active .checkbox-box { background: #6C5CE7; border-color: #6C5CE7; }
                .option-item.active .checkbox-box::after {
                    content: '✓';
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                    font-weight: 900;
                }

                .linear-scale-group { display: flex; gap: 0.75rem; justify-content: center; padding: 1rem 0; }
                .scale-btn {
                    width: 52px;
                    height: 52px;
                    border-radius: 16px;
                    border: 2px solid #E2E8F0;
                    background: white;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #475569;
                }
                .scale-btn:hover { border-color: #6C5CE7; color: #6C5CE7; transform: translateY(-2px); }
                .scale-btn.active { background: #6C5CE7; border-color: #6C5CE7; color: white; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(108, 92, 231, 0.3); }

                .rating-group { display: flex; gap: 0.5rem; padding: 0.5rem 0; justify-content: center; }
                .star-icon { color: #E2E8F0; cursor: pointer; transition: all 0.2s; }
                .star-icon:hover { transform: scale(1.15); color: #F87171; }
                .star-icon.active { color: #F59E0B; }

                .file-upload-zone {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 2.5rem;
                    border: 2px dashed #E2E8F0;
                    border-radius: 16px;
                    cursor: pointer;
                    color: #64748B;
                    transition: all 0.2s;
                }
                .file-upload-zone:hover { border-color: #6C5CE7; background: #F5F3FF; color: #6C5CE7; }
                .hidden { display: none; }
                .file-chip { margin-top: 1rem; padding: 6px 16px; background: #DCFCE7; color: #166534; border-radius: 50px; font-size: 0.875rem; font-weight: 700; }

                .form-footer-actions { display: flex; gap: 1rem; margin-top: 4rem; justify-content: space-between; align-items: center; }
                .branding-subtle { text-align: center; margin-top: 3rem; font-size: 0.875rem; color: #94A3B8; opacity: 0.7; }
                .branding-subtle strong { color: #64748B; }

                .error-msg { display: flex; align-items: center; gap: 8px; color: #EF4444; font-size: 0.875rem; font-weight: 600; margin-top: 1rem; overflow: hidden; }

                .success-card { background: white; border-radius: 24px; padding: 5rem 3rem; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.02); }
                .success-icon-wrap { width: 100px; height: 100px; background: #DCFCE7; color: #22C55E; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2.5rem; }
                .success-card h1 { font-size: 2.5rem; font-weight: 800; color: #0F172A; margin-bottom: 1.5rem; letter-spacing: -0.025em; }
                .success-card p { color: #64748B; font-size: 1.125rem; line-height: 1.6; margin-bottom: 3.5rem; }
                .branding-footer { margin-top: 4rem; font-size: 0.875rem; color: #94A3B8; }
                .branding-footer span { font-weight: 700; color: #475569; }

                .error-card { background: white; padding: 4rem; border-radius: 24px; text-align: center; max-width: 480px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
                .error-card h2 { font-size: 1.75rem; font-weight: 800; color: #1E293B; margin-bottom: 1rem; }
                .error-card p { color: #64748B; line-height: 1.6; }

                .spinner-premium { width: 48px; height: 48px; border: 4px solid #F1F5F9; border-top-color: #6C5CE7; border-radius: 50%; animation: spin 1s linear infinite; }
                .spinner-small { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .btn-large { padding: 1rem 2.5rem; font-size: 1.1rem; border-radius: 50px; font-weight: 700; }
                .gap-2 { gap: 0.5rem; }

                @media (max-width: 768px) {
                    .form-card { padding: 2rem 1.5rem; border-radius: 0; }
                    .form-head h1 { font-size: 2rem; }
                    .public-main { padding: 0; }
                    .btn-large { width: 100%; border-radius: 12px; }
                    .form-footer-actions { flex-direction: column-reverse; gap: 1rem; }
                    .form-footer-actions .btn { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default PublicForm;
