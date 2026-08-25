import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const DEFAULT_SERVICE_AGREEMENT_SECTIONS = [
  { id: 'sec-1', sort_order: 0, title: '0. Introduction', text: 'These Terms and Conditions ("Terms") govern your access to and use of the digital products, platforms, applications, websites, and support services provided by Satesoft Corporation Limited and its subsidiaries (collectively, "Satesoft," "we," "us," or "our"). By creating an account, downloading any Satesoft application, or continuing to use the Services after notification of any change to these Terms, you agree to be bound by them.' },
  { id: 'sec-2', sort_order: 1, title: '1. Your Privacy', text: 'Your privacy is important to us. Please read the Satesoft Privacy Statement carefully, as it describes how we collect, use, and protect your personal data.' },
  { id: 'sec-3', sort_order: 2, title: '2. Your Content', text: 'Many of our Services allow you to store or share your Content or receive material from others. Please review the terms below to understand how we handle your content and intellectual property rights.' },
  { id: 'sec-4', sort_order: 3, title: '3. Code of Conduct', text: 'You are responsible for your conduct and content when accessing or using the Services. You agree to use the Services in compliance with all applicable laws and these Terms.' },
  { id: 'sec-5', sort_order: 4, title: '4. Using the Services & Support', text: 'Satesoft grants you a limited, non-exclusive, non-transferable license to access the Services subject to compliance with these Terms and applicable documentation.' },
  { id: 'sec-6', sort_order: 5, title: '5. Using Third-Party Apps and Services', text: 'The Services may allow you to access or acquire products, services, websites, or apps from independent third parties. Your use of such third-party services may be subject to their own terms and policies.' },
  { id: 'sec-7', sort_order: 6, title: '6. Service Availability', text: 'We strive to keep the Services up and running; however, all online services suffer occasional disruptions. Satesoft does not guarantee uninterrupted access to the Services.' },
  { id: 'sec-8', sort_order: 7, title: '7. Software License', text: 'Unless accompanied by a separate license agreement, any software provided by us is subject to these terms. All software, code, interfaces, and branding components remain the exclusive intellectual property of Satesoft Corporation Limited.' },
  { id: 'sec-9', sort_order: 8, title: '8. Payment Terms', text: 'If you purchase a Service, you agree to pay all applicable fees and taxes. All payments are non-refundable unless explicitly stated in these Terms or by applicable law.' },
  { id: 'sec-10', sort_order: 9, title: '9. Contracting Entity, Choice of Law & Location for Resolving Disputes', text: 'These terms are governed by the laws of Uganda without regard to conflict of law principles. Contracts are entered into with Satesoft Corporation Limited.' },
  { id: 'sec-11', sort_order: 10, title: '10. Warranties', text: 'Satesoft and our affiliates make no warranties, express or implied, with respect to the services. The services are provided on an "as is" and "as available" basis.' },
  { id: 'sec-12', sort_order: 11, title: '11. Limitation of Liability', text: 'If you have any basis for recovering damages, you can recover from Satesoft only direct damages up to the amount you paid for the Services in the month prior to the event giving rise to the liability.' },
  { id: 'sec-13', sort_order: 12, title: '12. Service-Specific Terms', text: 'The terms before and after section 12 apply generally to all Services. Additional service-specific terms may apply to particular products as described in the relevant documentation.' },
  { id: 'sec-14', sort_order: 13, title: '13. Mediation and Dispute Resolution', text: 'In the event of any controversy or claim arising out of or relating to this contract, the parties agree to attempt resolution through mediation before pursuing litigation.' },
  { id: 'sec-15', sort_order: 14, title: '14. Miscellaneous', text: 'This agreement constitutes the entire agreement between you and Satesoft regarding your use of the Services. If any provision is deemed unenforceable, the remaining provisions shall continue in full force and effect.' },
  { id: 'sec-16', sort_order: 15, title: '15. Export Laws', text: 'You must comply with all domestic and international export laws and regulations, including but not limited to any restrictions on the export of technology or software.' },
  { id: 'sec-17', sort_order: 16, title: '16. Reservation of Rights and Feedback', text: 'Satesoft reserves all rights not expressly granted under these Terms. Any feedback you provide is voluntary and may be used by Satesoft without obligation.' },
  { id: 'sec-18', sort_order: 17, title: '17. Covered Services', text: 'The following products, apps, and services are covered by this Agreement. Additional products may be added from time to time and will be subject to these Terms unless accompanied by a separate agreement.' }
];

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return '';
  return String(rawTitle).replace(/^(\d+[\.\s\-\)]*)+/g, '').trim();
};

