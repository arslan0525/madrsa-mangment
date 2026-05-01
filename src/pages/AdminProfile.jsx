import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { User, Building, Save, ArrowRight, Settings, Info } from 'lucide-react';

const AdminProfile = () => {
  const { profile, updateProfile, currentUser } = useContext(AppContext);
  const [formData, setFormData] = useState({
    madrasaName: profile?.madrasaName || '',
    managerName: profile?.managerName || ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    alert('پروفائل محفوظ ہو گئی ہے (Profile Saved)');
  };

  const navigate = useNavigate();

  return (
    <div>
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowRight size={20} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="urdu-text" style={{ fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>مدرسہ پروفائل</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Madrasa & Admin Settings</span>
          </div>
        </div>
      </div>

      <div className="grid-cols-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ 
              backgroundColor: 'rgba(15, 61, 62, 0.1)', 
              color: 'var(--primary)', 
              padding: '1.25rem', 
              borderRadius: '1rem' 
            }}>
              <User size={32} />
            </div>
            <div>
              <h2 className="urdu-text" style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0 }}>اکاؤنٹ کی معلومات</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Administrator Details</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name (نام)</label>
              <div style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>{currentUser?.name}</div>
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email (ای میل)</label>
              <div style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>{currentUser?.email || 'N/A'}</div>
            </div>
            <div style={{ backgroundColor: 'var(--secondary)', padding: '1rem', borderRadius: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Info size={20} style={{ color: 'var(--primary)' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                This data is stored locally on this device and is not synced with any server.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ 
              backgroundColor: 'rgba(212, 175, 55, 0.15)', 
              color: 'var(--accent)', 
              padding: '1.25rem', 
              borderRadius: '1rem' 
            }}>
              <Building size={32} />
            </div>
            <div>
              <h2 className="urdu-text" style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0 }}>مدرسہ سیٹ اپ</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Madrasa Identification</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label urdu-text" style={{ textAlign: 'right' }}>مدرسہ کا نام (Madrasa Name)</label>
              <input required type="text" className="form-control urdu-text" style={{ fontSize: '1.2rem' }} value={formData.madrasaName} onChange={(e) => setFormData({...formData, madrasaName: e.target.value})} dir="rtl" />
            </div>
            <div className="form-group">
              <label className="form-label urdu-text" style={{ textAlign: 'right' }}>مہتمم کا نام (Manager Name)</label>
              <input required type="text" className="form-control urdu-text" style={{ fontSize: '1.2rem' }} value={formData.managerName} onChange={(e) => setFormData({...formData, managerName: e.target.value})} dir="rtl" />
            </div>
            <button type="submit" className="btn btn-primary urdu-text" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.2rem' }}>
              <Save size={20} /> معلومات محفوظ کریں
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
