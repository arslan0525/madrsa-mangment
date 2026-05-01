import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Trash2, ArrowRight, Receipt, Tag, Calendar, FileText, X, Wallet, User, CreditCard } from 'lucide-react';

const Donations = () => {
  const { donations, addDonation, deleteDonation } = useContext(AppContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const [formData, setFormData] = useState({
    donor_name: '', phone: '', amount: '', donation_type: 'General', item_type: 'Cash', date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDonation = { ...formData, id: Date.now().toString(), amount: Number(formData.amount) };
    addDonation(newDonation);
    setIsModalOpen(false);
    setShowSuccessDialog(true);
    setFormData({ ...formData, donor_name: '', phone: '', amount: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('کیا آپ واقعی یہ ریکارڈ ڈیلیٹ کرنا چاہتے ہیں؟')) {
      deleteDonation(id);
    }
  };

  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      const matchesSearch = d.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) || d.phone.includes(searchQuery);
      const matchesType = typeFilter === 'All' || d.donation_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [donations, searchQuery, typeFilter]);

  const formatCurrency = (amount) => new Intl.NumberFormat('ur-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div>
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowRight size={20} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="urdu-text" style={{ fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>عطیات و صدقات</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Donations & Charity</span>
          </div>
        </div>
        <button className="btn btn-primary urdu-text" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> نیا عطیہ (New Donation)
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="نام یا فون نمبر سے تلاش کریں..." 
              style={{ paddingLeft: '2.5rem' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="form-control" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">تمام اقسام (All)</option>
            <option value="Zakat">زکوٰۃ (Zakat)</option>
            <option value="Sadqa">صدقہ (Sadqa)</option>
            <option value="Ushr">عشر (Ushr)</option>
            <option value="General">عطیہ (General)</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>تاریخ (Date)</th>
                <th>نام دہندہ (Donor)</th>
                <th>قسم (Type)</th>
                <th>رقم / چیز (Amount)</th>
                <th>عمل (Action)</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Wallet size={40} style={{ opacity: 0.3 }} />
                      <p className="urdu-text" style={{ fontSize: '1.1rem' }}>کوئی ریکارڈ موجود نہیں ہے۔</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d) => (
                  <tr key={d.id}>
                    <td><div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(d.date).toLocaleDateString('en-GB')}</div></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{d.donor_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.phone}</div>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '2rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--primary)',
                        border: '1px solid var(--border-color)'
                      }}>
                        {d.donation_type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {d.item_type === 'Cash' || d.item_type === 'Bank' ? formatCurrency(d.amount) : `${d.item_type}: ${d.amount}`}
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#dc2626', borderColor: '#fee2e2' }} onClick={() => handleDelete(d.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="urdu-text" style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: 0 }}>نیا عطیہ درج کریں</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label urdu-text" style={{ textAlign: 'right' }}>نام دہندہ (Donor Name)</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input required type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} value={formData.donor_name} onChange={(e) => setFormData({...formData, donor_name: e.target.value})} placeholder="نام درج کریں" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label urdu-text" style={{ textAlign: 'right' }}>فون نمبر (Phone - Optional)</label>
                <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="03xx xxxxxxx" />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label urdu-text">ذریعہ (Method)</label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <select className="form-control" style={{ paddingLeft: '2.5rem' }} value={formData.item_type} onChange={(e) => setFormData({...formData, item_type: e.target.value})}>
                      <option value="Cash">نقد (Cash)</option>
                      <option value="Bank">بینک (Bank)</option>
                      <option value="Item">اشیاء (Item)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label urdu-text">قسم (Type)</label>
                  <div style={{ position: 'relative' }}>
                    <Tag size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <select className="form-control" style={{ paddingLeft: '2.5rem' }} value={formData.donation_type} onChange={(e) => setFormData({...formData, donation_type: e.target.value})}>
                      <option value="General">عطیہ</option>
                      <option value="Zakat">زکوٰۃ</option>
                      <option value="Sadqa">صدقہ</option>
                      <option value="Ushr">عشر</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label urdu-text" style={{ textAlign: 'right' }}>رقم / مقدار (Amount / Quantity)</label>
                <input required type="number" className="form-control" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="رقم درج کریں" />
              </div>

              <div className="form-group">
                <label className="form-label urdu-text" style={{ textAlign: 'right' }}>تاریخ (Date)</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input required type="date" className="form-control" style={{ paddingLeft: '2.5rem' }} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="button" className="btn btn-secondary urdu-text" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>منسوخ</button>
                <button type="submit" className="btn btn-primary urdu-text" style={{ flex: 1 }}>محفوظ کریں</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessDialog && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1.25rem', backgroundColor: 'rgba(15, 61, 62, 0.1)', color: 'var(--primary)', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <Plus size={32} />
            </div>
            <h2 className="urdu-text" style={{ marginBottom: '0.5rem', fontSize: '1.75rem', color: 'var(--primary)' }}>ریکارڈ محفوظ ہو گیا!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Donation has been successfully recorded.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-primary urdu-text" onClick={() => { setShowSuccessDialog(false); navigate('/'); }}>ڈیش بورڈ پر جائیں</button>
              <button className="btn btn-secondary urdu-text" onClick={() => { setShowSuccessDialog(false); setIsModalOpen(true); }}>مزید درج کریں</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;
