import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const moveX = (clientX - window.innerWidth / 2) / 50;
        const moveY = (clientY - window.innerHeight / 2) / 50;
        setMousePosition({ x: moveX, y: moveY });
    };

    return (
        <section className="hero-section" onMouseMove={handleMouseMove}>
            <div className="hero-background">
                <motion.div
                    animate={{ x: mousePosition.x * 2, y: mousePosition.y * 2 }}
                    className="gradient-orb orb-1"
                ></motion.div>
                <motion.div
                    animate={{ x: -mousePosition.x * 1.5, y: -mousePosition.y * 1.5 }}
                    className="gradient-orb orb-2"
                ></motion.div>
                <motion.div
                    animate={{ x: mousePosition.x * 1, y: -mousePosition.y * 1 }}
                    className="gradient-orb orb-3"
                ></motion.div>
            </div>

            <div className="container">
                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="hero-badge"
                    >
                        <Sparkles size={16} />
                        <span>Premium Form Builder</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="hero-title"
                    >
                        Create Beautiful Forms
                        <br />
                        <span className="gradient-text">In Minutes</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hero-subtitle"
                    >
                        Design stunning forms with our intuitive builder. Collect responses,
                        analyze data, and make informed decisions—all in one powerful platform.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="hero-cta"
                    >
                        <button
                            className="btn-primary btn-large"
                            onClick={() => navigate('/register')}
                        >
                            Get Started Free
                            <ArrowRight size={20} />
                        </button>
                        <button
                            className="btn-secondary btn-large"
                            onClick={() => {
                                document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Explore Templates
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="hero-stats"
                    >
                        <div className="stat-item">
                            <div className="stat-number">10K+</div>
                            <div className="stat-label">Forms Created</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-number">50K+</div>
                            <div className="stat-label">Responses Collected</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Uptime</div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    whileHover={{ scale: 1.02, rotateY: -5, rotateX: 5 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="hero-visual"
                >
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="form-preview-card"
                    >
                        <div className="card-header">
                            <div className="card-dots">
                                <span style={{ background: '#ef4444' }}></span>
                                <span style={{ background: '#f59e0b' }}></span>
                                <span style={{ background: '#10b981' }}></span>
                            </div>
                            <div className="card-title">Customer Feedback Form</div>
                        </div>
                        <div className="card-body">
                            <div className="form-field">
                                <div className="field-label-text">Your Name</div>
                                <div className="field-input">
                                    <span className="field-placeholder">Yash Sharma</span>
                                </div>
                            </div>
                            <div className="form-field">
                                <div className="field-label-text">Email Address</div>
                                <div className="field-input">
                                    <span className="field-placeholder">yash@vellum.com</span>
                                </div>
                            </div>
                            <div className="form-field">
                                <div className="field-label-text">How would you rate our service?</div>
                                <div className="field-options">
                                    <div className="option-radio">
                                        <div className="radio-dot selected"></div>
                                        <span>Excellent</span>
                                    </div>
                                    <div className="option-radio">
                                        <div className="radio-dot"></div>
                                        <span>Good</span>
                                    </div>
                                    <div className="option-radio">
                                        <div className="radio-dot"></div>
                                        <span>Average</span>
                                    </div>
                                </div>
                            </div>
                            <button className="form-submit-preview" style={{ transition: 'all 0.3s' }}>
                                Submit Feedback
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
