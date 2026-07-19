import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CalendarDays, CalendarCheck, LogOut, Stethoscope, Users, Clock, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Super Admin', 'Receptionist', 'Doctor'] },
    { name: 'Appointments', path: '/appointments', icon: <CalendarCheck size={20} />, roles: ['Super Admin', 'Receptionist', 'Doctor'] },
    { name: 'Scheduler', path: '/scheduler', icon: <CalendarDays size={20} />, roles: ['Super Admin', 'Receptionist'] },
    { name: 'Staff', path: '/staff', icon: <Users size={20} />, roles: ['Super Admin'] },
    { name: 'Schedules', path: '/schedules', icon: <Clock size={20} />, roles: ['Super Admin'] },
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="sidebar-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Stethoscope size={28} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.2rem' }}>EMR System</h3>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>
        
        <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {allowedItems.map((item, i) => (
            <NavLink 
              key={i} 
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                fontWeight: isActive ? 500 : 400
              })}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>

        <div style={{ padding: '24px 16px', borderTop: '1px solid var(--bg-glass-border)' }}>
          <div style={{ marginBottom: '16px', padding: '0 16px' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.name}</p>
            <span className="badge badge-primary" style={{ marginTop: '4px', display: 'inline-block' }}>{user?.role}</span>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={logout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}
