import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BookOpen, Loader2, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 6) {
      setError('پاس ورڈ کم از کم 6 ہندسوں کا ہونا چاہیے (Min 6 characters)');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('پاس ورڈز آپس میں نہیں مل رہے (Passwords do not match)');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setSuccess(true);
    } catch (err) {
      setError('غلطی (Error)');
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
            width: '64px', 
            height: '64px', 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            borderRadius: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <BookOpen size={32} />
          </div>
          <h1 className="urdu-text" style={{ fontSize: '1.75rem', color: 'var(--primary)', margin: 0, lineHeight: 1.2 }}>نیا پاس ورڈ سیٹ کریں</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Set New Password</p>
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
        
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 1rem' }} />
              <p className="urdu-text" style={{ fontSize: '1.1rem', fontWeight: 600 }}>پاس ورڈ کامیابی سے تبدیل ہو گیا ہے!</p>
            </div>
            <Link to="/login" className="btn btn-primary urdu-text" style={{ width: '100%' }}>لاگ ان کریں</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label urdu-text" style={{ textAlign: 'right' }}>نیا پاس ورڈ</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-control" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="New Password"
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

            <div className="form-group">
              <label className="form-label urdu-text" style={{ textAlign: 'right' }}>پاس ورڈ کی تصدیق کریں</label>
              <input 
                required 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm Password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary urdu-text" style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', marginTop: '2rem' }}>
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'پاس ورڈ تبدیل کریں (Update)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
