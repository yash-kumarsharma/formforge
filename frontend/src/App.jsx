import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormPreview from './pages/FormPreview';
import PublicForm from './pages/PublicForm';
import Responses from './pages/Responses';
import HomePage from './pages/HomePage';
import { Menu, Search, MoreHorizontal, Plus, FileText, Layout, BarChart, Settings, Home, ArrowRight, CheckCircle, Sun, Moon, LogOut, User, X } from 'lucide-react';
import { formService } from './services/api';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}>Loading...</div>;
    return user ? <Navigate to="/dashboard" /> : children;
};


import ProfileDropdown from './components/ProfileDropdown';

const AppHeader = () => {
    const { isDarkMode, toggleTheme } = useAuth();

    return (
        <nav className="vellum-nav vellum-glass">
            <div className="flex" style={{ alignItems: 'center', gap: '1.5rem' }}>
                <Link to="/" className="brand-text" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>Vellum</Link>
                <div className="flex" style={{ borderLeft: '1px solid hsl(var(--v-border))', paddingLeft: '1.5rem', marginLeft: '0.5rem', gap: '1rem' }}>
                    <Link to="/dashboard" className="btn btn-ghost" style={{ fontSize: '0.875rem' }}><Home size={18} /> Studio</Link>
                </div>
            </div>

            <div className="flex" style={{ alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        <input
                            className="vellum-input"
                            placeholder="Search Vellums..."
                            style={{ padding: '0.4rem 1rem 0.4rem 2.5rem', width: '240px', fontSize: '0.875rem', height: '36px' }}
                            onChange={(e) => window.dispatchEvent(new CustomEvent('vellum-search', { detail: e.target.value }))}
                        />
                    </div>

                    <button
                        className="btn btn-ghost"
                        onClick={toggleTheme}
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            color: 'hsl(var(--v-text-main))'
                        }}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>

                <ProfileDropdown />
            </div>
        </nav>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div style={{ minHeight: '100vh' }}>
                    <Routes>
                        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/public/:id" element={<PublicForm />} />
                        <Route path="/forms/:id/responses" element={<PrivateRoute><Responses /></PrivateRoute>} />
                        <Route path="/forms/:id/preview" element={<PrivateRoute><FormPreview /></PrivateRoute>} />
                        <Route path="/forms/:id" element={<PrivateRoute><FormBuilder /></PrivateRoute>} />
                        <Route path="/dashboard" element={
                            <PrivateRoute>
                                <>
                                    <AppHeader />
                                    <Dashboard />
                                </>
                            </PrivateRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
