import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { FileText, Users, MessageSquare, Globe } from 'lucide-react';

const stats = [
    {
        icon: FileText,
        value: 12500,
        suffix: '+',
        label: 'Forms Created',
        color: '#8b5cf6'
    },
    {
        icon: Users,
        value: 5000,
        suffix: '+',
        label: 'Active Users',
        color: '#3b82f6'
    },
    {
        icon: MessageSquare,
        value: 75000,
        suffix: '+',
        label: 'Responses Collected',
        color: '#10b981'
    },
    {
        icon: Globe,
        value: 50,
        suffix: '+',
        label: 'Countries',
        color: '#f59e0b'
    }
];

const StatsSection = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    return (
        <section className="stats-section">
            <div className="stats-background">
                <div className="stats-gradient"></div>
            </div>

            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    onViewportEnter={() => setIsVisible(true)}
                    className="stats-grid"
                >
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="stat-card"
                            >
                                <div
                                    className="stat-icon-wrapper"
                                    style={{
                                        background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`
                                    }}
                                >
                                    <Icon
                                        size={32}
                                        style={{ color: stat.color }}
                                        strokeWidth={2}
                                    />
                                </div>
                                <div className="stat-value">
                                    {isVisible && (
                                        <CountUp
                                            end={stat.value}
                                            duration={2.5}
                                            separator=","
                                            suffix={stat.suffix}
                                        />
                                    )}
                                </div>
                                <div className="stat-label">{stat.label}</div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="stats-cta"
                >
                    <h3>Join thousands of users creating amazing forms</h3>
                    <button
                        className="btn-primary btn-large"
                        onClick={() => navigate('/register')}
                    >
                        Start Creating for Free
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default StatsSection;