const ServiceAgreement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const response = await api.get('/legal/service-agreement/sections');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const sorted = response.data.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
          setSections(sorted);
          setActiveSection(sorted[0].id.toString());
        } else {
          setSections(DEFAULT_SERVICE_AGREEMENT_SECTIONS);
          setActiveSection(DEFAULT_SERVICE_AGREEMENT_SECTIONS[0].id.toString());
        }
      } catch (error) {
        console.error('Failed to fetch service agreement sections:', error);
        setSections(DEFAULT_SERVICE_AGREEMENT_SECTIONS);
        setActiveSection(DEFAULT_SERVICE_AGREEMENT_SECTIONS[0].id.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const displaySections = sections.map((sec, idx) => ({
    id: sec.id.toString(),
    number: idx,
    title: cleanTitle(sec.title),
    content: sec.text || ''
  }));

  const filteredSections = displaySections.filter(sec =>
    sec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sec.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const container = document.getElementById('doc-scroll-container');
    if (!container) return;

    const handleScroll = () => {
      const sectionElements = filteredSections.map(sec => ({
        id: sec.id,
        element: document.getElementById(sec.id)
      }));

      const current = sectionElements.find(section => {
        if (!section.element) return false;
        const rect = section.element.getBoundingClientRect();
        return rect.top <= 120 && rect.bottom >= 120;
      });

      if (current) {
        setActiveSection(current.id);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [filteredSections]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans">
        <p className="text-slate-500 font-medium">Loading service agreement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-slate-200">
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #6bb200; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4a8200; }
        `}</style>

        {/* Header */}
        <div className="py-6 px-6 border-b border-slate-100 bg-white shrink-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#70B312]">
                Satesoft Service Agreement
              </h1>
              <p className="text-sm font-bold text-[#70B312] mt-0.5 italic">
                Terms & Conditions & Comprehensive Legal Framework
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 sm:w-64 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#70B312]"
              />
              <button
                onClick={handlePrint}
                className="text-xs font-semibold text-white bg-[#70B312] hover:bg-[#5a9e0e] px-3.5 py-2 rounded-lg"
              >
                Print Service Agreement
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-3 pt-3 border-t border-slate-50">
            <span>EFFECTIVE: 01.04.2025</span>
            <span>•</span>
            <span>VERSION 1.0.0</span>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start relative p-6 lg:p-8">
          {/* Table of Contents */}
          <aside className="lg:col-span-1 sticky top-28 self-start z-10">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">
                Table of Contents ({filteredSections.length})
              </h3>

              <nav
                className="space-y-1 overflow-y-auto custom-scrollbar pr-1"
                style={{ maxHeight: 'calc(100vh - 180px)' }}
              >
                {filteredSections.map((sec, index) => {
                  const cleanTitle = sec.title.replace(/^(\d+[\.\s\-\)]*)+/g, '').trim();
                  const sectionNum = sec.number !== undefined ? sec.number : (index + 1);

                  return (
                    <a
                      key={sec.id}
                      href={`#section-${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`block px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                        activeSection === sec.id
                          ? 'bg-[#70B312]/10 text-[#70B312] font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-1.5 font-bold text-[#70B312]">{sectionNum}.</span>
                      {cleanTitle}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {filteredSections.map((section, index) => {
              const cleanTitle = section.title.replace(/^(\d+[\.\s\-\)]*)+/g, '').trim();
              const sectionNum = section.number !== undefined ? section.number : (index + 1);

              return (
                <article
                  key={section.id}
                  id={`section-${section.id}`}
                  className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm scroll-mt-28"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-[#70B312]">
                      <span className="text-[#70B312] mr-2">{sectionNum}.</span>
                      {cleanTitle}
                    </h2>
                    {section.badge && (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#70B312] bg-[#70B312]/10 rounded-full">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                    {section.text || section.content}
                  </div>
                </article>
              );
            })}
          </main>
        </div>

      </div>
    </div>
  );
};

export default ServiceAgreement;
