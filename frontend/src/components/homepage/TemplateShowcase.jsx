import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Calendar, TrendingUp, Sparkles,
    ArrowRight, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TEMPLATES = [
    {
        id: 'feedback',
        title: 'Customer Feedback',
        fields: ['Full Name', 'Email Address', 'Rating'],
        icon: <MessageSquare size={20} />,
        color: 'hsl(262, 80%, 52%)',
        type: 'FEEDBACK'
    },
    {
        id: 'event',
        title: 'Event Sign-up',
        fields: ['Attendee Name', 'Ticket Type', 'Special Needs'],
        icon: <Calendar size={20} />,
        color: 'hsl(217, 91%, 60%)',
        type: 'EVENT'
    },
    {
        id: 'market',
        title: 'Product Survey',
        fields: ['Usage Frequency', 'Feature Request', 'Referral'],
        icon: <TrendingUp size={20} />,
        color: 'hsl(142, 76%, 36%)',
        type: 'RESEARCH'
    },
    {
        id: 'contact',
        title: 'Contact Sales',
        fields: ['Company', 'Job Title', 'Budget'],
        icon: <Sparkles size={20} />,
        color: 'hsl(339, 90%, 50%)',
        type: 'BUSINESS'
    }
];

const MiniFormPreview = ({ template, isActive }) => {
    return (
        <div className={`orbital-form-card ${isActive ? 'active' : ''}`} style={{ '--accent-color': template.color }}>
            <div className="mini-card-header">
                <div className="mini-card-dots">
                    <span style={{ background: '#ef4444' }}></span>
                    <span style={{ background: '#f59e0b' }}></span>
                    <span style={{ background: '#10b981' }}></span>
                </div>
                <div className="mini-card-title">{template.title}</div>
            </div>
            <div className="mini-card-body">
                {template.fields.map((field, i) => (
                    <div key={i} className="mini-form-field">
                        <div className="mini-field-label"></div>
                        <div className="mini-field-input">
                            <span>{field}</span>
                        </div>
                    </div>
                ))}
                <div className="mini-submit-btn">
                    {isActive ? 'Use Template' : ''}
                    <Check size={12} />
                </div>
            </div>
        </div>
    );
};

const TemplateShowcase = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);

    const radius = 280; // Distance from center

    return (
        <section className="template-showcase-section" id="templates">
            <div className="container">
                <div className="section-header-centered" data-aos="fade-up">
                    <div className="section-badge">
                        <Sparkles size={14} />
                        <span>Visual Previews</span>
                    </div>
                    <h2 className="section-title-large">
                        Interactive <span className="gradient-text">Form Gallery</span>
                    </h2>
                    <p className="section-subtitle-centered">
                        Hover over the orbital forms to bring them to the forefront.
                        Inspired by our premium builder experience.
                    </p>
                </div>

                <div className="orbital-showcase-container">
                    <div className="orbital-stage">
                        {TEMPLATES.map((template, index) => {
                            // Circular distribution logic
                            const count = TEMPLATES.length;
                            const angleStep = (2 * Math.PI) / count;

                            // Align items so active is always at 0 degrees (front)
                            const currentAngle = (index - activeIndex) * angleStep;

                            // 3D positioning
                            const x = Math.sin(currentAngle) * radius;
                            const z = Math.cos(currentAngle) * radius;
                            const scale = 0.5 + (z + radius) / (2 * radius) * 0.5; // Scale from 0.5 to 1.0
                            const opacity = 0.3 + (z + radius) / (2 * radius) * 0.7; // Opacity from 0.3 to 1.0
                            const isActive = index === activeIndex;

                            return (
                                <motion.div
                                    key={template.id}
                                    className="orbital-item-wrapper"
                                    animate={{
                                        x: x,
                                        z: z, // For CSS perspective
                                        scale: scale,
                                        opacity: opacity,
                                        zIndex: Math.round(z + radius) // High Z for front items
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 150,
                                        damping: 20
                                    }}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => isActive && navigate('/register')}
                                    style={{
                                        cursor: isActive ? 'pointer' : 'pointer'
                                    }}
                                >
                                    <MiniFormPreview template={template} isActive={isActive} />
                                </motion.div>
                            );
                        })}

                        {/* Center Hub */}
                        <div className="orbital-hub">
                            <div className="hub-inner">
                                <Sparkles size={32} className="hub-icon" />
                            </div>
                            <div className="hub-rings">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="showcase-cta-bottom">
                    <button
                        className="btn btn-primary btn-large"
                        onClick={() => navigate('/register')}
                    >
                        Create Your Own Form <ArrowRight size={20} />
                    </button>
                    <p className="cta-hint">Start building for free. No credit card required.</p>
                </div>
            </div>
        </section>
    );
};

export default TemplateShowcase;
