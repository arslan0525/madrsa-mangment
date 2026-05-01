import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Utensils, 
  Users, 
  Menu,
  X,
  BookOpen,
  LogOut,
  Settings,
  HeartHandshake,
  Download
} from 'lucide-react';
import InstallPrompt from './InstallPrompt';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, profile, currentUser } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const triggerInstall = () => {
    window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
  };

  const navItems = [
    { path: '/', label: 'Dashboard', urdu: 'ڈیش بورڈ', icon: <LayoutDashboard size={22} /> },
    { path: '/students', label: 'Students', urdu: 'طلبہ فیس', icon: <Users size={22} /> },
    { path: '/donations', label: 'Donations', urdu: 'عطیات / چندہ', icon: <Wallet size={22} /> },
    { path: '/expenses', label: 'Expenses', urdu: 'اخراجات', icon: <Receipt size={22} /> },
    { path: '/donors', label: 'Donors', urdu: 'عطیات دہندگان', icon: <HeartHandshake size={22} /> },
    { path: '/kitchen', label: 'Kitchen', urdu: 'باورچی خانہ', icon: <Utensils size={22} /> },
    { path: '/reports', label: 'Reports', urdu: 'رپورٹس', icon: <BookOpen size={22} /> },
  ];

  return (
    <div className="app-layout">
      <InstallPrompt />
      
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)' }}>
            <div style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              padding: '8px', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="urdu-text" style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>
                {profile?.madrasaName || 'اپنا مدرسہ'}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apna Madrasa</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="urdu-text" style={{ fontSize: '1.2rem', lineHeight: 1.2 }}>{item.urdu}</span>
              </div>
            </Link>
          ))}
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <Settings size={20} />
            <span className="urdu-text" style={{ fontSize: '1.1rem' }}>سیٹنگز (Settings)</span>
          </Link>
          <button className="nav-item" onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
            <LogOut size={20} />
            <span className="urdu-text" style={{ fontSize: '1.1rem' }}>لاگ آؤٹ (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <button 
              onClick={triggerInstall}
              className="btn btn-secondary"
              style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                borderRadius: '2rem',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                fontWeight: 600
              }}
            >
              <Download size={16} />
              <span className="urdu-text" style={{ fontSize: '0.9rem' }}>ڈاؤن لوڈ ایپ</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
              <div className="desktop-only" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }} className="urdu-text">{profile?.managerName || currentUser?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>ADMINISTRATOR</div>
              </div>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(15, 61, 62, 0.2)'
              }}>
                {currentUser?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>

        {/* Bottom Navigation for Mobile */}
        <nav className="bottom-nav">
          {[navItems[0], navItems[1], navItems[2], navItems[3], navItems[6]].map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {React.cloneElement(item.icon, { size: 24, className: 'icon' })}
              <span className="urdu-text" style={{ fontSize: '0.85rem', lineHeight: 1 }}>{item.urdu.split(' ')[0]}</span>
            </Link>
          ))}
        </nav>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 5, backdropFilter: 'blur(2px)' }}
          onClick={toggleSidebar}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
