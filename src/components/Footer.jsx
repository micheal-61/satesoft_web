import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

function Footer() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [privacyPolicy, setPrivacyPolicy] = useState(null);
  const [serviceAgreement, setServiceAgreement] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [contactsRes, privacyRes, agreementRes, servicesRes] = await Promise.all([
          fetch('/api/contacts').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/privacy-policies').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/service-agreements').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/services').then(r => r.ok ? r.json() : []).catch(() => []),
        ]);

        const socials = contactsRes.filter(c => c.category === 'social_media');
        setSocialLinks(socials);
        setPrivacyPolicy(privacyRes.length > 0 ? privacyRes[0] : null);
        setServiceAgreement(agreementRes.length > 0 ? agreementRes[0] : null);
        setServices(servicesRes || []);
      } catch (err) {
        console.error('Failed to fetch footer data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFooterData();
  }, []);

  const getSocialIcon = (platform) => {
    const iconMap = {
      'facebook': 'bi-facebook',
      'twitter': 'bi-twitter-x',
      'instagram': 'bi-instagram',
      'youtube': 'bi-youtube',
      'linkedin': 'bi-linkedin',
      'telegram': 'bi-telegram',
      'github': 'bi-github',
    };
    return iconMap[platform?.toLowerCase()] || 'bi-link';
  };

  const getSocialLabel = (contactPoint) => {
    if (!contactPoint) return 'Social';
    const url = contactPoint.toLowerCase();
    if (url.includes('facebook')) return 'Facebook';
    if (url.includes('twitter') || url.includes('x.com')) return 'Twitter';
    if (url.includes('instagram')) return 'Instagram';
    if (url.includes('youtube')) return 'YouTube';
    if (url.includes('linkedin')) return 'LinkedIn';
    if (url.includes('telegram')) return 'Telegram';
    if (url.includes('github')) return 'GitHub';
    return 'Social';
  };

  // Navigation link configuration
  const navigationLinks = {
    company: [
      { label: 'About Satesoft', path: '/about' },
      { label: 'Our Team', path: '/board' },
      { label: 'Blog', path: '/blog' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'Testimonials', path: '/testimonials' },
      { label: 'Our Partners', path: '/partners' },
      { label: 'Environmental Sustainability', path: '/environmental' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy-policy' },
      { label: 'Service Agreement', path: '/service-agreement' },
      { label: 'Supports', path: '/support' },
    ],
    admin: [
      { label: 'Admin', path: '/admin/login' },
    ]
  };

  // Social media platforms configuration
  const socialPlatforms = ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 'telegram'];

  return (
    <div>
      {/* ============================================================
          TOP BANNER - Contact & Brand Message
          ============================================================ */}
      <div className="bg-primary-50/60 border-t border-border py-4">
        <div className="container mx-auto px-8 md:px-12 lg:px-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Brand Message */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center text-lg">
                <i className="bi bi-lightning-charge-fill" aria-hidden="true"></i>
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-text mb-0">
                  Elevating Customer Experience.
                </h3>
              </div>
            </div>
            
            {/* Phone Contact */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center text-lg">
                <i className="bi bi-telephone-outbound-fill" aria-hidden="true"></i>
              </div>
              <div>
                <a 
                  href="tel:+44920090505" 
                  className="text-base md:text-lg font-bold text-primary-500 hover:text-primary-600 transition-colors"
                >
                  +256 749095200
                  +256 791248471
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN FOOTER - Navigation & Information
          ============================================================ */}
      <div 
        className="bg-[#f5f5f5] pt-8 pb-6 text-slate-600" 
        style={{ fontFamily: "'Segoe UI', sans-serif" }}
      >
        <div className="container mx-auto px-8 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-8">
            
            {/* ==========================================================
                COLUMN 1: About & Social Media
                ========================================================== */}
            <div className="lg:col-span-4">
              {/* Logo */}
              <div className="mb-4">
                <Link to="/">
                  <Logo textClassName="text-[#72bf24]" showText={true} size="lg" />
                </Link>
              </div>
              
              {/* Description - Changed to lime green */}
              <p className="mt-3 mb-4 leading-relaxed text-[#72bf24] text-[14px]">
                Empowering businesses across Africa with innovative cloud solutions, 
                intelligent software, and actionable data analytics.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex gap-2">
                {loading ? (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-9 h-9 rounded-full bg-slate-300 animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  socialPlatforms.map((platform) => {
                    const link = socialLinks.find(l => {
                      const url = l.contact_point?.toLowerCase() || '';
                      if (platform === 'twitter') {
                        return url.includes('twitter') || url.includes('x.com');
                      }
                      return url.includes(platform);
                    });
                    const isActive = !!link;
                    return (
                      <a 
                        key={platform}
                        href={isActive ? link.contact_point : '#'}
                        target={isActive ? "_blank" : undefined}
                        rel={isActive ? "noopener noreferrer" : undefined}
                        className={`w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 transition-colors ${
                          isActive 
                            ? 'hover:bg-[#72bf24] hover:text-white cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed pointer-events-none'
                        }`}
                        title={
                          isActive 
                            ? getSocialLabel(link.contact_point) 
                            : `${platform.charAt(0).toUpperCase() + platform.slice(1)} - No link configured`
                        }
                      >
                        <i className={isActive ? `bi bi-${platform === 'twitter' ? 'twitter-x' : platform}` : `bi bi-${platform === 'twitter' ? 'twitter-x' : platform}`}></i>
                      </a>
                    );
                  })
                )}
              </div>
            </div>

            {/* ==========================================================
                COLUMN 2: Company Navigation
                ========================================================== */}
            <div className="lg:col-span-2">
              <h3 className="text-[15px] font-semibold text-text mb-4 relative pb-1.5">
                Company
              </h3>
              <ul className="space-y-2">
                {navigationLinks.company.map((link) => (
                  <li key={link.path}>
                     <Link 
                      to={link.path} 
                      className="hover:text-[#72bf24] transition-colors block font-normal text-[13px] hover:font-bold w-fit"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ==========================================================
                COLUMN 3: Services
                ========================================================== */}
            <div className="lg:col-span-3">
              <h3 className="text-[15px] font-semibold text-text mb-4 relative pb-1.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-10 after:bg-[#72bf24]">
                Services
              </h3>
              <ul className="space-y-2">
                {loading ? (
                  <li className="text-[13px] text-text/40">Loading services...</li>
                ) : services.length > 0 ? (
                  services.slice(0, 5).map((service) => (
                    <li key={service.id}>
                       <Link 
                        to={`/services/${service.id}`} 
                        className="hover:text-[#72bf24] transition-colors block font-normal text-[13px] hover:font-bold"
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-[13px] text-text/40">No services available</li>
                )}
              </ul>
            </div>

            {/* ==========================================================
                COLUMN 4: Newsletter
                ========================================================== */}
            <div className="lg:col-span-3">
              <h3 className="text-[15px] font-semibold text-text mb-4 relative pb-1.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-10 after:bg-[#72bf24]">
                Newsletter
              </h3>
              {/* Newsletter description - Changed to lime green */}
              <p className="mb-4 text-[#72bf24] text-[14px]">
                Subscribe to get the latest news, updates, and product insights from Satesoft.
              </p>
               <form onSubmit={async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const email = form.EMAIL?.value?.trim();
                 if (!email) return;
                 try {
                   const res = await fetch('/api/subscribe', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ email })
                   });
                   const data = await res.json().catch(() => ({}));
                   form.reset();
                   alert(data.message || 'Subscribed successfully!');
                   localStorage.setItem('satesoft_dashboard_refresh', String(Date.now()));
                 } catch (err) {
                   console.error('Subscribe error:', err);
                   alert('Subscription failed. Please try again.');
                 }
               }} className="relative">
                <input 
                  type="email" 
                  name="EMAIL" 
                  placeholder="Enter Your E-mail" 
                  required 
                  className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-3.5 pr-11 text-[13px] text-text placeholder:text-text/40 focus:outline-none focus:border-[#72bf24] transition-colors"
                />
                <button 
                  type="submit" 
                  className="absolute right-0 top-0 bottom-0 px-3.5 bg-[#72bf24] text-white rounded-r-lg hover:bg-[#62a71e] transition-colors"
                >
                  <i className="bi bi-send text-sm"></i>
                </button>
              </form>
            </div>

          </div>

          {/* ============================================================
              COPYRIGHT & LEGAL - Bottom Bar
              ============================================================ */}
          <div className="border-t border-slate-300 pt-4 flex flex-col md:flex-row justify-between items-center gap-3">
            {/* Copyright */}
            <p className="mb-0 text-[12px] font-normal">
              © Copyright 2026 By <span className="text-[#72bf24] font-semibold">Satesoft</span>. All rights reserved.
            </p>
            
            {/* Legal Links */}
            <ul className="flex gap-5 text-[12px] mb-0">
              {navigationLinks.legal.map((link) => {
                // Only render if condition is met (for conditional links)
                if (link.condition === undefined || link.condition) {
                  return (
                    <li key={link.path}>
                        <Link 
                          to={link.path} 
                          className="hover:text-[#72bf24] transition-colors font-normal hover:font-bold"
                        >
                          {link.label}
                        </Link>
                    </li>
                  );
                }
                return null;
              })}
              {/* Admin Link */}
              <li>
                 <Link 
                  to="/admin/login" 
                  className="text-[#72bf24] font-normal hover:text-[#62a71e] hover:font-bold transition-colors"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;