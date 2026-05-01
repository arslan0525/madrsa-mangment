import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ArrowRight, HeartHandshake, Phone, Calendar, Wallet } from 'lucide-react';

const Donors = () => {
  const { donations } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Extract unique donors from donations array
  const donorsList = useMemo(() => {
    const uniqueDonorsMap = new Map();
    donations.forEach(d => {
      if (!uniqueDonorsMap.has(d.donor_name)) {
        uniqueDonorsMap.set(d.donor_name, {
          name: d.donor_name,
          phone: d.phone,
          total_donated: Number(d.amount) || 0,
          last_donation_date: d.date
        });
      } else {
        const existing = uniqueDonorsMap.get(d.donor_name);
        existing.total_donated += (Number(d.amount) || 0);
        if (new Date(d.date) > new Date(existing.last_donation_date)) {
          existing.last_donation_date = d.date;
        }
      }
    });
    return Array.from(uniqueDonorsMap.values());
  }, [donations]);

  const filteredDonors = useMemo(() => {
    return donorsList.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (d.phone && d.phone.includes(searchQuery))
    );
  }, [donorsList, searchQuery]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div>
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowRight size={20} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="urdu-text" style={{ fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>عطیات دہندگان</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Donors & Contributors</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
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
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>نام دہندہ (Donor Name)</th>
                <th>فون نمبر (Phone)</th>
                <th>کل عطیہ (Total Donated)</th>
                <th>آخری عطیہ (Last Donation)</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <HeartHandshake size={40} style={{ opacity: 0.3 }} />
                      <p className="urdu-text" style={{ fontSize: '1.1rem' }}>کوئی ریکارڈ موجود نہیں ہے۔</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDonors.map((d, index) => (
                  <tr key={index}>
                    <td>
                      <div className="urdu-text" style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary)' }}>{d.name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <Phone size={14} />
                        <span>{d.phone || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wallet size={16} style={{ color: '#16a34a' }} />
                        <span style={{ fontWeight: 700, color: '#16a34a' }}>{formatCurrency(d.total_donated)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Calendar size={14} />
                        <span>{new Date(d.last_donation_date).toLocaleDateString('en-GB')}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Donors;
