import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    contact_name: '',
    contact_email: '',
    status: 'ACTIVE',
    description: '',
    joined_date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchPartners = async () => {
    try {
      const res = await api.get('/partners');
      setPartners(res.data || []);
    } catch (err) {
      console.error('Failed to load partners:', err);
      setErrorMsg('Failed to load partner list from backend.');
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (editingId) {
        await api.put(`/partners/${editingId}`, formData);
        setSuccessMsg('Partner updated successfully!');
      } else {
        await api.post('/partners', formData);
        setSuccessMsg('Partner added successfully!');
      }

      setFormData({
        name: '',
        industry: '',
        location: '',
        contact_name: '',
        contact_email: '',
        status: 'ACTIVE',
        description: ''
      });
      setEditingId(null);
      await fetchPartners();
    } catch (err) {
      console.error('Form submission error:', err);
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Server error: Failed to save partner data.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (partner) => {
    setEditingId(partner.id);
    setFormData({
      name: partner.name || '',
      industry: partner.industry || '',
      location: partner.location || '',
      contact_name: partner.contact_name || '',
      contact_email: partner.contact_email || '',
      status: partner.status || 'ACTIVE',
      description: partner.description || '',
      joined_date: partner.joined || new Date().toISOString().split('T')[0]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      industry: '',
      location: '',
      contact_name: '',
      contact_email: '',
      status: 'ACTIVE',
      description: '',
      joined_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete partner #${id}?`)) return;
    try {
      await api.delete(`/partners/${id}`);
      setSuccessMsg('Partner deleted successfully.');
      fetchPartners();
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMsg('Failed to delete partner.');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Partner Management</h1>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {editingId ? `Editing Partner #${editingId}` : 'Add New Partner'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Partner Name *</label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#70B312]"
              placeholder="e.g. Othieno Innocent"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Industry Sector</label>
            <input
              type="text"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#70B312]"
              placeholder="e.g. Education / Schools"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
            <input
              type="text"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#70B312]"
              placeholder="e.g. Kampala, Uganda"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Contact Name / Phone</label>
            <input
              type="text"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#70B312]"
              placeholder="e.g. 0706920866"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Contact Email *</label>
            <input
              type="email"
              required
              className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#70B312]"
              placeholder="othienoinnocent21@gmail.com"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
            <select
              className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#70B312]"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Partner Registration Date / Joined Date</label>
            <input
              type="date"
              value={formData.joined_date || ''}
              onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#70B312] bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1">Overview Description</label>
            <textarea
              className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#70B312]"
              rows="3"
              placeholder="Short description shown on the public partner detail page..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#70B312] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-[#5c940f] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : editingId ? 'Update Partner Details' : 'Add Partner'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Industry</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {partners.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                  No partners found.
                </td>
              </tr>
            ) : (
              partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                  <td className="px-6 py-3 font-mono text-slate-500">#{partner.id}</td>
                  <td className="px-6 py-3 font-semibold text-slate-800">{partner.name}</td>
                  <td className="px-6 py-3 text-slate-600">{partner.industry || 'General'}</td>
                  <td className="px-6 py-3 text-slate-600">{partner.location || 'N/A'}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      partner.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(partner)}
                      className="text-[#70B312] hover:text-[#5c940f] font-semibold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
