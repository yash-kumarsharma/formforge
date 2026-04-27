import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formService } from '../services/api';
import {
    ArrowLeft, Eye, Share2, CheckCircle, XCircle,
    Calendar, Star, Upload, Info, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const FormPreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [progress, setProgress] = useState(0);

    const [showShareModal, setShowShareModal] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const copyLink = () => {
        const url = `${window.location.origin}/public/${id}`;
        navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!');
    };

    const fetchForm = useCallback(async () => {
        try {
            const res = await formService.getOne(id);
            setForm(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            navigate('/dashboard');
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchForm();
    }, [fetchForm]);

    // Calculate progress based on answered required fields
    useEffect(() => {
        if (!form) return;
        const requiredQuestions = form.questions.filter(q => q.required);
        if (requiredQuestions.length === 0) {
            setProgress(100);
            return;
        }
        const answeredRequired = requiredQuestions.filter(q => {
            const ans = answers[q.id];
            if (Array.isArray(ans)) return ans.length > 0;
            return ans !== undefined && ans !== '';
        }).length;
        setProgress((answeredRequired / requiredQuestions.length) * 100);
    }, [answers, form]);

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

    const validateForm = () => {
        const newErrors = {};
        form.questions.forEach(q => {
            if (q.required) {
                const ans = answers[q.id];
                if (ans === undefined || ans === '' || (Array.isArray(ans) && ans.length === 0)) {
                    newErrors[q.id] = 'This field is required';
                }
            }
        });
        setErrors(newErrors);

        const firstErrorId = Object.keys(newErrors)[0];
        if (firstErrorId) {
            const el = document.getElementById(`question-${firstErrorId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#6C5CE7', '#A29BFE', '#FFFFFF']
            });
        }, 1500);
    };

    if (loading) return (
        <div className="flex-center" style={{ minHeight: '100vh', background: '#F8F9FF' }}>
            <div className="spinner-premium"></div>
        </div>
    );

    const renderQuestionInput = (q) => {
        switch (q.type) {
            case 'TEXT':
                return (
                    <input
                        type="text"
                        className="preview-input"
                        placeholder="Your answer"
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                );
            case 'PARAGRAPH':
                return (
                    <textarea
                        className="preview-input textarea"
                        placeholder="Your long answer"
                        rows={4}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                );
            case 'MULTIPLE_CHOICE':
                return (
                    <div className="options-group">
                        {q.options.map((opt, i) => (
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
                        {q.options.map((opt, i) => (
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
                        className="preview-input select"
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    >
                        <option value="">Select option</option>
                        {q.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'DATE':
                return (
                    <div className="input-with-icon">
                        <Calendar size={18} className="input-icon" />
                        <input
                            type="date"
                            className="preview-input with-icon"
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
                                size={28}
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

    return (
        <div className="preview-page">
            <header className="preview-header sticky vellum-glass">
                <div className="header-left">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/forms/${id}`)} title="Back to Builder">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="back-text">Back to Builder</span>
                </div>
                <div className="header-center">
                    <span className="preview-badge">Preview Mode</span>
                </div>
                <div className="header-right">
                    <button className="btn btn-ghost btn-icon" onClick={() => setShowShareModal(true)} title="Share Form">
                        <Share2 size={18} />
                    </button>
                </div>
                <div className="header-progress" style={{ width: `${progress}%` }}></div>
            </header>

            <main className="preview-main">
                <div className="preview-container">
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="form-card"
                            >
                                <div className="form-head">
                                    <h1>{form.title}</h1>
                                    <p>{form.description}</p>
                                    <div className="divider"></div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {form.questions.map((q, i) => (
                                        <div
                                            key={q.id}
                                            id={`question-${q.id}`}
                                            className={`question-block ${errors[q.id] ? 'has-error' : ''}`}
                                        >
                                            {q.type === 'SECTION' ? (
                                                <div className="section-divider">
                                                    <h2>{q.label}</h2>
                                                    {q.description && <p>{q.description}</p>}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="question-header">
                                                        <span className="q-number">{i + 1}.</span>
                                                        <label className="q-label">
                                                            {q.label}
                                                            {q.required && <span className="required">*</span>}
                                                        </label>
                                                    </div>
                                                    {q.description && <p className="q-desc">{q.description}</p>}
                                                    <div className="q-input-wrapper">
                                                        {renderQuestionInput(q)}
                                                    </div>
                                                    {errors[q.id] && (
                                                        <motion.p
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="error-msg"
                                                        >
                                                            <AlertCircle size={14} /> {errors[q.id]}
                                                        </motion.p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="btn-submit"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <span className="flex-center gap-2">
                                                    <div className="spinner-small"></div> Submitting...
                                                </span>
                                            ) : 'Submit Form'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="success-card"
                            >
                                <div className="success-icon">
                                    <CheckCircle size={64} />
                                </div>
                                <h2 className="success-title">Response Recorded!</h2>
                                <p className="success-text">Thank you for filling out <strong>{form.title}</strong>. Your response has been securely saved.</p>
                                <button className="btn btn-outline" onClick={() => setSubmitted(false)}>
                                    Submit another response
                                </button>
                                <div className="powered-by">Powered by <span>Vellum</span></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowShareModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="vellum-card share-modal-content"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Share Form</h3>
                                <button className="close-btn" onClick={() => setShowShareModal(false)}>×</button>
                            </div>
                            <p className="modal-description">Anyone with this link can view and submit the form.</p>
                            <div className="share-link-group">
                                <input
                                    readOnly
                                    value={`${window.location.origin}/public/${id}`}
                                    onClick={(e) => e.target.select()}
                                />
                                <button className="btn btn-primary" onClick={copyLink}>
                                    Copy Link
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="preview-toast"
                    >
                        <CheckCircle size={18} />
                        <span>{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .preview-page {
                    min-height: 100vh;
                    background: #F8F9FF;
                    color: #2D3436;
                    font-family: inherit;
                }
                .preview-header {
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.5rem;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                }
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .back-text {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #636E72;
                }
                @media (max-width: 640px) {
                    .back-text { display: none; }
                }
                .preview-badge {
                    background: #6C5CE715;
                    color: #6C5CE7;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .header-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: #6C5CE7;
                    transition: width 0.3s ease;
                }
                .preview-main {
                    padding: 2.5rem 1rem 5rem;
                }
                .preview-container {
                    max-width: 720px;
                    margin: 0 auto;
                }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .share-modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 450px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .modal-header h3 { font-size: 1.25rem; font-weight: 700; }
                .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #636E72; }
                .modal-description { font-size: 0.875rem; color: #636E72; margin-bottom: 1.5rem; }
                .share-link-group { display: flex; gap: 0.5rem; }
                .share-link-group input {
                    flex: 1;
                    padding: 0.75rem;
                    border: 1px solid #E1E2E6;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    background: #F8F9FF;
                    outline: none;
                }
                .preview-toast {
                    position: fixed;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #2D3436;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    z-index: 2000;
                }
                .form-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    padding: 3rem;
                    border: 1px solid rgba(0,0,0,0.03);
                }
                .form-head h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    color: #2D3436;
                }
                .form-head p {
                    font-size: 1.125rem;
                    color: #636E72;
                    margin-bottom: 2rem;
                }
                .divider {
                    height: 1px;
                    background: #F1F2F6;
                    margin-bottom: 2.5rem;
                }
                .question-block {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    border-radius: 12px;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                .question-block.has-error {
                    background: #FFF5F5;
                    border-color: #FEB2B2;
                }
                .question-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .q-number {
                    font-weight: 600;
                    color: #6C5CE7;
                    font-size: 1.125rem;
                    margin-top: 2px;
                }
                .q-label {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #2D3436;
                }
                .required { color: #E74C3C; margin-left: 4px; }
                .q-desc {
                    font-size: 0.9rem;
                    color: #636E72;
                    margin-left: 1.8rem;
                    margin-bottom: 1.25rem;
                }
                .q-input-wrapper { margin-left: 1.8rem; }
                
                .preview-input {
                    width: 100%;
                    padding: 0.75rem 0;
                    border: none;
                    border-bottom: 1.5px solid #E1E2E6;
                    background: transparent;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                    outline: none;
                }
                .preview-input:focus { border-color: #6C5CE7; }
                .preview-input.textarea {
                    border: 1px solid #E1E2E6;
                    border-radius: 8px;
                    padding: 1rem;
                }
                .preview-input.select {
                    border: 1px solid #E1E2E6;
                    border-radius: 8px;
                    padding: 0.75rem 1rem;
                }

                .options-group { display: flex; flex-direction: column; gap: 0.75rem; }
                .option-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0.875rem 1.25rem;
                    border: 1.5px solid #F1F2F6;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .option-item:hover { background: #F8F9FF; border-color: #6C5CE750; }
                .option-item.active { border-color: #6C5CE7; background: #6C5CE708; }
                .option-item input { display: none; }
                .radio-dot, .checkbox-box {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #D1D2D6;
                    border-radius: 50%;
                    position: relative;
                    transition: all 0.2s;
                }
                .checkbox-box { border-radius: 4px; }
                .option-item.active .radio-dot { border-color: #6C5CE7; background: #6C5CE7; }
                .option-item.active .radio-dot::after {
                    content: '';
                    position: absolute;
                    inset: 5px;
                    background: white;
                    border-radius: 50%;
                }
                .option-item.active .checkbox-box { background: #6C5CE7; border-color: #6C5CE7; }

                .linear-scale-group { display: flex; gap: 1rem; justify-content: center; padding: 1rem 0; }
                .scale-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 2px solid #F1F2F6;
                    background: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .scale-btn:hover { border-color: #6C5CE7; color: #6C5CE7; }
                .scale-btn.active { background: #6C5CE7; border-color: #6C5CE7; color: white; }

                .rating-group { display: flex; gap: 0.5rem; padding: 0.5rem 0; }
                .star-icon { color: #D1D2D6; cursor: pointer; transition: all 0.2s; }
                .star-icon:hover, .star-icon.active { color: #F1C40F; }

                .file-upload-zone {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 2rem;
                    border: 2px dashed #F1F2F6;
                    border-radius: 12px;
                    cursor: pointer;
                    color: #636E72;
                }
                .hidden { display: none; }
                .file-chip { margin-top: 1rem; padding: 4px 12px; background: #E1FBED; color: #27AE60; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }

                .section-divider {
                    margin-top: 3rem;
                    padding: 2rem 0;
                    border-top: 3px solid #6C5CE7;
                }
                .section-divider h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }

                .btn-submit {
                    width: 100%;
                    background: #6C5CE7;
                    color: white;
                    border: none;
                    padding: 1.25rem;
                    border-radius: 50px;
                    font-size: 1.125rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 10px 20px rgba(108, 92, 231, 0.3);
                }
                .btn-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
                .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

                .error-msg {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #E74C3C;
                    font-size: 0.875rem;
                    margin-top: 1rem;
                    margin-left: 1.8rem;
                }

                .success-card {
                    background: white;
                    border-radius: 12px;
                    padding: 5rem 3rem;
                    text-align: center;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.05);
                }
                .success-icon { color: #2ECC71; margin-bottom: 2rem; }
                .success-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; }
                .success-text { color: #636E72; font-size: 1.125rem; margin-bottom: 3rem; }
                .powered-by { margin-top: 4rem; font-size: 0.875rem; color: #B2BEC3; }
                .powered-by span { font-weight: 700; color: #636E72; }

                .spinner-small {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 640px) {
                    .form-card, .success-card { padding: 2rem 1.5rem; }
                    .form-head h1 { font-size: 1.75rem; }
                    .q-desc, .q-input-wrapper, .error-msg { margin-left: 0; }
                    .btn-submit { position: sticky; bottom: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default FormPreview;
