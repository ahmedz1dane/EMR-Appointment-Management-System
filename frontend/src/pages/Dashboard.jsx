import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Activity, Users, Calendar, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, today: 0, arrived: 0, completed: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      axios.get('/api/v1/appointments?limit=100'),
      axios.get(`/api/v1/appointments?date=${today}&limit=50`)
    ]).then(([allRes, todayRes]) => {
      const all = allRes.data.data || [];
      const todayApps = todayRes.data.data || [];

      setStats({
        total: allRes.data.meta?.total || all.length,
        today: todayRes.data.meta?.total || todayApps.length,
        arrived: todayApps.filter(a => a.status === 'Arrived').length,
        completed: todayApps.filter(a => a.status === 'Completed').length
      });

      setRecentAppointments(all.slice(0, 5));
    }).catch(console.error);
  }, []);

  const statusBadge = (status) => {
    const map = {
      Scheduled: 'badge-primary',
      Arrived: 'badge-warning',
      Completed: 'badge-success',
      Cancelled: 'badge-danger'
    };
    return map[status] || 'badge-primary';
  };

  const cards = [
    { title: 'Total Appointments', value: stats.total, icon: <Calendar size={22} color="var(--accent-primary)" />, color: 'var(--accent-primary)' },
    { title: 'Today\'s Appointments', value: stats.today, icon: <TrendingUp size={22} color="var(--success)" />, color: 'var(--success)' },
    { title: 'Patients Arrived', value: stats.arrived, icon: <Users size={22} color="var(--warning)" />, color: 'var(--warning)' },
    { title: 'Completed Today', value: stats.completed, icon: <Activity size={22} color="#a78bfa" />, color: '#a78bfa' },
  ];

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '8px' }}>Welcome back, {user?.name}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Here is what's happening today — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="grid-cols-4" style={{ marginBottom: '32px' }}>
        {cards.map((card, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="btn-icon" style={{ background: `${card.color}22` }}>
                {card.icon}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', marginBottom: '4px' }}>{card.value}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Recent Appointments</h3>
        {recentAppointments.length === 0 ? (
          <div className="empty-state">
            <Clock size={36} color="var(--text-muted)" />
            <p>No appointments yet. Use the Scheduler to book one.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map(app => (
                  <tr key={app._id}>
                    <td>
                      <span style={{ fontWeight: 500 }}>{app.date}</span>
                      <span style={{ color: 'var(--accent-primary)', marginLeft: '8px' }}>{app.time}</span>
                    </td>
                    <td>{app.patient?.name}</td>
                    <td>Dr. {app.doctor?.name}</td>
                    <td><span className={`badge ${statusBadge(app.status)}`}>{app.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
