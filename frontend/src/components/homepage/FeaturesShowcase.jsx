import React from 'react';
import { motion } from 'framer-motion';
import {
    Palette,
    BarChart3,
    Share2,
    Layout,
    Download,
    Shield
} from 'lucide-react';

const features = [
    {
        icon: Palette,
        title: 'Premium Design',
        description: 'Beautiful, modern forms with glassmorphism effects and smooth animations that wow your audience.',
        color: '#8b5cf6'
    },
    {
        icon: BarChart3,
        title: 'Real-time Analytics',
        description: 'Track responses as they come in with live dashboards and insightful data visualizations.',
        color: '#3b82f6'
    },
    {
        icon: Share2,
        title: 'Easy Sharing',
        description: 'Share forms via link, QR code, or embed them directly into your website with one click.',
        color: '#10b981'
    },
    {
        icon: Layout,
        title: 'Template Library',
        description: 'Start quickly with pre-built templates for surveys, feedback forms, registrations, and more.',
        color: '#f59e0b'
    },
    {
        icon: Download,
        title: 'Export Data',
        description: 'Download responses in Excel or CSV format for further analysis and reporting.',
        color: '#6366f1'
    },
    {
        icon: Shield,
        title: 'Secure & Private',
        description: 'Your data is encrypted and secure. Control who can access your forms and responses.',
        color: '#14b8a6'
    }
];

const FeaturesShowcase = () => {
    return (
        <section id="features" className="features-section">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="section-header"
                >
                    <h2 className="section-title">
                        Everything You Need to
                        <span className="gradient-text"> Create Amazing Forms</span>
                    </h2>
                    <p className="section-subtitle">
                        Powerful features designed to make form creation effortless and data collection insightful
                    </p>
                </motion.div>

                <div className="features-grid">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="feature-card"
                            >
                                <div
                                    className="feature-icon"
                                    style={{
                                        background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                                        borderColor: `${feature.color}40`
                                    }}
                                >
                                    <Icon
                                        size={24}
                                        style={{ color: feature.color }}
                                        strokeWidth={2}
                                    />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FeaturesShowcase;
