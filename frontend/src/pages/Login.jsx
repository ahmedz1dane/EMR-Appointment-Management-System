import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Stethoscope, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';

const FEATURES = [
  'Manage Doctor Schedules dynamically',
  'Automated appointment slot generation',
  'Real-time notifications & updates',
  'Strict Role-Based Access Control'
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-layout">
      {/* LEFT — form */}
      <div className="auth-form-side">
        <div className="auth-form-container animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div className="btn-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <Stethoscope size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>EMR System</h2>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Sign in to manage appointments and clinical schedules.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ padding: '12px', marginBottom: '24px' }}>
              <ShieldAlert size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '42px' }}
                  placeholder="admin@emr.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-input" 
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', 
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '14px' }} disabled={loading}>
              {loading ? <div className="loader"></div> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT — mesh panel */}
      <div className="auth-mesh-side">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Stethoscope size={24} color="#fff" />
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>EMR OS</span>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '400px', marginBottom: '16px' }}>
            Hospital operations, on autopilot.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '400px', lineHeight: 1.6 }}>
            Modern enterprise tools to manage your clinics, dynamically route patients, and maintain complete audit compliance.
          </p>

          <ul className="auth-features-list">
            {FEATURES.map((text) => (
              <li key={text}>
                <span className="auth-features-icon">
                  <Check size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Secure & HIPAA Compliant.</p>
      </div>
    </div>
  );
}
