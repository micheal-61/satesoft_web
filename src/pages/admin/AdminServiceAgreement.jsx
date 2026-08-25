import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const DEFAULT_SERVICE_AGREEMENT_SECTIONS = [
  { id: 'sec-1', sort_order: 0, title: '0. Introduction', text: 'These Terms and Conditions ("Terms") govern your access to and use of the digital products, platforms, applications, websites, and support services provided by Satesoft Corporation Limited and its subsidiaries (collectively, "Satesoft," "we," "us," or "our"). By creating an account, downloading any Satesoft application, or continuing to use the Services after notification of any change to these Terms, you agree to be bound by them.', badge: null },
  { id: 'sec-2', sort_order: 1, title: '1. Your Privacy', text: 'Your privacy is important to us. Please read the Satesoft Privacy Statement carefully, as it describes how we collect, use, and protect your personal data.', badge: 'COLLAPSIBLE' },
  { id: 'sec-3', sort_order: 2, title: '2. Your Content', text: 'Many of our Services allow you to store or share your Content or receive material from others. Please review the terms below to understand how we handle your content and intellectual property rights.', badge: 'COLLAPSIBLE' },
  { id: 'sec-4', sort_order: 3, title: '3. Code of Conduct', text: 'You are responsible for your conduct and content when accessing or using the Services. You agree to use the Services in compliance with all applicable laws and these Terms.', badge: 'COLLAPSIBLE' },
  { id: 'sec-5', sort_order: 4, title: '4. Using the Services & Support', text: 'Satesoft grants you a limited, non-exclusive, non-transferable license to access the Services subject to compliance with these Terms and applicable documentation.', badge: 'COLLAPSIBLE' },
  { id: 'sec-6', sort_order: 5, title: '5. Using Third-Party Apps and Services', text: 'The Services may allow you to access or acquire products, services, websites, or apps from independent third parties. Your use of such third-party services may be subject to their own terms and policies.', badge: 'COLLAPSIBLE' },
  { id: 'sec-7', sort_order: 6, title: '6. Service Availability', text: 'We strive to keep the Services up and running; however, all online services suffer occasional disruptions. Satesoft does not guarantee uninterrupted access to the Services.', badge: 'COLLAPSIBLE' },
  { id: 'sec-8', sort_order: 7, title: '7. Software License', text: 'Unless accompanied by a separate license agreement, any software provided by us is subject to these terms. All software, code, interfaces, and branding components remain the exclusive intellectual property of Satesoft Corporation Limited.', badge: 'COLLAPSIBLE' },
  { id: 'sec-9', sort_order: 8, title: '8. Payment Terms', text: 'If you purchase a Service, you agree to pay all applicable fees and taxes. All payments are non-refundable unless explicitly stated in these Terms or by applicable law.', badge: 'COLLAPSIBLE' },
  { id: 'sec-10', sort_order: 9, title: '9. Contracting Entity, Choice of Law & Location for Resolving Disputes', text: 'These terms are governed by the laws of Uganda without regard to conflict of law principles. Contracts are entered into with Satesoft Corporation Limited.', badge: 'COLLAPSIBLE' },
  { id: 'sec-11', sort_order: 10, title: '10. Warranties', text: 'Satesoft and our affiliates make no warranties, express or implied, with respect to the services. The services are provided on an "as is" and "as available" basis.', badge: 'COLLAPSIBLE' },
  { id: 'sec-12', sort_order: 11, title: '11. Limitation of Liability', text: 'If you have any basis for recovering damages, you can recover from Satesoft only direct damages up to the amount you paid for the Services in the month prior to the event giving rise to the liability.', badge: 'COLLAPSIBLE' },
  { id: 'sec-13', sort_order: 12, title: '12. Service-Specific Terms', text: 'The terms before and after section 12 apply generally to all Services. Additional service-specific terms may apply to particular products as described in the relevant documentation.', badge: 'COLLAPSIBLE' },
  { id: 'sec-14', sort_order: 13, title: '13. Mediation and Dispute Resolution', text: 'In the event of any controversy or claim arising out of or relating to this contract, the parties agree to attempt resolution through mediation before pursuing litigation.', badge: 'COLLAPSIBLE' },
  { id: 'sec-15', sort_order: 14, title: '14. Miscellaneous', text: 'This agreement constitutes the entire agreement between you and Satesoft regarding your use of the Services. If any provision is deemed unenforceable, the remaining provisions shall continue in full force and effect.', badge: 'COLLAPSIBLE' },
  { id: 'sec-16', sort_order: 15, title: '15. Export Laws', text: 'You must comply with all domestic and international export laws and regulations, including but not limited to any restrictions on the export of technology or software.', badge: 'COLLAPSIBLE' },
  { id: 'sec-17', sort_order: 16, title: '16. Reservation of Rights and Feedback', text: 'Satesoft reserves all rights not expressly granted under these Terms. Any feedback you provide is voluntary and may be used by Satesoft without obligation.', badge: 'COLLAPSIBLE' },
  { id: 'sec-18', sort_order: 17, title: '17. Covered Services', text: 'The following products, apps, and services are covered by this Agreement. Additional products may be added from time to time and will be subject to these Terms unless accompanied by a separate agreement.', badge: 'COLLAPSIBLE' }
];

