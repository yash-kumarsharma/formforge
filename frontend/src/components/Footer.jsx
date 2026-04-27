import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand Column */}
                    <div className="footer-column footer-brand">
                        <div className="footer-logo">
                            <span className="logo-icon">🖋️</span>
                            <span className="logo-text">Vellum</span>
                        </div>
                        <p className="footer-description">
                            Create beautiful forms in minutes. Collect responses, analyze data, and make informed decisions.
                        </p>
                        <div className="footer-social">
                            <a href="https://github.com/yash-kumarsharma" target="_blank" rel="noopener noreferrer" className="social-link">
                                <Github size={20} />
                            </a>
                            <a href="#" className="social-link">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="social-link">
                                <Linkedin size={20} />
                            </a>
                            <a href="mailto:contact@vellum.com" className="social-link">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Product</h4>
                        <ul className="footer-links">
                            <li><a href="#features">Features</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><a href="#templates">Templates</a></li>
                            <li><a href="#integrations">Integrations</a></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Company</h4>
                        <ul className="footer-links">
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#blog">Blog</a></li>
                            <li><a href="#careers">Careers</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#press">Press Kit</a></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Resources</h4>
                        <ul className="footer-links">
                            <li><a href="#docs">Documentation</a></li>
                            <li><a href="#api">API Reference</a></li>
                            <li><a href="#guides">Guides</a></li>
                            <li><a href="#support">Support</a></li>
                            <li><a href="#community">Community</a></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Legal</h4>
                        <ul className="footer-links">
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                            <li><a href="#cookies">Cookie Policy</a></li>
                            <li><a href="#gdpr">GDPR</a></li>
                            <li><a href="#security">Security</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright">
                        <p>
                            © {currentYear} Vellum. All rights reserved. Made with{' '}
                            <Heart size={14} className="heart-icon" fill="currentColor" /> by{' '}
                            <a
                                href="https://github.com/yash-kumarsharma"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="author-link"
                            >
                                Yash Kumar Sharma
                            </a>
                        </p>
                    </div>
                    <div className="footer-links-bottom">
                        <a href="#sitemap">Sitemap</a>
                        <span className="separator">•</span>
                        <a href="#status">Status</a>
                        <span className="separator">•</span>
                        <a href="#changelog">Changelog</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
