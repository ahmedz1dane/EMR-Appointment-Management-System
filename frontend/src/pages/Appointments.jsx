import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, MapPin, Edit2 } from 'lucide-react';
import EditAppointmentModal from '../components/EditAppointmentModal';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    patient: '',
    status: '',
    date: '',
    page: 1,
    limit: 10
  });

  const [editingNotes, setEditingNotes] = useState(null);
  const [notesValue, setNotesValue] = useState('');
  
  const [editingAppointment, setEditingAppointment] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.patient) params.append('patient', filters.patient);
      if (filters.status) params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);
      params.append('page', filters.page);
      params.append('limit', filters.limit);
      params.append('sortBy', 'date');
      params.append('order', 'desc');

      const res = await axios.get(`/api/v1/appointments?${params.toString()}`);
      if (res.data.success) {
        setAppointments(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id, status) => {
    try {
      if (status === 'Arrived') {
        await axios.post(`/api/v1/appointments/${id}/arrive`);
      } else {
        await axios.put(`/api/v1/appointments/${id}`, { status });
      }
      fetchAppointments();
    } catch (e) {
      console.error(e);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await axios.delete(`/api/v1/appointments/${id}`);
      fetchAppointments();
    } catch (e) {
      console.error(e);
    }
  };

  const saveNotes = async (id) => {
    try {
      await axios.put(`/api/v1/appointments/${id}`, { notes: notesValue });
      setEditingNotes(null);
      fetchAppointments();
    } catch (e) {
      console.error(e);
    }
  };

  const statusBadge = (status) => {
    const map = {
      Scheduled: 'badge-primary',
      Arrived: 'badge-warning',
      Completed: 'badge-success',
      Cancelled: 'badge-danger'
    };
    return map[status] || 'badge-primary';
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Appointments</h2>
        <button className="btn btn-secondary" onClick={fetchAppointments}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="form-label">Search Patient</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Name or mobile..."
                value={filters.patient}
                onChange={e => setFilters(prev => ({ ...prev, patient: e.target.value, page: 1 }))}
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0, flex: '0 1 160px' }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}>
              <option value="">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Arrived">Arrived</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, flex: '0 1 180px' }}>
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.date}
              onChange={e => setFilters(prev => ({ ...prev, date: e.target.value, page: 1 }))}
            />
          </div>

          {(filters.patient || filters.status || filters.date) && (
            <button
              className="btn btn-secondary"
              style={{ marginBottom: '0' }}
              onClick={() => setFilters({ patient: '', status: '', date: '', page: 1, limit: 10 })}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex-center" style={{ padding: '60px' }}><div className="loader"></div></div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <Search size={40} color="var(--text-muted)" />
            <p>No appointments found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{app.date}</div>
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{app.time}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{app.patient?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.patient?.mobileNumber}</div>
                      </td>
                      <td>Dr. {app.doctor?.name}</td>
                      <td>{app.department}</td>
                      <td>
                        <span className={`badge ${statusBadge(app.status)}`}>{app.status}</span>
                      </td>
                      <td style={{ maxWidth: '200px' }}>
                        {editingNotes === app._id ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                              value={notesValue}
                              onChange={e => setNotesValue(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && saveNotes(app._id)}
                            />
                            <button className="btn btn-primary" style={{ padding: '6px 10px' }} onClick={() => saveNotes(app._id)}>✓</button>
                          </div>
                        ) : (
                          <div
                            style={{ cursor: 'pointer', color: app.notes ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.9rem' }}
                            onClick={() => { setEditingNotes(app._id); setNotesValue(app.notes || ''); }}
                            title="Click to edit notes"
                          >
                            {app.notes || 'Add notes...'}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {user.role !== 'Doctor' && (
                            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }} onClick={() => setEditingAppointment(app)} title="Edit Appointment">
                              <Edit2 size={14} />
                            </button>
                          )}
                          {user.role !== 'Doctor' && app.status === 'Scheduled' && (
                            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => updateStatus(app._id, 'Arrived')} title="Mark Arrived">
                              <MapPin size={14} />
                            </button>
                          )}
                          {app.status === 'Arrived' && (
                            <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => updateStatus(app._id, 'Completed')} title="Complete">
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {user.role !== 'Doctor' && !['Cancelled', 'Completed'].includes(app.status) && (
                            <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => cancelAppointment(app._id)} title="Cancel">
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--bg-glass-border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px' }}
                  disabled={meta.page <= 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="flex-center" style={{ padding: '0 12px', color: 'var(--text-secondary)' }}>
                  {meta.page} / {meta.totalPages || 1}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px' }}
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSave={() => {
            setEditingAppointment(null);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
}
