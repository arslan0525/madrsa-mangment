import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, Utensils, X, Package, Calendar, Scale } from 'lucide-react';

const Kitchen = () => {
  const { kitchen, addKitchenItem, deleteKitchenItem } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: '',
    unit: 'kg',
    type: 'Added',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      ...formData,
      id: Date.now().toString(),
      quantity: Number(formData.quantity)
    };
    addKitchenItem(newEntry);
    setIsModalOpen(false);
    setFormData({ ...formData, item_name: '', quantity: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('کیا آپ واقعی یہ ریکارڈ ڈیلیٹ کرنا چاہتے ہیں؟')) {
      deleteKitchenItem(id);
    }
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
            <h1 className="urdu-text" style={{ fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>باورچی خانہ کا حساب</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Kitchen Inventory & Rations</span>
          </div>
        </div>
        <button className="btn btn-primary urdu-text" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> نیا اندارج (Add Record)
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>تاریخ (Date)</th>
                <th>آئٹم کا نام (Item)</th>
                <th>حالت (Type)</th>
                <th>مقدار (Quantity)</th>
                <th>عمل (Action)</th>
              </tr>
            </thead>
            <tbody>
              {kitchen.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Utensils size={40} style={{ opacity: 0.3 }} />
                      <p className="urdu-text" style={{ fontSize: '1.1rem' }}>کوئی ریکارڈ موجود نہیں ہے۔</p>
                    </div>
                  </td>
                </tr>
              ) : (
                kitchen.map((k) => (
                  <tr key={k.id}>
                    <td><div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(k.date).toLocaleDateString('en-GB')}</div></td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{k.item_name}</td>
                    <td>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '2rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        backgroundColor: k.type === 'Added' ? '#dcfce7' : '#fef2f2',
                        color: k.type === 'Added' ? '#16a34a' : '#dc2626',
                        border: `1px solid ${k.type === 'Added' ? '#fee2e2' : '#fee2e2'}`
                      }}>
                        {k.type === 'Added' ? 'اسٹاک میں آیا' : 'استعمال ہوا'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{k.quantity} {k.unit}</td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#dc2626', borderColor: '#fee2e2' }} onClick={() => handleDelete(k.id)}>
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
              <h2 className="urdu-text" style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: 0 }}>راشن کی تفصیل درج کریں</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label urdu-text">راشن کا نام (Item Name)</label>
                <div style={{ position: 'relative' }}>
                  <Package size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input required type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} value={formData.item_name} onChange={(e) => setFormData({...formData, item_name: e.target.value})} placeholder="آٹا، چاول، چینی وغیرہ" />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label urdu-text">مقدار (Quantity)</label>
                  <div style={{ position: 'relative' }}>
                    <Scale size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input required type="number" className="form-control" style={{ paddingLeft: '2.5rem' }} value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label urdu-text">اکائی (Unit)</label>
                  <select className="form-control" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                    <option value="kg">کلو گرام (Kg)</option>
                    <option value="liters">لیٹر (Liters)</option>
                    <option value="sacks">بوریاں (Sacks)</option>
                    <option value="pieces">عدد (Pieces)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label urdu-text">حالت (Type)</label>
                <select className="form-control" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="Added">اسٹاک میں آیا (Stock In)</option>
                  <option value="Used">استعمال ہوا (Consumed)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label urdu-text">تاریخ (Date)</label>
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
    </div>
  );
};

export default Kitchen;
