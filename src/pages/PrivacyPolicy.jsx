import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const DEFAULT_PRIVACY_SECTIONS = [
  { id: 1, number: '1', title: 'Introduction', content: 'Satesoft Corporation Limited operates and manages software services across Africa. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our platforms, or engage with our services.' },
  { id: 2, number: '2', title: 'Information We Collect', content: 'We collect personal data that you voluntarily provide to us when registering for services, including name, email address, phone number, job title, and company name. We also collect usage data such as IP addresses, browser types, operating systems, device identifiers, and access timestamps.' },
  { id: 3, number: '3', title: 'How We Use Your Information', content: 'We use the information we collect to operate, maintain, and provide our core features, communicate system updates, process transactions, prevent fraud, and comply with legal and regulatory requirements.' },
  { id: 4, number: '4', title: 'Data Sharing and Disclosure', content: 'We do not sell your personal data. We may share data with trusted service providers such as cloud hosting and payment processors, legal authorities when required by law, or in connection with a corporate reorganization or acquisition.' },
  { id: 5, number: '5', title: 'Data Security', content: 'We implement robust technical and organizational measures to safeguard your data, including encryption in transit and at rest, access controls, and regular security audits.' },
  { id: 6, number: '6', title: 'Data Retention', content: 'We retain personal information only for as long as necessary to fulfill the legal obligations and purposes outlined in this policy.' },
  { id: 7, number: '7', title: 'Your Rights and Choices', content: 'Depending on your jurisdiction, you have rights regarding your personal data access and deletion. To exercise these rights, contact our Data Protection Office at privacy@satesoft.com.' },
  { id: 8, number: '8', title: 'Cookies and Tracking Technologies', content: 'We use cookies and similar tracking technologies to analyze traffic and customize experience. Essential cookies are used for session management and security. Analytical cookies are used only with your consent.' },
  { id: 9, number: '9', title: 'Third-Party Services', content: 'Our services may contain links to third-party websites or services not operated by us. We are not responsible for the privacy practices or content of these external sites.' },
  { id: 10, number: '10', title: 'International Data Transfers', content: 'Your information may be transferred to and maintained on servers located outside your jurisdiction. We ensure appropriate safeguards are in place for such transfers.' },
  { id: 11, number: '11', title: 'Changes to This Policy', content: 'We may update this Privacy Policy from time to time to reflect changes in our practices. The updated version will be indicated by an updated Effective Date at the top of the policy.' }
];

export default function PrivacyPolicy() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const response = await api.get('/privacy-policy');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const sorted = response.data.sort((a, b) => (a.section_order || 0) - (b.section_order || 0) || a.id - b.id);
          setSections(sorted);
          setActiveSection(sorted[0].id.toString());
        } else {
          setSections(DEFAULT_PRIVACY_SECTIONS);
          setActiveSection(DEFAULT_PRIVACY_SECTIONS[0].id.toString());
        }
      } catch (error) {
        console.error('Failed to fetch privacy policy sections:', error);
        setSections(DEFAULT_PRIVACY_SECTIONS);
        setActiveSection(DEFAULT_PRIVACY_SECTIONS[0].id.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const displaySections = sections.map((sec, idx) => ({
    id: sec.id.toString(),
    number: sec.section_number || (sec.title.toLowerCase().includes('introduction') ? '' : `${idx + 1}.`),
    title: sec.title,
    content: sec.content
  }));

  const formatSectionNumber = (num, idx) => {
    if (num !== undefined && num !== null && num !== '') {
      const cleanNum = String(num).replace(/^\.|\.$/g, '');
      return `${cleanNum}.`;
    }
    return `${idx + 1}.`;
  };

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
      <div className="h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans overflow-hidden flex flex-col">
        <div className="max-w-7xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-500">Loading privacy policy...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans overflow-hidden flex flex-col">
      <div className="max-w-7xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">

        {/* Document Header */}
        <div className="py-6 px-6 border-b border-slate-100 bg-white shrink-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#74b816]">
                Satesoft Privacy Statement
              </h1>
              <p className="text-sm font-bold text-[#74b816] mt-0.5 italic">
                Data Protection & Comprehensive Legal Framework
              </p>
            </div>

            <div className="flex items-center gap-3 no-print">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search sections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 sm:w-64 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pl-8 focus:outline-none focus:border-[#74b816] transition-all"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#74b816] hover:bg-[#63a012] px-3.5 py-2 rounded-lg transition-colors shadow-sm shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Print Privacy Policy</span>
              </button>
            </div>

          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-3 pt-3 border-t border-slate-50">
            <span>EFFECTIVE: 01.04.2025</span>
            <span>•</span>
            <span>VERSION 1.0.0</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden p-6 lg:p-8 relative">

          {/* Table of Contents Sidebar */}
          <div className="w-full lg:w-1/4 border-r border-slate-100 pr-4 hidden lg:block h-full overflow-y-auto shrink-0 no-print">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 sticky top-0 bg-white py-1 z-10">
              Table of Contents
            </h3>

            {filteredSections.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No sections found.</p>
            ) : (
              <nav className="space-y-1 text-xs">
                {filteredSections.map((sec, idx) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => scrollToSection(e, sec.id)}
                    className={`block py-1.5 px-2 rounded-md transition-all font-medium ${
                      activeSection === sec.id
                        ? 'bg-[#74b816]/10 text-[#74b816] font-bold border-l-2 border-[#74b816]'
                        : 'text-slate-600 hover:text-[#74b816] hover:bg-slate-50'
                    }`}
                  >
                    {formatSectionNumber(sec.number, idx)} {sec.title}
                  </a>
                ))}
              </nav>
            )}
          </div>

          {/* Scrollable Text Body */}
          <div id="doc-scroll-container" className="w-full lg:w-3/4 h-full overflow-y-auto pl-0 lg:pl-8 space-y-10 text-sm text-slate-700 leading-relaxed pr-2">

            {filteredSections.map((sec, idx) => (
              <section key={sec.id} id={sec.id} className={idx > 0 ? 'scroll-mt-6 pt-6 border-t border-slate-100' : 'scroll-mt-6'}>
                <h2 className="text-lg font-bold text-[#74b816] mb-3">
                  {formatSectionNumber(sec.number, idx)} {sec.title}
                </h2>
                <p className="whitespace-pre-wrap break-words">{sec.content}</p>
              </section>
            ))}

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400 bg-slate-50/50">
          <p className="font-semibold text-slate-600">Confidential — Satesoft Corporation Limited</p>
          <p className="font-bold text-[#74b816] mt-0.5">Satesoft Corporation Limited — Your Innovation Partner</p>
        </div>

      </div>
    </div>
  );
}
