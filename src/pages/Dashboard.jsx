import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users,
  PlusCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const CURRENT_YEAR = new Date().getFullYear().toString();

const Dashboard = () => {
  const { students, donations, expenses } = useContext(AppContext);
  const [timeFilter, setTimeFilter] = useState('30days'); // 7days, 30days, 6months, 1year, all

  const isDateInRange = (dateStr, filter) => {
    if (filter === 'all') return true;
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (filter === '7days') return diffDays <= 7;
    if (filter === '30days') return diffDays <= 30;
    if (filter === '6months') return diffDays <= 180;
    if (filter === '1year') return diffDays <= 365;
    return true;
  };

  const filteredDonations = useMemo(() => donations.filter(d => isDateInRange(d.date, timeFilter)), [donations, timeFilter]);
  const filteredExpenses = useMemo(() => expenses.filter(e => isDateInRange(e.date, timeFilter)), [expenses, timeFilter]);

  // Calculate Student Fees Data
  const studentFeeData = useMemo(() => {
    let totalCollected = 0;
    let totalPending = 0;
    
    const currentMonthIndex = new Date().getMonth();
    const monthsPassed = currentMonthIndex + 1;

    students.forEach(student => {
      const yearFees = (student.fees && student.fees[CURRENT_YEAR]) || {};
      const paidMonthsCount = Object.values(yearFees).filter(Boolean).length;
      
      const paid = paidMonthsCount * (student.monthlyFee || 0);
      const expected = monthsPassed * (student.monthlyFee || 0);
      const pending = Math.max(0, expected - paid);

      totalCollected += paid;
      totalPending += pending;
    });

    return { totalCollected, totalPending };
  }, [students]);

  const totalIncome = filteredDonations.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) + studentFeeData.totalCollected;
  const totalExpense = filteredExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const balance = totalIncome - totalExpense;

  // Dynamic Monthly Data Calculation
  const monthlyData = useMemo(() => {
    const monthsMap = new Map();
    filteredDonations.forEach(d => {
      const month = new Date(d.date).toISOString().slice(0, 7);
      if (!monthsMap.has(month)) monthsMap.set(month, { name: month, income: 0, expense: 0 });
      monthsMap.get(month).income += (Number(d.amount) || 0);
    });
    filteredExpenses.forEach(e => {
      const month = new Date(e.date).toISOString().slice(0, 7);
      if (!monthsMap.has(month)) monthsMap.set(month, { name: month, income: 0, expense: 0 });
      monthsMap.get(month).expense += (Number(e.amount) || 0);
    });
    return Array.from(monthsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredDonations, filteredExpenses]);

  // Dynamic Category Data Calculation
  const categoryData = useMemo(() => {
    const cats = { 'Zakat': 0, 'Sadqa': 0, 'Ushr': 0, 'General': 0, 'Student Fees': studentFeeData.totalCollected };
    filteredDonations.forEach(d => {
      if (cats[d.donation_type] !== undefined) cats[d.donation_type] += (Number(d.amount) || 0);
      else cats['General'] += (Number(d.amount) || 0);
    });
    return [
      { name: 'زکوٰۃ (Zakat)', value: cats['Zakat'] },
      { name: 'صدقہ (Sadqa)', value: cats['Sadqa'] },
      { name: 'عشر (Ushr)', value: cats['Ushr'] },
      { name: 'طالب علم فیس (Fees)', value: cats['Student Fees'] },
      { name: 'عطیہ (General)', value: cats['General'] }
    ].filter(item => item.value > 0);
  }, [filteredDonations, studentFeeData]);

  const COLORS = ['#0F3D3E', '#D4AF37', '#16a34a', '#3b82f6', '#8b5cf6'];
  const formatCurrency = (amount) => new Intl.NumberFormat('ur-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div>
      <div className="page-title">
        <h1 className="urdu-text" style={{ fontSize: '1.75rem', margin: 0 }}>ڈیش بورڈ <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>Dashboard</span></h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/donations" className="btn btn-primary urdu-text" style={{ flex: '1' }}>
            <PlusCircle size={18} /> عطیہ شامل کریں
          </Link>
          <Link to="/expenses" className="btn btn-secondary urdu-text" style={{ flex: '1', color: '#dc2626', borderColor: '#fee2e2' }}>
            <PlusCircle size={18} /> خرچ درج کریں
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
        <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
        <span className="urdu-text" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>وقت منتخب کریں (Filter):</span>
      </div>
      
      <div className="filter-pills-container urdu-text" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <button className={`filter-pill ${timeFilter === '7days' ? 'active' : ''}`} onClick={() => setTimeFilter('7days')} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: timeFilter === '7days' ? 'var(--primary)' : 'white', color: timeFilter === '7days' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}>7 دن (7 Days)</button>
        <button className={`filter-pill ${timeFilter === '30days' ? 'active' : ''}`} onClick={() => setTimeFilter('30days')} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: timeFilter === '30days' ? 'var(--primary)' : 'white', color: timeFilter === '30days' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}>30 دن (30 Days)</button>
        <button className={`filter-pill ${timeFilter === '6months' ? 'active' : ''}`} onClick={() => setTimeFilter('6months')} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: timeFilter === '6months' ? 'var(--primary)' : 'white', color: timeFilter === '6months' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}>6 ماہ (6 Months)</button>
        <button className={`filter-pill ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: timeFilter === 'all' ? 'var(--primary)' : 'white', color: timeFilter === 'all' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}>تمام (All)</button>
      </div>

      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Balance</p>
             <div style={{ backgroundColor: 'rgba(15, 61, 62, 0.1)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <Wallet size={20} />
            </div>
          </div>
          <h3 className="urdu-text" style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>موجودہ بیلنس</h3>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(balance)}</h2>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Income</p>
             <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="urdu-text" style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>کل آمدن</h3>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(totalIncome)}</h2>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Expense</p>
             <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <h3 className="urdu-text" style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>کل خرچ</h3>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(totalExpense)}</h2>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Students</p>
             <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent)', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <Users size={20} />
            </div>
          </div>
          <h3 className="urdu-text" style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>کل طلبہ</h3>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)' }}>{students.length}</h2>
        </div>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Total Fees Collected (Year)</p>
             <div style={{ color: '#16a34a' }}><Wallet size={24} /></div>
          </div>
          <h3 className="urdu-text" style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>وصول شدہ فیس</h3>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(studentFeeData.totalCollected)}</h2>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Pending Fees (Year)</p>
             <div style={{ color: '#dc2626' }}><AlertCircle size={24} /></div>
          </div>
          <h3 className="urdu-text" style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>باقی فیس</h3>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(studentFeeData.totalPending)}</h2>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gap: '1rem' }}>
        <div className="card" style={{ height: 'auto', minHeight: '350px', padding: '1rem' }}>
          <h3 className="urdu-text" style={{ marginBottom: '1.25rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
            ماہانہ آمدنی اور اخراجات <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Trend)</span>
          </h3>
          {monthlyData.length > 0 ? (
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)} 
                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '12px' }}
                  />
                  <Bar dataKey="income" name="آمدن" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="expense" name="خرچ" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', height: '250px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }} className="urdu-text">کوئی ڈیٹا موجود نہیں</div>
          )}
        </div>

        <div className="card" style={{ height: 'auto', minHeight: '350px', padding: '1rem' }}>
          <h3 className="urdu-text" style={{ marginBottom: '1.25rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
            عطیات کی اقسام <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Income)</span>
          </h3>
          {categoryData.length > 0 ? (
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={80} 
                    paddingAngle={2} 
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: 'var(--shadow-md)', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div style={{ display: 'flex', height: '250px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }} className="urdu-text">کوئی ڈیٹا موجود نہیں</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
