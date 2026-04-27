import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formService } from '../services/api';
import {
    PlusCircle, CheckCircle, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import confetti from 'canvas-confetti';

// Components
import SidebarLeft, { QUESTION_TYPES } from '../components/builder/SidebarLeft';
import SidebarRight from '../components/builder/SidebarRight';
import BuilderNavbar from '../components/builder/BuilderNavbar';
import QuestionCard from '../components/builder/QuestionCard';

const FormBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isDarkMode, toggleTheme } = useAuth();

    // State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(Date.now());
    const [form, setForm] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    // Refs for auto-save logic
    const hasChanges = useRef(false);
    const saveTimer = useRef(null);

    // Sensors for DND
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchForm = useCallback(async () => {
        try {
            const res = await formService.getOne(id);
            setForm(res.data);
            setTitle(res.data.title);
            setDescription(res.data.description || '');
            setIsPublic(res.data.isPublic);
            setQuestions(res.data.questions || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            navigate('/dashboard');
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchForm();
    }, [fetchForm]);

    // Handle Save API Call
    const handleSave = async (silent = false) => {
        if (!id) return;
        try {
            if (!silent) setSaving(true);
            const updatedForm = {
                title,
                description,
                isPublic,
                questions: questions.map((q, index) => ({
                    ...q,
                    order: index
                }))
            };
            const res = await formService.update(id, updatedForm);
            setForm(res.data);
            setLastSaved(Date.now());
            hasChanges.current = false;
            if (!silent) showToast('Form saved successfully');
        } catch (err) {
            console.error("Failed to save", err);
            if (!silent) showToast('Failed to save', 'error');
        } finally {
            if (!silent) setSaving(false);
        }
    };

    // Auto-save Effect
    useEffect(() => {
        if (hasChanges.current) {
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                handleSave(true);
            }, 3000);
        }
        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [title, description, questions, isPublic]);

    // Track Changes
    useEffect(() => {
        if (!loading) hasChanges.current = true;
    }, [title, description, questions, isPublic]);

    // Question Actions
    const addQuestion = (type) => {
        const typeInfo = QUESTION_TYPES.find(t => t.type === type);
        const newQuestion = {
            id: `temp-${Date.now()}`,
            type,
            label: `New ${typeInfo?.label || 'Question'}`,
            required: false,
            options: ['Option 1'],
            description: ''
        };
        setQuestions([...questions, newQuestion]);
        setSelectedQuestionId(newQuestion.id);

        // Trigger micro-animation or scroll
        setTimeout(() => {
            const el = document.getElementById(newQuestion.id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const updateQuestion = (qId, updatedData) => {
        setQuestions(questions.map(q => q.id === qId ? updatedData : q));
    };

    const deleteQuestion = (qId) => {
        setQuestions(questions.filter(q => q.id !== qId));
        if (selectedQuestionId === qId) setSelectedQuestionId(null);
    };

    const duplicateQuestion = (question) => {
        const newQuestion = {
            ...question,
            id: `temp-${Date.now()}`,
            label: `${question.label} (Copy)`
        };
        setQuestions([...questions, newQuestion]);
        setSelectedQuestionId(newQuestion.id);
    };

    // State for responsive sidebars
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

    // DND Handle
    const handleDragEnd = (event) => {
        const { active, over } = event;

        // Handle Sidebar to Canvas drop
        if (active.data.current?.isSidebarItem && over?.id === 'canvas-droppable') {
            addQuestion(active.data.current.type);
            return;
        }

        // Handle Reordering
        if (active.id !== over?.id && !active.data.current?.isSidebarItem) {
            setQuestions((items) => {
                const oldIndex = items.findIndex(q => q.id === active.id);
                const newIndex = items.findIndex(q => q.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handlePreview = () => {
        window.open(`/forms/${id}/preview`, '_blank');
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const copyLink = () => {
        const url = `${window.location.origin}/public/${id}`;
        navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!');
        setShowShareModal(false);
    };

    const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

    if (loading) return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'hsl(var(--v-bg))' }}>
            <div className="spinner-premium"></div>
        </div>
    );

    return (
        <div className="form-builder-page flex-column">
            <BuilderNavbar
                title={title}
                onTitleChange={setTitle}
                onSave={() => handleSave(false)}
                onPreview={handlePreview}
                onShare={handleShare}
                saving={saving}
                isPublic={isPublic}
                onTogglePublic={() => setIsPublic(!isPublic)}
                onBack={() => navigate('/dashboard')}
                onToggleLeft={() => setLeftSidebarOpen(!leftSidebarOpen)}
            />

            <div className="builder-main-layout flex">
                {/* Left Sidebar */}
                <SidebarLeft
                    onAddQuestion={addQuestion}
                    isOpen={leftSidebarOpen}
                    onClose={() => setLeftSidebarOpen(false)}
                />

                {/* Center Canvas */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="builder-canvas" id="canvas-droppable">
                        <div className="canvas-container">
                            {/* Title & Description Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="vellum-card-premium form-header-card"
                                onClick={() => setSelectedQuestionId(null)}
                            >
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Form Title"
                                    className="canvas-title-input"
                                />
                                <textarea
                                    value={description}
                                    onChange={(e) => {
                                        setDescription(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    placeholder="Form Description"
                                    className="canvas-desc-input"
                                />
                            </motion.div>

                            {/* Questions List with DND */}
                            <SortableContext
                                items={questions.map(q => q.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="questions-list">
                                    {questions.length === 0 ? (
                                        <div className="empty-canvas-state">
                                            <div className="empty-icon-wrapper">
                                                <PlusCircle size={32} />
                                            </div>
                                            <h3>Your form is empty</h3>
                                            <p>Select a question type from the left to start building.</p>
                                        </div>
                                    ) : (
                                        questions.map((q, i) => (
                                            <QuestionCard
                                                key={q.id}
                                                id={q.id}
                                                index={i}
                                                question={q}
                                                isActive={selectedQuestionId === q.id}
                                                onSelect={() => {
                                                    setSelectedQuestionId(q.id);
                                                    if (window.innerWidth < 1024) setRightSidebarOpen(true);
                                                }}
                                                onUpdate={updateQuestion}
                                                onDelete={deleteQuestion}
                                                onDuplicate={duplicateQuestion}
                                            />
                                        ))
                                    )}
                                </div>
                            </SortableContext>

                            <div className="canvas-footer-spacer" />
                        </div>

                        {/* FAB */}
                        <button className="fab-add-question" onClick={() => addQuestion('TEXT')} title="Add Short Answer">
                            <PlusCircle size={24} />
                        </button>
                    </div>
                </DndContext>

                {/* Right Sidebar */}
                <SidebarRight
                    selectedQuestion={selectedQuestion}
                    onUpdateQuestion={updateQuestion}
                    isOpen={rightSidebarOpen}
                    onClose={() => setRightSidebarOpen(false)}
                />
            </div>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        className={`builder-toast bottom-right ${toast.type}`}
                    >
                        {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        <span>{toast.msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                <button className="modal-close-btn" onClick={() => setShowShareModal(false)}>
                                    <X size={20} />
                                </button>
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

            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                }
                .modal-description {
                    color: hsl(var(--v-text-muted));
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                }
                .share-link-group {
                    display: flex;
                    gap: 0.75rem;
                }
                .share-link-group input {
                    flex: 1;
                    padding: 0.75rem;
                    background: hsl(var(--v-bg));
                    border: 1px solid hsl(var(--v-border));
                    border-radius: var(--radius-sm);
                    color: hsl(var(--v-text-main));
                    font-size: 0.875rem;
                }
                .form-builder-page {
                    height: 100vh;
                    background: hsl(var(--v-bg));
                    overflow: hidden;
                }
                .builder-main-layout {
                    flex: 1;
                    height: calc(100vh - 64px);
                    overflow: hidden;
                }
                .builder-canvas {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem 1rem;
                    background: hsl(var(--v-bg-color));
                    position: relative;
                }
                .canvas-container {
                    max-width: 720px;
                    margin: 0 auto;
                }
                .form-header-card {
                    padding: 2.5rem;
                    margin-bottom: 2rem;
                    border-top: 6px solid hsl(var(--v-primary));
                    cursor: pointer;
                }
                .canvas-title-input {
                    display: block;
                    width: 100%;
                    font-size: 2.25rem;
                    font-weight: 700;
                    border: none;
                    background: transparent;
                    outline: none;
                    color: hsl(var(--v-text-main));
                    margin-bottom: 0.5rem;
                }
                .canvas-desc-input {
                    display: block;
                    width: 100%;
                    font-size: 1rem;
                    border: none;
                    background: transparent;
                    outline: none;
                    color: hsl(var(--v-text-muted));
                    resize: none;
                    min-height: 40px;
                    font-family: inherit;
                }
                .questions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .empty-canvas-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    border: 2px dashed hsl(var(--v-border));
                    border-radius: var(--radius-lg);
                    color: hsl(var(--v-text-muted));
                }
                .empty-icon-wrapper {
                    display: inline-flex;
                    padding: 1rem;
                    background: hsl(var(--v-primary-low));
                    color: hsl(var(--v-primary));
                    border-radius: 50%;
                    margin-bottom: 1rem;
                }
                .canvas-footer-spacer {
                    height: 120px;
                }
                .fab-add-question {
                    position: fixed;
                    right: 340px;
                    bottom: 2rem;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: hsl(var(--v-primary));
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: var(--shadow-lg);
                    cursor: pointer;
                    transition: all 0.2s;
                    z-index: 50;
                }
                .fab-add-question:hover {
                    transform: scale(1.1);
                    filter: brightness(1.1);
                }
                .builder-toast.bottom-right {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    left: auto;
                    transform: none;
                }
                .builder-toast {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--radius-md);
                    background: hsl(var(--v-surface-raised));
                    border: 1px solid hsl(var(--v-border));
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    font-weight: 500;
                }
                .builder-toast.success {
                    border-color: #10b981;
                    color: #10b981;
                }
                .builder-toast.error {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                @media (max-width: 1024px) {
                    .fab-add-question {
                        right: 2rem;
                    }
                    .builder-canvas {
                        padding: 1.5rem 0.75rem;
                    }
                }

                .share-modal-content {
                    width: 90%;
                    max-width: 500px;
                    padding: 2.5rem;
                    position: relative;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .modal-header h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: hsl(var(--v-text-muted));
                }
                .share-link-group {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
                .share-link-group input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius-sm);
                    border: 1px solid hsl(var(--v-border));
                    background: hsl(var(--v-bg-color));
                    color: hsl(var(--v-text-main));
                    outline: none;
                }
                .spinner-premium {
                    width: 48px;
                    height: 48px;
                    border: 4px solid hsl(var(--v-primary-low));
                    border-top-color: hsl(var(--v-primary));
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default FormBuilder;
