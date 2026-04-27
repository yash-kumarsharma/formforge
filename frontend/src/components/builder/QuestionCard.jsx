import React from 'react';
import {
    Trash2, Copy, GripVertical, ChevronDown,
    Plus, X, Star, Hash, Upload, Calendar,
    Type, Layout, List, CheckSquare
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

const QuestionCard = ({
    question,
    index,
    isActive,
    onSelect,
    onUpdate,
    onDelete,
    onDuplicate
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleChange = (field, value) => {
        onUpdate(question.id, { ...question, [field]: value });
    };

    const handleOptionChange = (optIndex, value) => {
        const newOptions = [...(question.options || [])];
        newOptions[optIndex] = value;
        handleChange('options', newOptions);
    };

    const addOption = () => {
        const nextNum = (question.options?.length || 0) + 1;
        handleChange('options', [...(question.options || []), `Option ${nextNum}`]);
    };

    const removeOption = (optIndex) => {
        const newOptions = question.options.filter((_, i) => i !== optIndex);
        handleChange('options', newOptions);
    };

    const renderInputPreview = () => {
        switch (question.type) {
            case 'TEXT':
                return <input disabled className="vellum-input preview-input" placeholder="Short answer text" />;
            case 'PARAGRAPH':
                return <textarea disabled className="vellum-input preview-input" placeholder="Long answer text" rows={2} />;
            case 'MULTIPLE_CHOICE':
            case 'CHECKBOX':
                return (
                    <div className="options-preview-list">
                        {question.options?.map((opt, i) => (
                            <div key={i} className="option-preview-item">
                                <div className={`preview-bullet ${question.type === 'MULTIPLE_CHOICE' ? 'round' : 'square'}`} />
                                <input
                                    className="option-edit-input"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                    placeholder={`Option ${i + 1}`}
                                />
                                <button className="remove-option-btn" onClick={() => removeOption(i)}>
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <button className="add-option-btn" onClick={addOption}>
                            <Plus size={14} /> Add Option
                        </button>
                    </div>
                );
            case 'DROPDOWN':
                return (
                    <div className="dropdown-preview">
                        <div className="dropdown-mock">
                            <span>Select Option</span>
                            <ChevronDown size={16} />
                        </div>
                        <div className="options-preview-list minimal">
                            {question.options?.map((opt, i) => (
                                <div key={i} className="option-preview-item">
                                    <span className="option-index">{i + 1}.</span>
                                    <input
                                        className="option-edit-input"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(i, e.target.value)}
                                    />
                                    <button className="remove-option-btn" onClick={() => removeOption(i)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <button className="add-option-btn" onClick={addOption}>
                                <Plus size={14} /> Add Option
                            </button>
                        </div>
                    </div>
                );
            case 'DATE':
                return <div className="mock-input-with-icon"><Calendar size={18} /> <span>Select Date</span> </div>;
            case 'FILE_UPLOAD':
                return <div className="mock-input-with-icon"><Upload size={18} /> <span>Upload File</span> </div>;
            case 'RATING':
                return (
                    <div className="rating-preview">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} className="star-mock" />)}
                    </div>
                );
            case 'LINEAR_SCALE':
                return (
                    <div className="scale-preview">
                        <div className="scale-labels"><span>1 (Low)</span> <div className="scale-dots"><span></span><span></span><span></span><span></span><span></span></div> <span>5 (High)</span></div>
                    </div>
                );
            case 'SECTION':
                return <div className="section-divider-preview"> <div className="divider-line"></div> <span>Section Divider</span> <div className="divider-line"></div> </div>;
            default:
                return <div className="preview-placeholder">Question type: {question.type}</div>;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            id={question.id}
            className={`question-card-wrapper ${isActive ? 'active' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            <div className="card-drag-handle" {...attributes} {...listeners}>
                <GripVertical size={16} />
            </div>

            <div className="question-card-inner">
                <div className="question-card-header">
                    <div className="question-title-area">
                        <span className="question-number">{index + 1}.</span>
                        <input
                            className="question-label-input"
                            value={question.label}
                            onChange={(e) => handleChange('label', e.target.value)}
                            placeholder="Untiltled Question"
                        />
                    </div>

                    <div className="question-type-selector">
                        <select
                            value={question.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            className="type-select"
                        >
                            <option value="TEXT">Short Answer</option>
                            <option value="PARAGRAPH">Paragraph</option>
                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                            <option value="CHECKBOX">Checkboxes</option>
                            <option value="DROPDOWN">Dropdown</option>
                            <option value="DATE">Date</option>
                            <option value="FILE_UPLOAD">File Upload</option>
                            <option value="RATING">Rating</option>
                            <option value="LINEAR_SCALE">Linear Scale</option>
                            <option value="SECTION">Section Divider</option>
                        </select>
                    </div>
                </div>

                <div className="question-body">
                    {renderInputPreview()}
                </div>

                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="question-actions-footer"
                    >
                        <div className="footer-left">
                            <label className="required-toggle">
                                <input
                                    type="checkbox"
                                    checked={question.required || false}
                                    onChange={(e) => handleChange('required', e.target.checked)}
                                />
                                <span>Required</span>
                            </label>
                        </div>
                        <div className="footer-right">
                            <button className="btn-icon-ghost" onClick={() => onDuplicate(question)} title="Duplicate">
                                <Copy size={18} />
                            </button>
                            <button className="btn-icon-ghost delete" onClick={() => onDelete(question.id)} title="Delete">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <style>{`
                .question-card-wrapper {
                    position: relative;
                    background: hsl(var(--v-surface));
                    border: 1px solid hsl(var(--v-border));
                    border-radius: var(--radius-lg);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    margin-bottom: 0.5rem;
                }
                .question-card-wrapper:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                }
                .question-card-wrapper.active {
                    border-left: 6px solid #8b5cf6;
                    box-shadow: var(--shadow-lg);
                    transform: scale(1.01);
                    z-index: 10;
                }
                .card-drag-handle {
                    position: absolute;
                    top: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: hsl(var(--v-text-muted));
                    opacity: 0;
                    cursor: grab;
                    padding: 4px;
                    transition: opacity 0.2s;
                }
                .question-card-wrapper:hover .card-drag-handle {
                    opacity: 0.4;
                }
                .card-drag-handle:active {
                    cursor: grabbing;
                }
                .question-card-inner {
                    padding: 1.5rem 2rem;
                }
                .question-card-header {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .question-title-area {
                    flex: 1;
                    display: flex;
                    align-items: baseline;
                    gap: 0.5rem;
                }
                .question-number {
                    font-size: 1rem;
                    font-weight: 600;
                    color: hsl(var(--v-text-muted));
                }
                .question-label-input {
                    flex: 1;
                    font-size: 1.125rem;
                    font-weight: 500;
                    border: none;
                    background: transparent;
                    color: hsl(var(--v-text-main));
                    border-bottom: 1px solid transparent;
                    outline: none;
                    padding-bottom: 4px;
                    transition: border-color 0.2s;
                }
                .active .question-label-input {
                    border-bottom-color: hsl(var(--v-border));
                }
                .active .question-label-input:focus {
                    border-bottom-color: #8b5cf6;
                }
                .question-type-selector {
                    width: 180px;
                }
                .type-select {
                    width: 100%;
                    padding: 0.5rem;
                    border-radius: var(--radius-sm);
                    border: 1px solid hsl(var(--v-border));
                    background: hsl(var(--v-surface));
                    color: hsl(var(--v-text-main));
                    font-size: 0.875rem;
                    outline: none;
                }
                .question-body {
                    margin-bottom: 1rem;
                }
                .preview-input {
                    background: hsl(var(--v-bg-color) / 0.5);
                    border-style: dashed;
                    width: 60%;
                }
                .options-preview-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .option-preview-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .preview-bullet {
                    width: 18px;
                    height: 18px;
                    border: 2px solid hsl(var(--v-border));
                }
                .preview-bullet.round { border-radius: 50%; }
                .preview-bullet.square { border-radius: 4px; }
                .option-edit-input {
                    flex: 1;
                    max-width: 400px;
                    border: none;
                    background: transparent;
                    font-size: 0.9375rem;
                    outline: none;
                    border-bottom: 1px solid transparent;
                }
                .active .option-edit-input:focus {
                    border-bottom-color: hsl(var(--v-border));
                }
                .remove-option-btn {
                    background: none;
                    border: none;
                    color: hsl(var(--v-text-muted));
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .option-preview-item:hover .remove-option-btn { opacity: 1; }
                .add-option-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: none;
                    color: #8b5cf6;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 4px 0;
                    width: fit-content;
                }
                .dropdown-mock {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 200px;
                    padding: 0.5rem 1rem;
                    border: 1px solid hsl(var(--v-border));
                    border-radius: var(--radius-sm);
                    color: hsl(var(--v-text-muted));
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                }
                .mock-input-with-icon {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: hsl(var(--v-text-muted));
                    padding: 0.5rem 1rem;
                    border: 1px dashed hsl(var(--v-border));
                    border-radius: var(--radius-sm);
                    width: fit-content;
                }
                .rating-preview {
                    display: flex;
                    gap: 0.5rem;
                    color: hsl(var(--v-border));
                }
                .question-actions-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid hsl(var(--v-border));
                }
                .required-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: hsl(var(--v-text-muted));
                    cursor: pointer;
                }
                .btn-icon-ghost {
                    background: none;
                    border: none;
                    color: hsl(var(--v-text-muted));
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                .btn-icon-ghost:hover {
                    background: hsl(var(--v-primary-low));
                    color: #8b5cf6;
                }
                .btn-icon-ghost.delete:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
            `}</style>
        </div>
    );
};

export default QuestionCard;
