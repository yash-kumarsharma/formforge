import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Share2, BarChart3 } from 'lucide-react';

const steps = [
    {
        icon: Edit3,
        title: 'Create Your Form',
        description: 'Choose from templates or start from scratch. Add questions, customize design, and set up logic—all with our intuitive drag-and-drop builder.',
        number: '01'
    },
    {
        icon: Share2,
        title: 'Share with Your Audience',
        description: 'Share via link, QR code, email, or embed directly into your website. Control access with public/private settings.',
        number: '02'
    },
    {
        icon: BarChart3,
        title: 'Analyze Responses',
        description: 'Watch responses come in real-time. Export data, view analytics, and make data-driven decisions with powerful insights.',
        number: '03'
    }
];

const HowItWorks = () => {
    return (
        <section className="how-it-works-section">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="section-header"
                >
                    <h2 className="section-title">
                        How It <span className="gradient-text">Works</span>
                    </h2>
                    <p className="section-subtitle">
                        Three simple steps to create, share, and analyze your forms
                    </p>
                </motion.div>

                <div className="steps-container">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <React.Fragment key={index}>
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    className="step-card"
                                >
                                    <div className="step-number">{step.number}</div>
                                    <div className="step-icon-wrapper">
                                        <div className="step-icon">
                                            <Icon size={28} strokeWidth={2} />
                                        </div>
                                    </div>
                                    <h3 className="step-title">{step.title}</h3>
                                    <p className="step-description">{step.description}</p>
                                </motion.div>

                                {index < steps.length - 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        whileInView={{ opacity: 1, scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                                        className="step-connector"
                                    >
                                        <div className="connector-line"></div>
                                        <div className="connector-arrow">→</div>
                                    </motion.div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
