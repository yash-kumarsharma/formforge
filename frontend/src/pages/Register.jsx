import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.register({ name, email, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error?.message || err.response?.data?.message || 'Fine-tune your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center fade-in" style={{ minHeight: '100vh', padding: '1rem' }}>
            <div className="vellum-card" style={{ maxWidth: '440px', width: '100%', padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Link to="/" className="brand-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'inline-block', textDecoration: 'none' }}>Join Vellum</Link>
                    <p style={{ color: 'hsl(var(--v-text-muted))' }}>Start crafting beautiful forms today.</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'hsl(0 100% 50% / 0.1)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #ef4444' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex-column" style={{ gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '1.15rem', color: 'hsl(var(--v-text-muted))', opacity: 0.5 }} />
                        <input
                            type="text"
                            className="vellum-input"
                            style={{ paddingLeft: '3rem' }}
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '1.15rem', color: 'hsl(var(--v-text-muted))', opacity: 0.5 }} />
                        <input
                            type="email"
                            className="vellum-input"
                            style={{ paddingLeft: '3rem' }}
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '1.15rem', color: 'hsl(var(--v-text-muted))', opacity: 0.5 }} />
                        <input
                            type="password"
                            className="vellum-input"
                            style={{ paddingLeft: '3rem' }}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ height: '56px', fontSize: '1.1rem', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Creating space...' : 'Create Vellum Account'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'hsl(var(--v-text-muted))' }}>
                        Already have an account? <Link to="/login" style={{ color: 'hsl(var(--v-primary))', fontWeight: '600' }}>Sign in instead</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
