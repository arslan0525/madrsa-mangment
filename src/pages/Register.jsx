import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BookOpen, Loader2, Eye, EyeOff, ShieldCheck, User, Mail, Smartphone, Lock } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password.length < 6) {
      setError('پاس ورڈ کم از کم 6 ہندسوں کا ہونا چاہیے (Min 6 characters)');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/profile'); 
    } catch (err) {
      console.error("Reg error:", err);
      let errorMessage = 'رجسٹریشن میں غلطی (Registration error)';
      if (err.message && err.message.includes('already registered')) {
        errorMessage = 'یہ ای میل پہلے سے رجسٹرڈ ہے (Email already registered)';
      } else if (err.message) {
        errorMessage = `غلطی: ${err.message}`;
      }
      setError(errorMessage);
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
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            borderRadius: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 20px rgba(15, 61, 62, 0.15)'
          }}>
            <BookOpen size={32} />
          </div>
          <h1 className="urdu-text" style={{ fontSize: '2rem', color: 'var(--primary)', margin: 0, lineHeight: 1.2 }}>نیا اکاؤنٹ بنائیں</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join the Madrasa Management Suite</p>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            color: '#dc2626', 
            padding: '1rem', 
            borderRadius: '0.75rem', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem',
            border: '1px solid #fee2e2'
          }} className="urdu-text">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label urdu-text" style={{ textAlign: 'right' }}>آپ کا نام (Full Name)</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input required type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="نام لکھیں" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label urdu-text" style={{ textAlign: 'right' }}>فون نمبر (Phone Number)</label>
            <div style={{ position: 'relative' }}>
              <Smartphone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input required type="tel" className="form-control" style={{ paddingLeft: '2.5rem' }} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="03xx xxxxxxx" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label urdu-text" style={{ textAlign: 'right' }}>ای میل (Email Address)</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input required type="email" className="form-control" style={{ paddingLeft: '2.5rem' }} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label urdu-text" style={{ textAlign: 'right' }}>پاس ورڈ (Secure Password)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                required 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                style={{ paddingLeft: '2.5rem', paddingRight: '40px' }}
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                placeholder="Min 6 characters"
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', padding: '0.75rem', backgroundColor: 'var(--secondary)', borderRadius: '0.75rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            <span className="urdu-text" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>آپ کا تمام ڈیٹا اس ڈیوائس پر محفوظ کیا جاتا ہے۔</span>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary urdu-text" style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'اکاؤنٹ بنائیں (Create Account)'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <p className="urdu-text" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            پہلے سے اکاؤنٹ ہے؟ <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: '0.5rem' }}>لاگ ان کریں (Login)</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
