import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

export default function StaffManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Doctor', department: '' });
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/v1/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/v1/users', formData);
      setMessage({ type: 'success', text: res.data.message });
      setFormData({ name: '', email: '', password: '', role: 'Doctor', department: '' });
      fetchUsers();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Error creating user' });
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '24px' }}>Staff Management</h2>
      
      <div className="grid-cols-2">
        <div className="card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="var(--accent-primary)" />
            Create New Staff
          </h3>
          
          {message && (
            <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input type="password" className="form-input" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
              </select>
            </div>
            
            {formData.role === 'Doctor' && (
              <div className="form-group">
                <label className="form-label">Department</label>
                <input type="text" className="form-input" required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              </div>
            )}
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? <div className="loader"></div> : 'Create Staff Member'}
            </button>
          </form>
        </div>

        <div className="card" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          <h3 style={{ marginBottom: '16px' }}>Existing Staff</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td><span className={`badge ${u.role === 'Doctor' ? 'badge-primary' : 'badge-warning'}`}>{u.role}</span></td>
                  <td>{u.department || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
