import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { X, Calendar as CalIcon } from 'lucide-react';

export default function EditAppointmentModal({ appointment, onClose, onSave }) {
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);
  const [status, setStatus] = useState(appointment.status);
  
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    axios.get(`/api/v1/slots?doctorId=${appointment.doctor._id}&date=${date}`)
      .then(res => {
        // If the current appointment is on this date, we should treat its current time slot as available
        const fetchedSlots = res.data.data || [];
        const slotsWithCurrentAvailable = fetchedSlots.map(s => {
          if (s.time === appointment.time && date === appointment.date) {
            return { ...s, isBooked: false };
          }
          return s;
        });
        setSlots(slotsWithCurrentAvailable);
      })
      .catch(err => {
        setSlots([]);
        setError(err.response?.data?.message || 'Failed to fetch slots');
      })
      .finally(() => setLoadingSlots(false));
  }, [date, appointment.doctor._id, appointment.time, appointment.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await axios.put(`/api/v1/appointments/${appointment._id}`, { date, time, status });
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment');
      setSaving(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative', maxHeight: '100%', overflowY: 'auto' }}>
        <button className="btn-icon" onClick={onClose} style={{ position: 'absolute', right: '16px', top: '16px', background: 'rgba(255,255,255,0.05)' }}>
          <X size={20} />
        </button>
        
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalIcon size={20} color="var(--accent-primary)" />
          Edit Appointment
        </h3>

        {error && <div className="alert alert-danger" style={{ padding: '12px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Patient</label>
            <input type="text" className="form-input" value={`${appointment.patient?.name} (${appointment.patient?.mobileNumber})`} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Doctor</label>
            <input type="text" className="form-input" value={`Dr. ${appointment.doctor?.name}`} disabled />
          </div>

          <div className="grid-cols-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" min={todayStr} value={date} onChange={e => { setDate(e.target.value); setTime(''); }} required />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)} required>
                <option value="Scheduled">Scheduled</option>
                <option value="Arrived">Arrived</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Time Slot</label>
            {loadingSlots ? (
              <div style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading slots...</div>
            ) : slots.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--danger)' }}>No slots available for this date.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                {slots.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={s.isBooked && s.time !== appointment.time}
                    onClick={() => setTime(s.time)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid ' + (s.time === time ? 'var(--accent-primary)' : 'var(--bg-glass-border)'),
                      background: s.time === time ? 'var(--accent-primary)' : s.isBooked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.04)',
                      color: s.time === time ? '#fff' : s.isBooked ? 'var(--danger)' : 'var(--text-primary)',
                      cursor: s.isBooked && s.time !== appointment.time ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving || !time || !date}>
              {saving ? <div className="loader"></div> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
