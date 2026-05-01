import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, Plus, CheckCircle, Circle, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = new Date().getFullYear().toString();

const Students = () => {
  const { students, addStudent, deleteStudent, toggleStudentFee } = useContext(AppContext);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', monthlyFee: '' });
  const navigate = useNavigate();

  const handleAdd = (e) => {
    e.preventDefault();
    if (newStudent.name && newStudent.monthlyFee) {
      addStudent({ 
        name: newStudent.name, 
        monthlyFee: Number(newStudent.monthlyFee),
        fees: { [CURRENT_YEAR]: {} }
      });
      setNewStudent({ name: '', monthlyFee: '' });
      setShowAddForm(false);
    }
  };

  const calculateStudentTotals = (student) => {
    const yearFees = (student.fees && student.fees[CURRENT_YEAR]) || {};
    const paidMonthsCount = Object.values(yearFees).filter(Boolean).length;
    const totalPaid = paidMonthsCount * (student.monthlyFee || 0);
    const currentMonthIndex = new Date().getMonth();
    const monthsPassed = currentMonthIndex + 1;
    const expectedTotal = monthsPassed * (student.monthlyFee || 0);
    const remainingBalance = Math.max(0, expectedTotal - totalPaid);
    
    return { totalPaid, remainingBalance };
  };

  return (
    <div>
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowRight size={20} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="urdu-text" style={{ fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>طلبہ فیس مینجمنٹ</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Student Fee Management</span>
          </div>
        </div>
        {!showAddForm && (
          <button className="btn btn-primary urdu-text" onClick={() => setShowAddForm(true)}>
            <Plus size={20} /> نیا طالب علم (Add Student)
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="urdu-text" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>طالب علم کا اندراج (Add New Student)</h2>
          <form onSubmit={handleAdd} className="grid-cols-2" style={{ alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label urdu-text">نام (Name)</label>
              <input 
                type="text" 
                className="form-control" 
                value={newStudent.name} 
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                required
                placeholder="Enter student name"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label urdu-text">ماہانہ فیس (Monthly Fee)</label>
              <input 
                type="number" 
                className="form-control" 
                value={newStudent.monthlyFee} 
                onChange={(e) => setNewStudent({...newStudent, monthlyFee: e.target.value})}
                required
                placeholder="Amount (e.g. 500)"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary urdu-text" style={{ flex: 1 }}>محفوظ کریں (Save)</button>
              <button type="button" className="btn btn-secondary urdu-text" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>منسوخ (Cancel)</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {students.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3 className="urdu-text" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>کوئی طالب علم موجود نہیں</h3>
            <p>No students added yet. Click the button above to add one.</p>
          </div>
        ) : (
          students.map((student) => {
            const { totalPaid, remainingBalance } = calculateStudentTotals(student);
            const yearFees = (student.fees && student.fees[CURRENT_YEAR]) || {};

            return (
              <div key={student.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div>
                    <h3 className="urdu-text" style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: 0 }}>{student.name}</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Monthly Fee: <strong style={{ color: 'var(--text-main)' }}>Rs {student.monthlyFee}</strong></span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Paid: <strong style={{ color: '#16a34a' }}>Rs {totalPaid}</strong></span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pending: <strong style={{ color: remainingBalance > 0 ? '#dc2626' : '#16a34a' }}>Rs {remainingBalance}</strong></span>
                    </div>
                  </div>
                  <button onClick={() => deleteStudent(student.id)} className="btn btn-secondary" style={{ padding: '0.5rem', color: '#dc2626', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }} title="Delete Student">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div>
                  <p className="urdu-text" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>ماہانہ فیس کی تفصیل ({CURRENT_YEAR}) - Fee Status</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '1rem' }}>
                    {MONTHS.map((month) => {
                      const isPaid = !!yearFees[month];
                      return (
                        <div 
                          key={month}
                          onClick={() => toggleStudentFee(student.id, CURRENT_YEAR, month)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.75rem 0.5rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${isPaid ? '#16a34a' : 'var(--border-color)'}`,
                            backgroundColor: isPaid ? '#dcfce7' : 'var(--secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isPaid ? '#16a34a' : 'var(--text-muted)', marginBottom: '0.25rem' }}>{month}</span>
                          {isPaid ? <CheckCircle size={20} color="#16a34a" /> : <Circle size={20} color="var(--text-muted)" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Students;
