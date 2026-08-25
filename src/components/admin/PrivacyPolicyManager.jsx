import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const API_URL = 'http://localhost:3001/api';

const INITIAL_PRIVACY_SECTIONS = [
  {
    id: 'sec-0',
    section_number: '0',
    title: '0. Introduction',
    content: `Satesoft Corporation Limited ("Satesoft," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our platforms (including Duqact, Karibyshoo, and FoundDocument), or engage with our services.`,
    section_order: 1,
  },
  {
    id: 'sec-1',
    section_number: '1',
    title: '1. Information We Collect',
    content: `We collect information that identifies, relates to, describes, or is reasonably capable of being associated with you ("Personal Data"). This includes:\n• Personal Details: Name, email address, phone number, job title, and company name.\n• Account Credentials: Passwords, authentication tokens, and user profile preferences.\n• Usage & Device Data: IP addresses, browser types, operating systems, device identifiers, and access timestamps.`,
    section_order: 2,
  },
  {
    id: 'sec-2',
    section_number: '2',
    title: '2. How We Use Your Information',
    content: `We process your data to provide, maintain, and improve our services, communicate system updates, process transactions, prevent fraud, and comply with legal and regulatory requirements.`,
    section_order: 3,
  },
  {
    id: 'sec-3',
    section_number: '3',
    title: '3. Data Sharing and Disclosure',
    content: `We do not sell your personal data. We may share information with trusted third-party service providers (such as cloud hosting and payment processors), legal authorities when required by law, or in connection with a corporate reorganization or acquisition.`,
    section_order: 4,
  },
  {
    id: 'sec-4',
    section_number: '4',
    title: '4. Data Security',
    content: `We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your personal data from unauthorized access, alteration, or disclosure.`,
    section_order: 5,
  },
  {
    id: 'sec-5',
    section_number: '5',
    title: '5. Data Retention',
    content: `We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements.`,
    section_order: 6,
  },
  {
    id: 'sec-6',
    section_number: '6',
    title: '6. Your Rights and Choices',
    content: `Depending on your jurisdiction, you have rights regarding your personal data, including the right to request access, correction, erasure, data portability, and restriction or objection to processing. To exercise these rights, contact our Data Protection Office at privacy@satesoft.com.`,
    section_order: 7,
  },
  {
    id: 'sec-7',
    section_number: '7',
    title: '7. Cookies and Tracking Technologies',
    content: `Our platforms use essential cookies for session management and security. Analytical or performance cookies are used only with your consent to analyze site usage and enhance user experience.`,
    section_order: 8,
  },
  {
    id: 'sec-8',
    section_number: '8',
    title: '8. Third-Party Services',
    content: `Our platforms may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party services you engage with.`,
    section_order: 9,
  },
  {
    id: 'sec-9',
    section_number: '9',
    title: '9. International Data Transfers',
    content: `Your information may be transferred to and maintained on computers located outside of your jurisdiction, where data protection laws may differ. We ensure appropriate safeguards are in place for such transfers.`,
    section_order: 10,
  },
  {
    id: 'sec-10',
    section_number: '10',
    title: '10. Changes to This Policy',
    content: `We may revise this Privacy Policy periodically to reflect changes in our legal obligations or operational practices. The updated version will be indicated by an updated "Effective Date" at the top of the policy.`,
    section_order: 11,
  },
  {
    id: 'sec-11',
    section_number: '11',
    title: '11. Contact Us',
    content: `If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:\n\nSatesoft Corporation Limited\nEmail: privacy@satesoft.com\nPhone: +256 700 000 000\nAddress: Kampala, Uganda`,
    section_order: 12,
  },
];

