import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Search, UserPlus, User, AlertCircle, CheckCircle } from 'lucide-react';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function CustomCalendar({ value, onChange, minDate }) {
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [viewDate, setViewDate] = useState(() => selected || new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const rows = [];
    let day = 1;
    let nextDay = 1;

    for (let week = 0; week < 6; week++) {
      const row = [];
      for (let col = 0; col < 7; col++) {
        const idx = week * 7 + col;
        if (idx < firstDay) {
          row.push({ day: prevDays - firstDay + idx + 1, currentMonth: false });
        } else if (day <= daysInMonth) {
          row.push({ day, currentMonth: true });
          day++;
        } else {
          row.push({ day: nextDay++, currentMonth: false });
        }
      }
      rows.push(row);
      if (day > daysInMonth) break;
    }
    return rows;
  }, [year, month]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isDisabled = (d) => {
    if (!d.currentMonth) return true;
    if (!minDate) return false;
    const date = new Date(year, month, d.day);
    const min = new Date(minDate + 'T00:00:00');
    min.setHours(0, 0, 0, 0);
    return date < min;
  };

  const isSelected = (d) => {
    if (!selected || !d.currentMonth) return false;
    return d.day === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear();
  };

  const isToday = (d) => {
    if (!d.currentMonth) return false;
    const today = new Date();
    return d.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const handleClick = (d) => {
    if (isDisabled(d)) return;
    const m = String(month + 1).padStart(2, '0');
    const dd = String(d.day).padStart(2, '0');
    onChange(`${year}-${m}-${dd}`);
  };

  return (
    <div className="custom-calendar">
      <div className="cal-header">
        <button type="button" className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
        <span className="cal-title">{MONTHS[month]} {year}</span>
        <button type="button" className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
      </div>
      <div className="cal-grid">
        {DAYS_SHORT.map(d => <div key={d} className="cal-day-label">{d}</div>)}
        {calendarDays.flat().map((d, i) => (
          <button
            key={i}
            type="button"
            disabled={isDisabled(d)}
            onClick={() => handleClick(d)}
            className={
              'cal-day' +
              (!d.currentMonth ? ' cal-day-other' : '') +
              (isSelected(d) ? ' cal-day-selected' : '') +
              (isToday(d) ? ' cal-day-today' : '') +
              (isDisabled(d) ? ' cal-day-disabled' : '')
            }
          >
            {d.day}
          </button>
        ))}
      </div>
    </div>
  );
}

function SlotGrid({ slots, selectedSlot, onSelect }) {
  if (slots.length === 0) return null;

  const available = slots.filter(s => !s.isBooked).length;
  const booked = slots.filter(s => s.isBooked).length;

  return (
    <div>
      <div className="slot-summary">
        <span className="slot-summary-item">
          <span className="slot-dot slot-dot-available"></span>
          {available} Available
        </span>
        <span className="slot-summary-item">
          <span className="slot-dot slot-dot-booked"></span>
          {booked} Booked
        </span>
      </div>
      <div className="slot-grid">
        {slots.map((slot, i) => (
          <button
            key={i}
            type="button"
            disabled={slot.isBooked}
            onClick={() => onSelect(slot.time)}
            className={
              'slot-btn' +
              (slot.isBooked ? ' slot-booked' : '') +
              (slot.time === selectedSlot ? ' slot-selected' : '')
            }
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Scheduler() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [patientMode, setPatientMode] = useState('new');
  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({ name: '', mobileNumber: '', gender: '', dob: '' });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get('/api/v1/doctors').then(res => setDoctors(res.data.data)).catch(console.error);
  }, []);

  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    setSlotsError('');
    try {
      const res = await axios.get(`/api/v1/slots?doctorId=${selectedDoctor}&date=${selectedDate}`);
      setSlots(res.data.data || []);
      if (res.data.data?.length === 0) {
        setSlotsError('No slots available for this date. The doctor may not work on this day or has no schedule configured.');
      }
    } catch (err) {
      setSlots([]);
      setSlotsError(err.response?.data?.message || 'Failed to load slots');
    }
    setSlotsLoading(false);
    setSelectedSlot('');
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    if (patientSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/v1/patients/search?q=${encodeURIComponent(patientSearch)}`);
        setSearchResults(res.data.data || []);
      } catch (e) {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [patientSearch]);

  const validate = () => {
    const errs = {};
    if (!selectedDoctor) errs.doctor = 'Please select a doctor';
    if (!selectedDate) errs.date = 'Please select a date';
    if (!selectedSlot) errs.slot = 'Please select a time slot';

    if (patientMode === 'new') {
      if (!newPatient.name.trim()) errs.patientName = 'Patient name is required';
      if (!newPatient.mobileNumber.trim()) errs.patientMobile = 'Mobile number is required';
      if (newPatient.mobileNumber && !/^[0-9]{10}$/.test(newPatient.mobileNumber.trim())) {
        errs.patientMobile = 'Enter a valid 10-digit mobile number';
      }
      if (!newPatient.gender) errs.gender = 'Gender is required';
      if (!newPatient.dob) errs.dob = 'Date of birth is required';
    } else {
      if (!selectedPatient) errs.patient = 'Please search and select a patient';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    const doctorObj = doctors.find(d => d._id === selectedDoctor);

    const payload = {
      doctor: selectedDoctor,
      department: doctorObj.department,
      date: selectedDate,
      time: selectedSlot
    };

    if (patientMode === 'existing' && selectedPatient) {
      payload.patientId = selectedPatient._id;
    } else {
      payload.patientData = {
        name: newPatient.name.trim(),
        mobileNumber: newPatient.mobileNumber.trim(),
        gender: newPatient.gender || undefined,
        dob: newPatient.dob || undefined
      };
    }

    setSubmitting(true);
    try {
      await axios.post('/api/v1/appointments', payload);
      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      setSelectedSlot('');
      setNewPatient({ name: '', mobileNumber: '', gender: '', dob: '' });
      setSelectedPatient(null);
      setPatientSearch('');
      fetchSlots();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Booking failed' });
    }
    setSubmitting(false);
  };

  const selectedDoctorObj = doctors.find(d => d._id === selectedDoctor);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '24px' }}>Appointment Scheduler</h2>

      {message && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="scheduler-layout">
        <div className="scheduler-left">
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Select Doctor</h3>
            <select
              className={`form-select ${errors.doctor ? 'form-error' : ''}`}
              value={selectedDoctor}
              onChange={e => { setSelectedDoctor(e.target.value); setErrors(prev => ({ ...prev, doctor: null })); }}
            >
              <option value="">-- Choose a Doctor --</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>Dr. {d.name} — {d.department}</option>
              ))}
            </select>
            {errors.doctor && <span className="field-error">{errors.doctor}</span>}

            {selectedDoctorObj && (
              <div className="doctor-info-chip">
                <div className="doctor-avatar">{selectedDoctorObj.name[0]}</div>
                <div>
                  <div style={{ fontWeight: 500 }}>Dr. {selectedDoctorObj.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedDoctorObj.department}</div>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Select Date</h3>
            <CustomCalendar value={selectedDate} onChange={(d) => { setSelectedDate(d); setErrors(prev => ({ ...prev, date: null })); }} minDate={todayStr} />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>
        </div>

        <div className="scheduler-center">
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '16px' }}>Available Slots</h3>
            {errors.slot && <span className="field-error" style={{ marginBottom: '12px', display: 'block' }}>{errors.slot}</span>}

            {!selectedDoctor ? (
              <div className="empty-state">
                <p>Select a doctor to view available slots</p>
              </div>
            ) : slotsLoading ? (
              <div className="flex-center" style={{ padding: '40px' }}><div className="loader"></div></div>
            ) : slotsError ? (
              <div className="empty-state">
                <AlertCircle size={32} color="var(--text-muted)" />
                <p>{slotsError}</p>
              </div>
            ) : (
              <SlotGrid slots={slots} selectedSlot={selectedSlot} onSelect={(t) => { setSelectedSlot(t); setErrors(prev => ({ ...prev, slot: null })); }} />
            )}
          </div>
        </div>

        <div className="scheduler-right">
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Patient Information</h3>

            <div className="patient-mode-tabs">
              <button
                type="button"
                className={`patient-mode-tab ${patientMode === 'new' ? 'active' : ''}`}
                onClick={() => { setPatientMode('new'); setSelectedPatient(null); setErrors(prev => ({ ...prev, patient: null })); }}
              >
                <UserPlus size={16} /> New Patient
              </button>
              <button
                type="button"
                className={`patient-mode-tab ${patientMode === 'existing' ? 'active' : ''}`}
                onClick={() => { setPatientMode('existing'); setErrors(prev => ({ ...prev, patientName: null, patientMobile: null })); }}
              >
                <Search size={16} /> Existing Patient
              </button>
            </div>

            <form onSubmit={handleBook}>
              {patientMode === 'existing' ? (
                <div>
                  <div className="form-group">
                    <label className="form-label">Search Patient</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className={`form-input ${errors.patient ? 'form-error' : ''}`}
                        placeholder="Name or mobile number..."
                        value={patientSearch}
                        onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
                      />
                      {searchResults.length > 0 && !selectedPatient && (
                        <div className="search-dropdown">
                          {searchResults.map(p => (
                            <button
                              key={p._id}
                              type="button"
                              className="search-dropdown-item"
                              onClick={() => { setSelectedPatient(p); setPatientSearch(p.name); setSearchResults([]); setErrors(prev => ({ ...prev, patient: null })); }}
                            >
                              <User size={16} />
                              <div>
                                <div>{p.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.mobileNumber}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.patient && <span className="field-error">{errors.patient}</span>}
                  </div>

                  {selectedPatient && (
                    <div className="selected-patient-chip">
                      <User size={16} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{selectedPatient.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedPatient.mobileNumber}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="form-group">
                    <label className="form-label">Full Name <span style={{color:'var(--danger)'}}>*</span></label>
                    <input
                      type="text"
                      className={`form-input ${errors.patientName ? 'form-error' : ''}`}
                      value={newPatient.name}
                      onChange={e => { setNewPatient({ ...newPatient, name: e.target.value }); setErrors(prev => ({ ...prev, patientName: null })); }}
                    />
                    {errors.patientName && <span className="field-error">{errors.patientName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number <span style={{color:'var(--danger)'}}>*</span></label>
                    <input
                      type="tel"
                      className={`form-input ${errors.patientMobile ? 'form-error' : ''}`}
                      placeholder="10-digit number"
                      maxLength={10}
                      value={newPatient.mobileNumber}
                      onChange={e => { setNewPatient({ ...newPatient, mobileNumber: e.target.value.replace(/\D/g, '') }); setErrors(prev => ({ ...prev, patientMobile: null })); }}
                    />
                    {errors.patientMobile && <span className="field-error">{errors.patientMobile}</span>}
                  </div>

                  <div className="grid-cols-2" style={{ gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Gender <span style={{color:'var(--danger)'}}>*</span></label>
                      <select className={`form-select ${errors.gender ? 'form-error' : ''}`} value={newPatient.gender} onChange={e => { setNewPatient({ ...newPatient, gender: e.target.value }); setErrors(prev => ({ ...prev, gender: null })); }}>
                        <option value="">-- Select --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && <span className="field-error">{errors.gender}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of Birth <span style={{color:'var(--danger)'}}>*</span></label>
                      <input type="date" className={`form-input ${errors.dob ? 'form-error' : ''}`} value={newPatient.dob} onChange={e => { setNewPatient({ ...newPatient, dob: e.target.value }); setErrors(prev => ({ ...prev, dob: null })); }} max={todayStr} />
                      {errors.dob && <span className="field-error">{errors.dob}</span>}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(59,130,246,0.05)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Booking Summary</strong>
                <div style={{ marginTop: '8px' }}>
                  <div>Doctor: {selectedDoctorObj ? `Dr. ${selectedDoctorObj.name}` : '—'}</div>
                  <div>Date: {selectedDate || '—'}</div>
                  <div>Time: {selectedSlot || '—'}</div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px', padding: '14px' }}
                disabled={submitting}
              >
                {submitting ? <div className="loader"></div> : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
