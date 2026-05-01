import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BookOpen, Loader2, ArrowLeft, Send, CheckCircle2, Mail, Info } from 'lucide-react';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(identifier);
      setSuccess('پاس ورڈ ری سیٹ لنک آپ کے ای میل پر بھیج دیا گیا ہے (Mock Email Sent)');
    } catch (err) {
      setError('لاگ ان میں غلطی (Error)');
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
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <ArrowLeft size={18} /> <span className="urdu-text">واپس (Back)</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
          <h1 className="urdu-text" style={{ fontSize: '1.75rem', color: 'var(--primary)', margin: 0, lineHeight: 1.2 }}>پاس ورڈ کی بحالی</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Account Recovery</p>
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
            <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 1rem' }} />
              <p className="urdu-text" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{success}</p>
            </div>
            <Link to="/login" className="btn btn-primary urdu-text" style={{ width: '100%' }}>لاگ ان کریں</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label urdu-text" style={{ textAlign: 'right' }}>ای میل یا فون نمبر</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="email@example.com"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--secondary)', borderRadius: '0.75rem' }}>
              <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p className="urdu-text" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                نوٹ: چونکہ یہ ایپ صرف آپ کے موبائل پر کام کرتی ہے، پاس ورڈ ری سیٹ کا عمل صرف ایک مظاہرہ ہے۔
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary urdu-text" style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', marginTop: '2rem' }}>
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'بحال کریں (Reset)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
