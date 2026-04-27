import React from 'react';
import {
    Type, List, CheckSquare, ChevronDown, Calendar,
    Upload, Hash, Star, Layout, GripVertical, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';

export const QUESTION_TYPES = [
    { type: 'TEXT', label: 'Short Answer', icon: <Type size={18} /> },
    { type: 'PARAGRAPH', label: 'Paragraph', icon: <Layout size={18} /> },
    { type: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: <List size={18} /> },
    { type: 'CHECKBOX', label: 'Checkboxes', icon: <CheckSquare size={18} /> },
    { type: 'DROPDOWN', label: 'Dropdown', icon: <ChevronDown size={18} /> },
    { type: 'DATE', label: 'Date', icon: <Calendar size={18} /> },
    { type: 'FILE_UPLOAD', label: 'File Upload', icon: <Upload size={18} /> },
    { type: 'LINEAR_SCALE', label: 'Linear Scale', icon: <Hash size={18} /> },
    { type: 'RATING', label: 'Rating', icon: <Star size={18} /> },
    { type: 'SECTION', label: 'Section Divider', icon: <Plus size={18} /> }
];

const DraggableItem = ({ item, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `sidebar-${item.type}`,
        data: { type: item.type, isSidebarItem: true }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
        opacity: 0.8,
        position: 'relative'
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`question-type-item ${isDragging ? 'dragging' : ''}`}
            onClick={() => onClick(item.type)}
            {...listeners}
            {...attributes}
        >
            <div className="type-icon">{item.icon}</div>
            <span className="type-label">{item.label}</span>
            <div className="drag-handle">
                <GripVertical size={14} />
            </div>
        </div>
    );
};

const SidebarLeft = ({ onAddQuestion, isOpen, onClose }) => {
    return (
        <div className={`sidebar-left vellum-glass ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="flex-between">
                    <h3>Question Types</h3>
                    {window.innerWidth < 1024 && (
                        <button className="btn btn-ghost btn-icon" onClick={onClose}>
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>
            <div className="sidebar-content">
                <div className="question-types-list">
                    {QUESTION_TYPES.map((item) => (
                        <DraggableItem key={item.type} item={item} onClick={onAddQuestion} />
                    ))}
                </div>
            </div>

            <style>{`
                .sidebar-left {
                    width: 280px;
                    height: calc(100vh - 64px);
                    border-right: 1px solid hsl(var(--v-border));
                    display: flex;
                    flex-direction: column;
                    background: hsl(var(--v-surface) / 0.5);
                    z-index: 40;
                    transition: transform 0.3s ease;
                }
                .sidebar-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid hsl(var(--v-border));
                }
                .sidebar-header h3 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: hsl(var(--v-text-muted));
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .sidebar-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                }
                .question-types-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .question-type-item {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    background: hsl(var(--v-surface));
                    border: 1px solid hsl(var(--v-border));
                    border-radius: var(--radius-md);
                    cursor: grab;
                    transition: all 0.2s ease;
                    user-select: none;
                }
                .question-type-item:hover {
                    border-color: hsl(var(--v-primary));
                    box-shadow: var(--shadow-sm);
                    background: hsl(var(--v-primary-low));
                }
                .question-type-item.dragging {
                    cursor: grabbing;
                    box-shadow: var(--shadow-lg);
                    border-color: hsl(var(--v-primary));
                }
                .type-icon {
                    margin-right: 0.75rem;
                    color: hsl(var(--v-text-muted));
                    display: flex;
                    align-items: center;
                }
                .question-type-item:hover .type-icon {
                    color: hsl(var(--v-primary));
                }
                .type-label {
                    font-size: 0.9375rem;
                    font-weight: 500;
                    color: hsl(var(--v-text-main));
                }
                .drag-handle {
                    margin-left: auto;
                    color: hsl(var(--v-text-muted));
                    opacity: 0.5;
                    transition: opacity 0.2s;
                }
                .question-type-item:hover .drag-handle {
                    opacity: 1;
                }

                @media (max-width: 1024px) {
                    .sidebar-left {
                        position: fixed;
                        left: 0;
                        top: 64px;
                        bottom: 0;
                        transform: translateX(-100%);
                    }
                    .sidebar-left.open {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default SidebarLeft;