const AdminServiceAgreement = () => {
  const [sections, setSections] = useState(DEFAULT_SERVICE_AGREEMENT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('1');
  const [expandedSections, setExpandedSections] = useState({ 1: true });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({ sort_order: '', title: '', badge: '', text: '' });

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/legal/service-agreement/sections');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setSections(response.data);
      } else {
        setSections(DEFAULT_SERVICE_AGREEMENT_SECTIONS);
      }
    } catch (err) {
      setError(err.message);
      setSections(DEFAULT_SERVICE_AGREEMENT_SECTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const sortedSections = [...sections].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

  const filteredSections = sortedSections.filter(
    (sec) =>
      sec.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSectionNumber = (num, idx) => {
    return `${idx + 1}.`;
  };

  const cleanTitle = (rawTitle) => {
    if (!rawTitle) return '';
    return String(rawTitle).replace(/^\d+\.\s*/, '').trim();
  };

  const handleOpenAddModal = () => {
    setEditingSection(null);
    setFormData({ sort_order: '', title: '', badge: '', text: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sec) => {
    setEditingSection(sec);
    setFormData({
      sort_order: sec.sort_order ?? '',
      title: sec.title || '',
      badge: sec.badge || '',
      text: sec.text || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title?.trim() || !formData.text?.trim()) {
      alert('Please provide both a Section Title and Content.');
      return;
    }

    const payload = {
      sort_order: formData.sort_order ? Number(formData.sort_order) : undefined,
      title: formData.title.trim(),
      badge: formData.badge.trim(),
      text: formData.text.trim()
    };

    try {
      if (editingSection) {
        await api.put(`/legal/service-agreement/sections/${editingSection.id}`, payload);
      } else {
        await api.post('/legal/service-agreement/section', payload);
      }

      const res = await api.get('/legal/service-agreement/sections');
      if (res.data && Array.isArray(res.data)) {
        setSections(res.data);
      }

      setFormData({ sort_order: '', title: '', badge: '', text: '' });
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
      await api.delete(`/legal/service-agreement/sections/${id}`);
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '15px', borderBottom: '1px solid #e9ecef', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ color: '#6bb200', fontSize: '1.6rem', fontWeight: '700', margin: '0 0 2px 0' }}>
            Satesoft Service Agreement
          </h2>
          <p style={{ color: '#6bb200', fontSize: '0.92rem', fontStyle: 'italic', fontWeight: '600', margin: '0 0 4px 0' }}>
            Terms &amp; Conditions &amp; Comprehensive Legal Framework
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
            onClick={handleOpenAddModal}
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
        <div className="w-full lg:w-1/4 shrink-0">
          <div className="sticky top-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Table of Contents
            </h3>

            <nav className="space-y-1">
              {sortedSections.map((sec, idx) => (
                <a
                  key={sec.id}
                  href={`#sec-${sec.sort_order}`}
                  onClick={() => setActiveSectionId(String(sec.sort_order))}
                  className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-[#70B312] shrink-0">
                    {idx + 1}.
                  </span>
                  <span className="truncate">{cleanTitle(sec.title)}</span>
                </a>
              ))}
            </nav>
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
              const isExpanded = expandedSections[sec.sort_order];
              const sectionLabel = formatSectionNumber(sec.sort_order, idx);

              return (
                <div key={sec.id} id={`sec-${sec.sort_order}`} style={{ paddingBottom: '12px', borderBottom: '1px solid #e9ecef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h5 style={{ color: '#6bb200', fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>
                      {sectionLabel} {cleanTitle(sec.title)}
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
                        {sec.text}
                      </p>
                      <button
                        className="btn btn-link p-0 text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                        style={{ color: '#6bb200', fontSize: '0.8rem' }}
                        onClick={() => toggleExpand(sec.sort_order)}
                      >
                        <i className="bi bi-x-circle"></i> Show Less
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: '#6c757d', fontSize: '0.85rem', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sec.text?.slice(0, 100)}...
                      </p>
                      <button
                        className="btn btn-link p-0 text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                        style={{ color: '#6bb200', fontSize: '0.8rem' }}
                        onClick={() => toggleExpand(sec.sort_order)}
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

            <form onSubmit={handleSaveSection}>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="text"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
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
                    Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. COLLAPSIBLE or leave empty"
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-[#70B312] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Section Content
                  </label>
                  <textarea
                    rows={6}
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
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
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#93cf3b] hover:bg-[#70B312] rounded-xl transition-colors shadow-sm uppercase tracking-wide"
                >
                  {editingSection ? 'Update Section' : '+ ADD SECTION'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceAgreement;