const PrivacyPolicyManager = () => {
  const [sections, setSections] = useState(INITIAL_PRIVACY_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('0');
  const [expandedSections, setExpandedSections] = useState({ 0: true });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const token = localStorage.getItem('cms_auth_token');

  const apiFetch = async (endpoint, options = {}) => {
    const response = await fetch(API_URL + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return response.json();
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/privacy-policy');
      if (Array.isArray(data) && data.length > 0) {
        setSections(data);
      } else {
        setSections(INITIAL_PRIVACY_SECTIONS);
      }
    } catch (err) {
      setError(err.message);
      setSections(INITIAL_PRIVACY_SECTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const sortedSections = [...sections].sort((a, b) => Number(a.section_number) - Number(b.section_number));

  const filteredSections = sortedSections.filter(
    (sec) =>
      sec.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSectionNumber = (num, idx) => {
    if (num !== undefined && num !== null && num !== '') {
      const cleanNum = String(num).replace(/^\.|\.$/g, '');
      return `${cleanNum}.`;
    }
    return `${idx + 1}.`;
  };

  const handleOpenAddModal = () => {
    console.log('Opening Add Section Modal');
    setEditingSection(null);
    setFormData({ title: '', content: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sec) => {
    console.log('Opening Edit Section Modal for:', sec);
    setEditingSection(sec);
    setFormData({
      number: sec.section_number || '',
      title: sec.title || '',
      content: sec.content || sec.text || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title?.trim() || !formData.content?.trim()) {
      alert('Please provide both a Section Title and Content.');
      return;
    }

    const cleanNumber = formData.number ? String(formData.number).replace(/^\.|\.$/g, '').trim() : '';

    const payload = {
      section_number: cleanNumber,
      title: formData.title.trim(),
      content: formData.content.trim(),
      section_order: editingSection ? (editingSection.section_order || 0) : sections.length + 1
    };

    console.log('Sending section payload to API:', payload);

    try {
      if (editingSection) {
        await api.put(`/admin/privacy-policy/${editingSection.id}`, payload);
      } else {
        await api.post('/admin/privacy-policy', payload);
      }

      const res = await api.get('/privacy-policy');
      if (res.data && Array.isArray(res.data)) {
        setSections(res.data);
      }

      setFormData({ number: '', title: '', content: '' });
      setEditingSection(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create/update section:', error.response?.data || error.message);
      alert(`Failed to save section: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this section?')) return;
    try {
      await apiFetch(`/admin/privacy-policy/${id}`, { method: 'DELETE' });
      setSections(sections.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleExpand = (num) => {
    setExpandedSections((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  return (
    <div style={{ width: '100%', minWidth: '100%', padding: '15px 20px', backgroundColor: '#fff' }}>
      <style>{`
        .toc-scroller::-webkit-scrollbar { width: 5px; }
        .toc-scroller::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .toc-scroller::-webkit-scrollbar-thumb { background: #6bb200; border-radius: 4px; }
        .toc-scroller::-webkit-scrollbar-thumb:hover { background: #4a8200; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '15px', borderBottom: '1px solid #e9ecef', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ color: '#6bb200', fontSize: '1.6rem', fontWeight: '700', margin: '0 0 2px 0' }}>
            Satesoft Privacy Policy
          </h2>
          <p style={{ color: '#6bb200', fontSize: '0.92rem', fontStyle: 'italic', fontWeight: '600', margin: '0 0 4px 0' }}>
            Data Protection & Comprehensive Legal Framework
          </p>
          <div style={{ color: '#6c757d', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>
            EFFECTIVE: 01.04.2025 &nbsp;&nbsp;•&nbsp;&nbsp; VERSION 1.0.0
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 sm:w-64 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#70B312]"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setEditingSection(null);
              setFormData({ title: '', content: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#70B312] hover:bg-[#5a9e0e] px-3.5 py-2 rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer uppercase tracking-wide"
          >
            <span className="text-sm font-bold">+</span>
            <span>Add Section</span>
          </button>
          <button
            className="btn btn-sm text-white px-2 shadow-sm d-inline-flex align-items-center gap-1"
            style={{ backgroundColor: '#6bb200', fontWeight: '600', fontSize: '0.8rem', height: '29px' }}
            onClick={() => window.print()}
          >
            <i className="bi bi-printer"></i> Print
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', width: '100%' }}>
        <div style={{ width: '250px', minWidth: '250px', flexShrink: 0, borderRight: '1px solid #e9ecef', paddingRight: '10px' }}>
          <h6 style={{ color: '#6c757d', textTransform: 'uppercase', fontWeight: '700', fontSize: '0.72rem', marginBottom: '8px' }}>
            TABLE OF CONTENTS
          </h6>

          <div
            className="toc-scroller"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              maxHeight: '440px',
              overflowY: 'scroll',
              paddingRight: '6px',
            }}
          >
            {sortedSections.map((sec, idx) => {
              const cleanTitle = (sec.title || '').replace(/^\d+\.?\s*/, '');
              const isActive = activeSectionId === String(sec.section_number);
              const sectionLabel = formatSectionNumber(sec.section_number, idx);
              return (
                <a
                  key={sec.id}
                  href={`#sec-${sec.section_number}`}
                  onClick={() => setActiveSectionId(String(sec.section_number))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    backgroundColor: isActive ? '#e8f5e9' : 'transparent',
                    color: isActive ? '#6bb200' : '#495057',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.82rem',
                    display: 'block',
                  }}
                >
                  {sectionLabel} {cleanTitle}
                </a>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              maxHeight: '440px',
              overflowY: 'auto',
              paddingRight: '10px',
            }}
          >
            {filteredSections.map((sec, idx) => {
              const isExpanded = expandedSections[sec.section_number];
              const cleanTitle = (sec.title || '').replace(/^\d+\.?\s*/, '');
              const sectionLabel = formatSectionNumber(sec.section_number, idx);

              return (
                <div key={sec.id} id={`sec-${sec.section_number}`} style={{ paddingBottom: '12px', borderBottom: '1px solid #e9ecef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h5 style={{ color: '#6bb200', fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>
                      {sectionLabel} {cleanTitle}
                    </h5>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-sm btn-link p-0 text-decoration-none text-secondary"
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => handleOpenEditModal(sec)}
                        title="Edit Section"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-link p-0 text-decoration-none text-danger"
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => handleDelete(sec.id)}
                        title="Delete Section"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div>
                      <p style={{ color: '#212529', lineHeight: '1.5', fontSize: '0.88rem', whiteSpace: 'pre-line', margin: '0 0 6px 0' }}>
                        {sec.content}
                      </p>
                      <button
                        className="btn btn-link p-0 text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                        style={{ color: '#6bb200', fontSize: '0.8rem' }}
                        onClick={() => toggleExpand(sec.section_number)}
                      >
                        <i className="bi bi-x-circle"></i> Show Less
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: '#6c757d', fontSize: '0.85rem', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sec.content?.slice(0, 100)}...
                      </p>
                      <button
                        className="btn btn-link p-0 text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                        style={{ color: '#6bb200', fontSize: '0.8rem' }}
                        onClick={() => toggleExpand(sec.section_number)}
                      >
                        <i className="bi bi-plus-circle"></i> Show More
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ textAlign: 'center', paddingTop: '15px' }}>
              <p style={{ color: '#6c757d', fontSize: '0.78rem', margin: '0 0 2px 0' }}>
                Confidential — Satesoft Corporation Limited
              </p>
              <p style={{ color: '#6bb200', fontSize: '0.82rem', fontWeight: '700', margin: 0 }}>
                Satesoft Corporation Limited — Your Innovation Partner
              </p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">

            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Section Number
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="e.g. 13"
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-[#70B312] transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Section Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 21. New Section"
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-[#70B312] transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Section Content (optional)
                </label>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter section body text..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-[#70B312] transition-colors leading-relaxed"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSection}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#93cf3b] hover:bg-[#70B312] rounded-xl transition-colors shadow-sm uppercase tracking-wide"
              >
                {editingSection ? 'Update Section' : '+ ADD SECTION'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicyManager;
