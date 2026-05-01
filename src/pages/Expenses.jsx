import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, ArrowRight, Receipt, Tag, Calendar, FileText, X } from 'lucide-react';

const Expenses = () => {
  const { expenses, addExpense, deleteExpense } = useContext(AppContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [formData, setFormData] = useState({
    expense_type: 'Food', amount: '', notes: '', date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newExpense = { ...formData, id: Date.now().toString(), amount: Number(formData.amount) };
    addExpense(newExpense);
    setIsModalOpen(false);
    setShowSuccessDialog(true);
    setFormData({ ...formData, amount: '', notes: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('کیا آپ واقعی یہ خرچ ڈیلیٹ کرنا چاہتے ہیں؟')) deleteExpense(id);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.notes.toLowerCase().includes(searchQuery.toLowerCase()) || e.expense_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || e.expense_type === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, categoryFilter]);

  const formatCurrency = (amount) => new Intl.NumberFormat('ur-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div>
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowRight size={20} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="urdu-text" style={{ fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>اخراجات کی تفصیل</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Expense Management</span>
          </div>
        </div>
        <button className="btn btn-primary urdu-text" style={{ backgroundColor: '#dc2626' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> نیا خرچ (New Expense)
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="تلاش کریں..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="form-control" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">تمام زمرے (All Categories)</option>
            <option value="Food">کھانا (Food)</option>
            <option value="Salary">تنخواہ (Salary)</option>
            <option value="Electricity">بجلی (Electricity)</option>
            <option value="Maintenance">مرمت (Maintenance)</option>
            <option value="Other">دیگر (Other)</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>تاریخ (Date)</th>
                <th>زمرہ (Category)</th>
                <th>رقم (Amount)</th>
                <th>تفصیل (Notes)</th>
                <th>عمل (Action)</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Receipt size={40} style={{ opacity: 0.3 }} />
                      <p className="urdu-text" style={{ fontSize: '1.1rem' }}>کوئی خرچ موجود نہیں ہے۔</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => (
                  <tr key={e.id}>
                    <td><div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(e.date).toLocaleDateString('en-GB')}</div></td>
                    <td>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '2rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fee2e2'
                      }}>
                        {e.expense_type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>{formatCurrency(e.amount)}</td>
                    <td style={{ fontSize: '0.9rem' }} className="urdu-text">{e.notes || '-'}</td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#dc2626', borderColor: '#fee2e2' }} onClick={() => handleDelete(e.id)}>
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
              <h2 className="urdu-text" style={{ fontSize: '1.5rem', color: '#dc2626', margin: 0 }}>نیا خرچ درج کریں</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label urdu-text" style={{ textAlign: 'right' }}>خرچ کی مد (Category)</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <select className="form-control" style={{ paddingLeft: '2.5rem' }} value={formData.expense_type} onChange={(e) => setFormData({...formData, expense_type: e.target.value})}>
                    <option value="Food">کھانا (Food / Kitchen)</option>
                    <option value="Electricity">بجلی کا بل (Electricity)</option>
                    <option value="Salary">تنخواہ (Salary)</option>
                    <option value="Water">پانی (Water)</option>
                    <option value="Maintenance">مرمت (Maintenance)</option>
                    <option value="Other">دیگر (Other)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label urdu-text" style={{ textAlign: 'right' }}>رقم (Amount)</label>
                <input required type="number" className="form-control" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="رقم درج کریں" />
              </div>

              <div className="form-group">
                <label className="form-label urdu-text" style={{ textAlign: 'right' }}>تفصیل (Description / Notes)</label>
                <div style={{ position: 'relative' }}>
                  <FileText size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <textarea 
                    className="form-control urdu-text" 
                    style={{ paddingLeft: '2.5rem', minHeight: '100px', resize: 'none' }} 
                    value={formData.notes} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                    placeholder="تفصیل لکھیں..."
                  />
                </div>
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
                <button type="submit" className="btn btn-primary urdu-text" style={{ flex: 1, backgroundColor: '#dc2626' }}>محفوظ کریں</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessDialog && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1.25rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <Receipt size={32} />
            </div>
            <h2 className="urdu-text" style={{ marginBottom: '0.5rem', fontSize: '1.75rem', color: '#dc2626' }}>خرچ درج ہو گیا!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Expense has been successfully recorded.</p>
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

export default Expenses;
