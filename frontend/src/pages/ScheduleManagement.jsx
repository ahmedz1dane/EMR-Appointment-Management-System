import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Plus, Trash2, Save, Copy } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getDefaultDayConfig = (dayIndex) => ({
  day: dayIndex,
  isWorking: dayIndex > 0 && dayIndex < 6, // Mon-Fri default working
  sessions: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '13:00', endTime: '17:00' }],
  breaks: [{ startTime: '12:00', endTime: '13:00' }]
});

export default function ScheduleManagement() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  
  const [schedule, setSchedule] = useState({
    days: Array.from({ length: 7 }).map((_, i) => getDefaultDayConfig(i)),
    slotDuration: 15
  });
  
  const [selectedDay, setSelectedDay] = useState(1); // Monday default
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    axios.get('/api/v1/doctors')
      .then(res => setDoctors(res.data.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedDoctor) return;
    axios.get(`/api/v1/doctors/${selectedDoctor}/schedule`)
      .then(res => {
        if (res.data.success && res.data.data) {
          // ensure all 7 days exist in case of old data
          const fetchedDays = res.data.data.days || [];
          const mergedDays = Array.from({ length: 7 }).map((_, i) => {
            const existing = fetchedDays.find(d => d.day === i);
            return existing || getDefaultDayConfig(i);
          });
          setSchedule({
            days: mergedDays,
            slotDuration: res.data.data.slotDuration || 15
          });
        }
      })
      .catch(() => {
        setSchedule({
          days: Array.from({ length: 7 }).map((_, i) => getDefaultDayConfig(i)),
          slotDuration: 15
        });
      });
  }, [selectedDoctor]);

  const toggleWorkingDay = (dayIndex) => {
    setSchedule(prev => ({
      ...prev,
      days: prev.days.map(d => d.day === dayIndex ? { ...d, isWorking: !d.isWorking } : d)
    }));
  };

  const updateSession = (index, field, value) => {
    setSchedule(prev => {
      const newDays = [...prev.days];
      const dayConfig = newDays.find(d => d.day === selectedDay);
      dayConfig.sessions[index][field] = value;
      return { ...prev, days: newDays };
    });
  };

  const addSession = () => {
    setSchedule(prev => {
      const newDays = [...prev.days];
      const dayConfig = newDays.find(d => d.day === selectedDay);
      dayConfig.sessions.push({ startTime: '09:00', endTime: '12:00' });
      return { ...prev, days: newDays };
    });
  };

  const removeSession = (index) => {
    setSchedule(prev => {
      const newDays = [...prev.days];
      const dayConfig = newDays.find(d => d.day === selectedDay);
      dayConfig.sessions = dayConfig.sessions.filter((_, i) => i !== index);
      return { ...prev, days: newDays };
    });
  };

  const updateBreak = (index, field, value) => {
    setSchedule(prev => {
      const newDays = [...prev.days];
      const dayConfig = newDays.find(d => d.day === selectedDay);
      dayConfig.breaks[index][field] = value;
      return { ...prev, days: newDays };
    });
  };

  const addBreak = () => {
    setSchedule(prev => {
      const newDays = [...prev.days];
      const dayConfig = newDays.find(d => d.day === selectedDay);
      dayConfig.breaks.push({ startTime: '12:00', endTime: '13:00' });
      return { ...prev, days: newDays };
    });
  };

  const removeBreak = (index) => {
    setSchedule(prev => {
      const newDays = [...prev.days];
      const dayConfig = newDays.find(d => d.day === selectedDay);
      dayConfig.breaks = dayConfig.breaks.filter((_, i) => i !== index);
      return { ...prev, days: newDays };
    });
  };
  
  const copyToAllWorkingDays = () => {
    const currentConfig = schedule.days.find(d => d.day === selectedDay);
    setSchedule(prev => ({
      ...prev,
      days: prev.days.map(d => 
        d.isWorking ? { ...d, sessions: JSON.parse(JSON.stringify(currentConfig.sessions)), breaks: JSON.parse(JSON.stringify(currentConfig.breaks)) } : d
      )
    }));
    setMessage({ type: 'success', text: `Copied ${DAYS[selectedDay]}'s schedule to all working days.` });
    setTimeout(() => setMessage(null), 3000);
  };

  const validateSchedule = () => {
    if (!schedule.days.some(d => d.isWorking)) return 'Select at least one working day';
    if (schedule.slotDuration < 5 || schedule.slotDuration > 120) return 'Slot duration must be between 5 and 120 minutes';

    for (const day of schedule.days) {
      if (!day.isWorking) continue;
      
      if (day.sessions.length === 0) return `${DAYS[day.day]} must have at least one session if it's a working day.`;

      for (const session of day.sessions) {
        if (!session.startTime || !session.endTime) return `All session times are required on ${DAYS[day.day]}`;
        if (session.startTime >= session.endTime) return `Session start time must be before end time on ${DAYS[day.day]}`;
      }

      for (const brk of day.breaks) {
        if (!brk.startTime || !brk.endTime) return `All break times are required on ${DAYS[day.day]}`;
        if (brk.startTime >= brk.endTime) return `Break start time must be before end time on ${DAYS[day.day]}`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (!selectedDoctor) {
      setMessage({ type: 'error', text: 'Please select a doctor first' });
      return;
    }

    const error = validateSchedule();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/v1/doctors/${selectedDoctor}/schedule`, {
        days: schedule.days,
        slotDuration: schedule.slotDuration
      });
      setMessage({ type: 'success', text: 'Schedule saved successfully' });
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Failed to save schedule' });
    }
    setLoading(false);
  };

  const activeDayConfig = schedule.days.find(d => d.day === selectedDay);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Doctor Schedule Management</h2>
      </div>

      {message && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{ marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

      <div className="form-group" style={{ maxWidth: '400px', marginBottom: '24px' }}>
        <label className="form-label">Select Doctor</label>
        <select className="form-select" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
          <option value="">-- Choose a Doctor --</option>
          {doctors.map(d => (
            <option key={d._id} value={d._id}>Dr. {d.name} — {d.department}</option>
          ))}
        </select>
      </div>

      {selectedDoctor && (
        <div className="grid-cols-2" style={{ alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>Select Working Days</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {DAYS.map((day, i) => {
                  const isWorking = schedule.days.find(d => d.day === i).isWorking;
                  return (
                    <button
                      key={i}
                      onClick={() => toggleWorkingDay(i)}
                      className={isWorking ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ padding: '8px 16px', fontSize: '0.85rem', flex: '1 1 calc(33% - 8px)' }}
                    >
                      {day} {isWorking && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>Global Settings</h3>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Slot Duration (Minutes)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: '120px' }}
                    min={5}
                    max={120}
                    value={schedule.slotDuration}
                    onChange={e => setSchedule(prev => ({ ...prev, slotDuration: parseInt(e.target.value) || 15 }))}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>minutes</span>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ padding: '14px', fontSize: '1rem', width: '100%' }}>
              {loading ? <div className="loader"></div> : <><Save size={18} /> Save Entire Schedule</>}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3>Configure specific day:</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid var(--bg-glass-border)', marginBottom: '16px' }}>
                {DAYS.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(i)}
                    className={`btn ${selectedDay === i ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.85rem', flexShrink: 0, opacity: schedule.days.find(d => d.day === i).isWorking ? 1 : 0.5 }}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{DAYS[selectedDay]}'s Schedule</h3>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={copyToAllWorkingDays} title="Copy this configuration to all other working days">
                  <Copy size={14} /> Copy to all
                </button>
              </div>

              {!activeDayConfig.isWorking ? (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <p>{DAYS[selectedDay]} is marked as a non-working day.</p>
                  <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => toggleWorkingDay(selectedDay)}>
                    Mark as Working Day
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Sessions</h4>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={addSession}>
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeDayConfig.sessions.map((session, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                          <Clock size={14} color="var(--accent-primary)" />
                          <input type="time" className="form-input" style={{ width: 'auto', flex: 1, padding: '8px' }} value={session.startTime} onChange={e => updateSession(i, 'startTime', e.target.value)} />
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
                          <input type="time" className="form-input" style={{ width: 'auto', flex: 1, padding: '8px' }} value={session.endTime} onChange={e => updateSession(i, 'endTime', e.target.value)} />
                          <button className="btn btn-icon" onClick={() => removeSession(i)} style={{ color: 'var(--danger)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {activeDayConfig.sessions.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>Required: Add at least one session</p>}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Breaks</h4>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={addBreak}>
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeDayConfig.breaks.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No breaks configured.</p>}
                      {activeDayConfig.breaks.map((brk, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)' }}>
                          <Clock size={14} color="var(--warning)" />
                          <input type="time" className="form-input" style={{ width: 'auto', flex: 1, padding: '8px' }} value={brk.startTime} onChange={e => updateBreak(i, 'startTime', e.target.value)} />
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
                          <input type="time" className="form-input" style={{ width: 'auto', flex: 1, padding: '8px' }} value={brk.endTime} onChange={e => updateBreak(i, 'endTime', e.target.value)} />
                          <button className="btn btn-icon" onClick={() => removeBreak(i)} style={{ color: 'var(--danger)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedDoctor && (
        <div className="card flex-center" style={{ padding: '60px', flexDirection: 'column', gap: '16px' }}>
          <Clock size={48} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Select a doctor to configure their schedule</p>
        </div>
      )}
    </div>
  );
}
