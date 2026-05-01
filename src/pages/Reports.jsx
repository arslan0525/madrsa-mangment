import React, { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart2, TrendingUp, TrendingDown, Wallet, Users, AlertCircle, Calendar } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear().toString();

const Reports = () => {
  const { donations, expenses, students } = useContext(AppContext);
  const navigate = useNavigate();

  // Calculate student fee totals
  const studentFeeReport = useMemo(() => {
    let totalCollected = 0;
    let totalPending = 0;
    const studentStats = students.map(student => {
      const yearFees = (student.fees && student.fees[CURRENT_YEAR]) || {};
      const paidMonthsCount = Object.values(yearFees).filter(Boolean).length;
      const currentMonthIndex = new Date().getMonth();
      const monthsPassed = currentMonthIndex + 1;
      
      const paid = paidMonthsCount * (student.monthlyFee || 0);
      const expected = monthsPassed * (student.monthlyFee || 0);
      const pending = Math.max(0, expected - paid);
      
      totalCollected += paid;
      totalPending += pending;
      
      return {
        name: student.name,
        paid,
        pending,
        totalExpected: (student.monthlyFee || 0) * 12
      };
    });
    return { totalCollected, totalPending, studentStats };
  }, [students]);

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    const monthsMap = new Map();
    
    donations.forEach(d => {
      const month = new Date(d.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthsMap.has(month)) monthsMap.set(month, { name: month, income: 0, expense: 0 });
      monthsMap.get(month).income += (Number(d.amount) || 0);
    });

    expenses.forEach(e => {
      const month = new Date(e.date).toISOString().slice(0, 7);
      if (!monthsMap.has(month)) monthsMap.set(month, { name: month, income: 0, expense: 0 });
      monthsMap.get(month).expense += (Number(e.amount) || 0);
    });

    // Add student fees to current month or distribute? 
    // For simplicity, we show current month fee collection if we had dates, 
    // but here we'll just show overall totals in the summary cards.

    return Array.from(monthsMap.values()).sort((a, b) => b.name.localeCompare(a.name)); // Newest first
  }, [donations, expenses]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
  };

  const getMonthName = (yyyy_mm) => {
    const date = new Date(yyyy_mm + '-01');
    return date.toLocaleDateString('ur-PK', { year: 'numeric', month: 'long' }) + ' (' + date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) + ')';
  };

  return (
    <div>
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowRight size={20} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="urdu-text" style={{ fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>رپورٹس اور خلاصہ</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Financial Reports & Summaries</span>
          </div>
        </div>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="urdu-text" style={{ fontSize: '1.25rem', margin: 0 }}>فیس رپورٹ ({CURRENT_YEAR})</h3>
            <Users size={24} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="urdu-text">کل وصول شدہ:</span>
              <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{formatCurrency(studentFeeReport.totalCollected)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffcfcf' }}>
              <span className="urdu-text">کل واجب الادا:</span>
              <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{formatCurrency(studentFeeReport.totalPending)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="urdu-text" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--primary)' }}>مجموعی خلاصہ</h3>
            <BarChart2 size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="urdu-text">کل آمدن (بشمول فیس):</span>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>
                {formatCurrency(donations.reduce((acc, d) => acc + d.amount, 0) + studentFeeReport.totalCollected)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="urdu-text">کل اخراجات:</span>
              <span style={{ fontWeight: 700, color: '#dc2626' }}>
                {formatCurrency(expenses.reduce((acc, e) => acc + e.amount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="urdu-text" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={24} /> طالب علم وار فیس رپورٹ (Student Totals)
        </h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>نام (Name)</th>
                <th>ادا شدہ (Paid)</th>
                <th>باقی (Pending)</th>
                <th>سالانہ ہدف (Yearly Target)</th>
              </tr>
            </thead>
            <tbody>
              {studentFeeReport.studentStats.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }} className="urdu-text">کوئی طالب علم موجود نہیں ہے۔</td></tr>
              ) : (
                studentFeeReport.studentStats.map((s, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>{formatCurrency(s.paid)}</td>
                    <td style={{ color: s.pending > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>{formatCurrency(s.pending)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(s.totalExpected)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="urdu-text" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={24} /> ماہانہ مالیاتی رپورٹ (Monthly Cashflow)
        </h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>مہینہ (Month)</th>
                <th>آمدن (Income)</th>
                <th>خرچ (Expense)</th>
                <th>بچت / نقصان (Balance)</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }} className="urdu-text">کوئی ریکارڈ موجود نہیں ہے۔</td></tr>
              ) : (
                monthlySummary.map((m) => {
                  const net = m.income - m.expense;
                  return (
                    <tr key={m.name}>
                      <td style={{ fontWeight: 600 }} className="urdu-text" dir="rtl">{getMonthName(m.name)}</td>
                      <td style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(m.income)}</td>
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(m.expense)}</td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '2rem', 
                          fontSize: '0.85rem', 
                          fontWeight: 700,
                          backgroundColor: net >= 0 ? '#dcfce7' : '#fef2f2',
                          color: net >= 0 ? '#16a34a' : '#dc2626'
                        }}>
                          {net >= 0 ? '+' : ''}{formatCurrency(net)}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
