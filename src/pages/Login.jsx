import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BookOpen, Loader2, Eye, EyeOff, Lock, User, Smartphone } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Mock login for local app
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error("Login error:", err);
      setError('لاگ ان میں غلطی (Login error)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--bg-color)', 
      padding: '1.5rem',
      background: 'radial-gradient(circle at top right, rgba(15, 61, 62, 0.05), transparent), radial-gradient(circle at bottom left, rgba(212, 175, 55, 0.05), transparent)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            borderRadius: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(15, 61, 62, 0.2)'
          }}>
            <BookOpen size={40} />
          </div>
          <h1 className="urdu-text" style={{ fontSize: '2.25rem', color: 'var(--primary)', margin: 0, lineHeight: 1.2 }}>اپنا مدرسہ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '0.5rem' }}>Premium Management Suite</p>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            color: '#dc2626', 
            padding: '1rem', 
            borderRadius: '0.75rem', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #fee2e2'
          }} className="urdu-text">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label urdu-text" style={{ textAlign: 'right' }}>ای میل یا فون نمبر</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or Phone"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label className="form-label urdu-text" style={{ textAlign: 'right' }}>پاس ورڈ</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ paddingLeft: '2.5rem', paddingRight: '40px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }} className="urdu-text">پاس ورڈ بھول گئے؟</Link>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary urdu-text" style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'لاگ ان (Login)'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <p className="urdu-text" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            اکاؤنٹ نہیں ہے؟ <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: '0.5rem' }}>رجسٹر کریں (Register)</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
