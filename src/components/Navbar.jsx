import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";

export default function Appheader() {
  const [scrolled, setScrolled] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const companyRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (companyRef.current && !companyRef.current.contains(e.target)) {
        setCompanyOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCompanyOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  }, [location]);

  const toggleMobile = () => {
    setMobileOpen((prev) => !prev);
  };

  // Navigation links configuration
  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Services', path: '/services' },
    { label: 'Partners', path: '/partners' },
    { label: 'Opportunities', path: '/opportunities' },
    { label: 'Blog', path: '/blog' },
  ];

  const contactLink = { label: 'Contact', path: '/contact' };

  const companyLinks = [
    { label: 'About Us', path: '/about' },
    { label: 'Our Team', path: '/board' },
    { label: 'Testimonials', path: '/testimonials' },
    { label: 'Pricing', path: '/pricing' },
  ];

  // Search index: add new searchable terms here when adding pages, products, services, or content.
  // Each entry maps a user-visible label to its page path.
  const searchLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Products', path: '/products' },
    { label: 'Duqact', path: '/products/duqact' },
    { label: 'Karibyshoo', path: '/products/karibyshoo' },
    { label: 'FoundDocument', path: '/products/founddocument' },
    { label: 'Services', path: '/services' },
    { label: 'Cyber Security', path: '/services' },
    { label: 'UI/UX Design', path: '/services' },
    { label: 'App Development', path: '/services' },
    { label: 'Technology Consult', path: '/services' },
    { label: 'IT Solution', path: '/services' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Testimonials', path: '/testimonials' },
    { label: 'Contact', path: '/contact' },
    { label: 'Blog', path: '/blog' },
    { label: 'Company News', path: '/blog' },
    { label: 'Product Updates', path: '/blog' },
    { label: 'Partnerships', path: '/blog' },
    { label: 'Technology', path: '/blog' },
    { label: 'Our Team', path: '/board' },
    { label: 'Board of Advisors', path: '/board' },
    { label: 'Opportunities', path: '/opportunities' },
    { label: 'Careers', path: '/opportunities' },
    { label: 'Partners', path: '/partners' },
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Service Agreement', path: '/service-agreement' },
    { label: 'Support', path: '/support' },
    { label: 'Environmental', path: '/environmental' },
    { label: 'Satesoft', path: '/' },
    { label: 'Cloud Solutions', path: '/' },
    { label: 'Data Analytics', path: '/' },
    { label: 'Custom Software', path: '/' },
    { label: 'Digital Innovation', path: '/' },
    { label: 'Cybersecurity', path: '/' },
    { label: 'Digital Transformation', path: '/' },
    { label: 'IT Infrastructure', path: '/' },
    { label: 'Consulting', path: '/' },
    { label: 'Enterprise', path: '/' },
    { label: 'Innovation', path: '/' },
    { label: 'Africa', path: '/' },
    { label: 'Retail Intelligence', path: '/products/duqact' },
    { label: 'Visitor Management', path: '/products/karibyshoo' },
    { label: 'Document Management', path: '/products/founddocument' },
    { label: 'Real-time sales tracking', path: '/products/duqact' },
    { label: 'Inventory optimization', path: '/products/duqact' },
    { label: 'Consumer trend analysis', path: '/products/duqact' },
    { label: 'Offline-first data capture', path: '/products/duqact' },
    { label: 'Digital guest registration', path: '/products/karibyshoo' },
    { label: 'QR code visitor check-in', path: '/products/karibyshoo' },
    { label: 'Security and access control', path: '/products/karibyshoo' },
    { label: 'Visitor analytics dashboard', path: '/products/karibyshoo' },
    { label: 'OCR-powered intelligent search', path: '/products/founddocument' },
    { label: 'Secure cloud document storage', path: '/products/founddocument' },
    { label: 'Version control', path: '/products/founddocument' },
    { label: 'Role-based user access', path: '/products/founddocument' },
    { label: 'Fast document retrieval', path: '/products/founddocument' },
    { label: 'Automated digital archiving', path: '/products/founddocument' },
    { label: 'Net-Zero', path: '/environmental' },
    { label: 'Carbon Reduction', path: '/environmental' },
    { label: 'Renewable Energy', path: '/environmental' },
    { label: 'Sustainability', path: '/environmental' },
    { label: 'Energy Efficiency', path: '/environmental' },
    { label: 'Water Positive', path: '/environmental' },
    { label: 'Circular Economy', path: '/environmental' },
    { label: 'Waste Reduction', path: '/environmental' },
    { label: 'Kampala', path: '/contact' },
    { label: 'Uganda', path: '/contact' },
    { label: 'Nairobi', path: '/partners' },
    { label: 'Lagos', path: '/partners' },
    { label: 'Driving Digital Innovation', path: '/about' },
    { label: 'Innovation First', path: '/about' },
    { label: 'Customer Centric', path: '/about' },
    { label: 'Trust and Security', path: '/about' },
    { label: 'Global Impact', path: '/about' },
    { label: '8+ Years of Excellence', path: '/about' },
    { label: '200+ Enterprise Clients', path: '/about' },
    { label: '50+ Expert Team Members', path: '/about' },
    { label: '98% Client Satisfaction', path: '/about' },
    { label: 'Reliable', path: '/services' },
    { label: 'Scalable', path: '/services' },
    { label: 'Secure', path: '/services' },
    { label: '24/7 Support', path: '/services' },
    { label: 'Request a Demo', path: '/products' },
    { label: 'Get Started', path: '/' },
    { label: 'Our Services', path: '/' },
    { label: 'Meet Our Experts', path: '/' },
    { label: 'Fresh Ideas for Modern Teams', path: '/blog' },
    { label: 'Join Our Team', path: '/opportunities' },
    { label: 'Trusted by Global Leaders', path: '/partners' },
    { label: 'What Our Customer Says', path: '/testimonials' },
    { label: 'Choose Your Best Plan', path: '/pricing' },
    { label: 'Keeping Your Business Safe', path: '/faq' },
    { label: 'Building a Sustainable Future', path: '/environmental' },
    { label: 'Oluwaseun Adeyemi', path: '/testimonials' },
    { label: 'Amara Okafor', path: '/testimonials' },
    { label: 'Kofi Mensah', path: '/testimonials' },
    { label: 'Sarah Jenkins', path: '/testimonials' },
    { label: 'Operations Director', path: '/testimonials' },
    { label: 'Head of IT', path: '/testimonials' },
    { label: 'Chief Archivist', path: '/testimonials' },
    { label: 'Logistics Manager', path: '/testimonials' },
    { label: 'Medical Services', path: '/faq' },
    { label: 'Customer geography', path: '/faq' },
    { label: 'Industry experience', path: '/faq' },
    { label: 'Data security', path: '/faq' },
    { label: 'Welcome to Satesoft', path: '/support' },
    { label: 'How to Browse Products and Services', path: '/support' },
    { label: 'Managing Your Account', path: '/support' },
    { label: 'How to Request a Demo or Quote', path: '/support' },
    { label: 'Payment Methods and Invoices', path: '/support' },
    { label: 'Getting Technical Help', path: '/support' },
    { label: 'Privacy and Data Protection', path: '/support' },
    { label: 'Service Level Agreements', path: '/support' },
    { label: 'SLA', path: '/support' },
    { label: 'Getting Started', path: '/support' },
    { label: 'Account and Settings', path: '/support' },
    { label: 'Products and Services', path: '/support' },
    { label: 'Billing and Payments', path: '/support' },
    { label: 'Technical Support', path: '/support' },
    { label: 'info@satesoft.com', path: '/contact' },
    { label: '+250 788 000 000', path: '/contact' },
    { label: '+256 749095200', path: '/support' },
    { label: 'NATIONAL ICT INNOVATION HUB', path: '/contact' },
    { label: 'Global Tech Solutions', path: '/partners' },
    { label: 'African Retail Group', path: '/partners' },
    { label: 'Information Technology', path: '/partners' },
    { label: 'Retail', path: '/partners' },
    { label: 'Board Member', path: '/board' },
    { label: 'Advisor', path: '/board' },
    { label: 'Executive', path: '/board' },
    { label: 'Investor', path: '/board' },
    { label: 'Send Message', path: '/contact' },
    { label: 'Your Name', path: '/contact' },
    { label: 'Your Email', path: '/contact' },
    { label: 'Subject', path: '/contact' },
    { label: 'Your Message', path: '/contact' },
    { label: 'Full name', path: '/opportunities' },
    { label: 'Email address', path: '/opportunities' },
    { label: 'Phone number', path: '/opportunities' },
    { label: 'Current location', path: '/opportunities' },
    { label: 'Years of experience', path: '/opportunities' },
    { label: 'Upload CV', path: '/opportunities' },
    { label: 'Send application', path: '/opportunities' },
    { label: 'Start Your Journey', path: '/about' },
    { label: 'Explore Services', path: '/about' },
    { label: 'Explore Our Solutions', path: '/about' },
    { label: 'Explore Our Services', path: '/' },
    { label: 'Get in Touch', path: '/' },
    { label: 'Scroll to explore', path: '/' },
    { label: 'Learn More', path: '/products' },
    { label: 'Learn more about our commitment', path: '/environmental' },
    { label: 'View all initiatives', path: '/environmental' },
    { label: 'Back to all initiatives', path: '/environmental' },
    { label: 'Contact Us to Learn More', path: '/services' },
    { label: 'Contact Support', path: '/support' },
    { label: 'Back to Home', path: '/services' },
    { label: 'Back to Products', path: '/products' },
    { label: 'Back to opportunities', path: '/opportunities' },
    { label: 'Back to Homepage', path: '/services' },
    { label: 'View All Services', path: '/services' },
    { label: 'View All Products', path: '/products' },
    { label: 'Apply now', path: '/opportunities' },
    { label: 'Apply Now', path: '/opportunities' },
    { label: 'Post Comment', path: '/blog' },
    { label: 'Share story', path: '/blog' },
    { label: 'Back to Blog', path: '/blog' },
    { label: 'Why this matters', path: '/blog' },
    { label: 'Comments', path: '/blog' },
    { label: 'No comments yet', path: '/blog' },
    { label: 'Search', path: '/' },
    { label: 'Search results', path: '/' },
    { label: 'No results found', path: '/' },
    { label: 'Try searching for something else', path: '/' },
    { label: 'Quick links', path: '/' },
    { label: 'Try Again', path: '/products' },
    { label: 'Back to Home', path: '/services' },
    { label: 'Clear all filters', path: '/board' },
    { label: 'Full Profile', path: '/board' },
    { label: 'Get in Touch', path: '/board' },
    { label: 'About this opportunity', path: '/opportunities' },
    { label: 'Key requirements', path: '/opportunities' },
    { label: 'Key Requirements', path: '/opportunities' },
    { label: 'positions available', path: '/opportunities' },
    { label: 'Open position', path: '/opportunities' },
    { label: 'Your data is encrypted', path: '/opportunities' },
    { label: 'Cancel', path: '/opportunities' },
    { label: 'Submit Application', path: '/opportunities' },
    { label: 'Upload Resume', path: '/opportunities' },
    { label: 'Cover Letter', path: '/opportunities' },
    { label: 'Position Applying For', path: '/opportunities' },
    { label: 'Availability', path: '/opportunities' },
    { label: 'Notice Period', path: '/opportunities' },
    { label: 'Sex', path: '/opportunities' },
    { label: 'Male', path: '/opportunities' },
    { label: 'Female', path: '/opportunities' },
    { label: 'Other', path: '/opportunities' },
    { label: 'Prefer not to say', path: '/opportunities' },
    { label: 'Immediately', path: '/opportunities' },
    { label: '2 Weeks', path: '/opportunities' },
    { label: '1 Month', path: '/opportunities' },
    { label: '2 Months', path: '/opportunities' },
    { label: '0-1 Years', path: '/opportunities' },
    { label: '2-3 Years', path: '/opportunities' },
    { label: '4-5 Years', path: '/opportunities' },
    { label: '5+ Years', path: '/opportunities' },
    { label: 'Select Experience', path: '/opportunities' },
    { label: 'PDF', path: '/opportunities' },
    { label: 'DOC', path: '/opportunities' },
    { label: 'DOCX', path: '/opportunities' },
    { label: 'maximum 5 MB', path: '/opportunities' },
    { label: 'Choose PLAN', path: '/pricing' },
    { label: 'POPULAR', path: '/pricing' },
    { label: 'Monthly', path: '/pricing' },
    { label: 'No pricing plans available', path: '/pricing' },
    { label: 'No products available', path: '/products' },
    { label: 'No services available', path: '/services' },
    { label: 'No articles found', path: '/blog' },
    { label: 'No opportunities available', path: '/opportunities' },
    { label: 'No partners available', path: '/partners' },
    { label: 'No members found', path: '/board' },
    { label: 'No topics found', path: '/support' },
    { label: 'No privacy policies available', path: '/privacy-policy' },
    { label: 'No service agreements available', path: '/service-agreement' },
    { label: 'Newsletter', path: '/' },
    { label: 'Subscribe', path: '/' },
    { label: 'Enter Your E-mail', path: '/' },
    { label: 'Company', path: '/' },
    { label: 'Services', path: '/' },
    { label: 'Legal', path: '/' },
    { label: 'About Satesoft', path: '/about' },
    { label: 'Our Partners', path: '/' },
    { label: 'Environmental Sustainability', path: '/' },
    { label: 'Supports', path: '/' },
    { label: 'Admin', path: '/admin/login' },
    { label: 'Skip to main content', path: '/' },
    { label: 'Previous Service', path: '/services' },
    { label: 'Next Service', path: '/services' },
    { label: 'X of Y services', path: '/services' },
    { label: 'X opportunities found', path: '/opportunities' },
    { label: 'X positions available', path: '/opportunities' },
    { label: '5 min read', path: '/blog' },
    { label: 'Satesoft Team', path: '/blog' },
    { label: 'Read full article', path: '/blog' },
    { label: 'Type your name here', path: '/blog' },
    { label: 'Share a thoughtful comment', path: '/blog' },
    { label: 'Posting', path: '/blog' },
    { label: 'Pending', path: '/blog' },
    { label: 'Link copied', path: '/blog' },
    { label: 'At a glance', path: '/blog' },
    { label: 'What this update means', path: '/blog' },
    { label: 'Published on', path: '/blog' },
    { label: 'Loading products', path: '/products' },
    { label: 'Loading services', path: '/services' },
    { label: 'Loading stories', path: '/blog' },
    { label: 'Loading opportunities', path: '/opportunities' },
    { label: 'Loading pricing', path: '/pricing' },
    { label: 'Loading partners', path: '/partners' },
    { label: 'Loading board members', path: '/board' },
    { label: 'Loading service details', path: '/services' },
    { label: 'Loading product details', path: '/products' },
    { label: 'Loading application form', path: '/opportunities' },
    { label: 'Loading privacy policy', path: '/privacy-policy' },
    { label: 'Loading service agreement', path: '/service-agreement' },
    { label: 'Product not found', path: '/products' },
    { label: 'Service not found', path: '/services' },
    { label: 'Opportunity unavailable', path: '/opportunities' },
    { label: 'This opportunity is no longer available', path: '/opportunities' },
    { label: 'Message sent successfully', path: '/contact' },
    { label: 'Your application has been sent', path: '/opportunities' },
    { label: 'Comment submitted successfully', path: '/blog' },
    { label: 'Sending Message', path: '/contact' },
    { label: 'Sending application', path: '/opportunities' },
    { label: 'Signing in', path: '/admin/login' },
    { label: 'Resetting', path: '/admin/login' },
    { label: 'Enter username', path: '/admin/login' },
    { label: 'Enter password', path: '/admin/login' },
    { label: 'Enter your registered email', path: '/admin/login' },
    { label: 'Enter reset code from email', path: '/admin/login' },
    { label: 'Enter new password', path: '/admin/login' },
    { label: 'Confirm new password', path: '/admin/login' },
    { label: 'Remember me', path: '/admin/login' },
    { label: 'Forgot password', path: '/admin/login' },
    { label: 'Send Reset Code', path: '/admin/login' },
    { label: 'Reset Password', path: '/admin/login' },
    { label: 'Back to login', path: '/admin/login' },
    { label: 'Back to Main Site', path: '/admin/login' },
    { label: 'Reset Code', path: '/admin/login' },
    { label: 'Recovery Email', path: '/admin/login' },
    { label: 'Sign in to manage Satesoft content', path: '/admin/login' },
    { label: 'CMS Admin', path: '/admin/login' },
    { label: 'Enter Your E-mail', path: '/' },
    { label: 'We typically respond within 24 hours', path: '/contact' },
    { label: 'Together we can build a more sustainable future', path: '/environmental' },
    { label: '99% Carbon Reduction', path: '/environmental' },
    { label: '100% Renewable Energy', path: '/environmental' },
    { label: '0.12L Water Efficiency', path: '/environmental' },
    { label: '2040 Net-Zero Target', path: '/environmental' },
    { label: '4.1x more efficient', path: '/environmental' },
    { label: '600+ projects across 28 countries', path: '/environmental' },
    { label: '7x better than industry average', path: '/environmental' },
    { label: '35% Less Carbon', path: '/environmental' },
    { label: '38 data centers', path: '/environmental' },
    { label: '99% Hardware Diverted', path: '/environmental' },
    { label: '14.6M components', path: '/environmental' },
    { label: '10 years ahead of Paris Agreement', path: '/environmental' },
    { label: 'Best IT Solution Provider', path: '/' },
    { label: 'Trusted by Enterprises', path: '/' },
    { label: 'Empowering Africa\'s Digital Future', path: '/' },
    { label: 'Meaningful Data', path: '/' },
    { label: 'Elevate Your Business with IT Excellence', path: '/' },
    { label: 'A New Experience', path: '/' },
    { label: 'Innovative Solutions for Africa', path: '/' },
    { label: 'African Solutions', path: '/' },
    { label: 'Our Products', path: '/products' },
    { label: 'Explore Our Products', path: '/products' },
    { label: 'Portfolio', path: '/products' },
    { label: 'Our Services', path: '/services' },
    { label: 'Service to your reach Our dear Customer', path: '/services' },
    { label: 'Insights Hub', path: '/blog' },
    { label: 'CAREERS', path: '/opportunities' },
    { label: 'Our Network', path: '/partners' },
    { label: 'TESTIMONIALS', path: '/testimonials' },
    { label: 'Leadership', path: '/board' },
    { label: 'Environmental Commitment', path: '/environmental' },
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Service Agreement', path: '/service-agreement' },
    { label: 'Support Center', path: '/support' },
  ];
  const searchResults = searchLinks.filter((link) =>
    link.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <header 
      className={`w-full z-[100] fixed top-0 left-0 right-0 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' 
          : 'bg-transparent'
      }`}
    >
      {/* ============================================================
          TOP HEADER - Contact Info & Social (Hidden on Mobile)
          ============================================================ */}
      <div className="hidden md:block bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 py-2.5 text-xs text-gray-600">
        <div className="container mx-auto px-8 md:px-12 lg:px-20">
          <div className="flex justify-between items-center">
            {/* Left: Contact Info */}
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 font-light">
                <i className="bi bi-geo-alt-fill text-[#72bf24] text-sm"></i>
                National Innovation Hub, Kampala, Uganda
              </span>
              <a 
                href="mailto:info@satesoft.com" 
                className="flex items-center gap-1.5 hover:text-[#72bf24] transition-colors duration-300 font-light"
              >
                <i className="bi bi-envelope text-[#72bf24] text-sm"></i>
                info@satesoft.com
              </a>
              <span className="flex items-center gap-1.5 font-light">
                <i className="bi bi-alarm text-[#72bf24] text-sm"></i>
                9.00 am - 5.30 pm
              </span>
            </div>
            
            {/* Right: Social Media */}
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#72bf24] transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-sm"></i>
              </a>
              <a 
                href="https://twitter.com/satesoft" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#72bf24] transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter text-sm"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#72bf24] transition-all duration-300 hover:scale-110"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in text-sm"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#72bf24] transition-all duration-300 hover:scale-110"
                aria-label="Pinterest"
              >
                <i className="fab fa-pinterest-p text-sm"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN NAVIGATION
          ============================================================ */}
      <div className="w-full py-3 transition-all duration-300">
        <div className="container mx-auto px-8 md:px-12 lg:px-20">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-300">
              <Logo textClassName="text-[#72bf24]" showText={true} size="md" />
            </Link>

            {/* ==========================================================
                DESKTOP MENU (Hidden on Mobile)
                ========================================================== */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center justify-center text-sm font-semibold ${
                  location.pathname === '/'
                    ? 'text-[#72bf24] font-bold'
                    : 'text-gray-600 hover:text-[#72bf24]'
                }`}
              >
                Home
              </Link>

              {/* Company Dropdown */}
              <div className="relative group" ref={companyRef}>
                  <button
                    type="button"
                    onClick={() => setCompanyOpen((o) => !o)}
                    aria-haspopup="true"
                    aria-expanded={companyOpen}
                    className={`inline-flex items-center justify-center gap-1 text-sm font-semibold ${
                      location.pathname === '/about' || 
                      location.pathname === '/board' || 
                      location.pathname === '/pricing' || 
                      location.pathname === '/testimonials'
                        ? 'text-[#72bf24] font-bold' 
                        : 'text-gray-600 hover:text-[#72bf24]'
                    }`}
                  >
                    Company
                    <i className={`bi bi-chevron-down text-[10px] transition-transform duration-300 ${
                      companyOpen ? 'rotate-180' : ''
                    }`}></i>
                  </button>
                
                  {/* Dropdown Menu */}
                  <div 
                    className={`absolute top-full left-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform z-[60] ${
                      companyOpen 
                        ? 'opacity-100 visible translate-y-0' 
                        : 'opacity-0 invisible -translate-y-2'
                    }`}
                  >
                    <div className="py-2">
                      {companyLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            className={`block px-5 py-2.5 text-sm font-normal transition-all duration-300 border-l-4 ${
                              isActive
                                ? 'border-[#72bf24] text-[#72bf24] bg-[#72bf24]/5'
                                : 'border-transparent text-gray-600 hover:bg-[#72bf24]/5 hover:text-[#72bf24] hover:border-[#72bf24]'
                            }`}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

              {navLinks.filter(l => l.path !== '/').map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center justify-center text-sm font-semibold ${
                      isActive ? 'text-[#72bf24] font-bold' : 'text-gray-600 hover:text-[#72bf24]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <Link
                to={contactLink.path}
                className={`inline-flex items-center justify-center text-sm font-semibold ${
                  location.pathname.startsWith(contactLink.path)
                    ? 'text-[#72bf24] font-bold'
                    : 'text-gray-600 hover:text-[#72bf24]'
                }`}
              >
                {contactLink.label}
              </Link>

                {/* Search */}
                <div className="relative" ref={searchRef}>
                  {!searchExpanded ? (
                    <button
                      onClick={() => setSearchExpanded(true)}
                      className="p-2 rounded-lg text-gray-600 hover:text-[#72bf24] hover:bg-[#72bf24]/10 transition-all duration-300"
                      aria-label="Open search"
                    >
                      <i className="bi bi-search text-lg"></i>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border bg-white/90 px-3 py-2 shadow-sm border-[#72bf24] w-72">
                      <i className="bi bi-search text-lg text-gray-600 shrink-0"></i>
                      <input
                        id="site-search"
                        type="text"
                        value={searchQuery}
                        onChange={(event) => {
                          setSearchQuery(event.target.value);
                          setSearchOpen(true);
                        }}
                        onFocus={() => setSearchOpen(true)}
                        placeholder="Search"
                        className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSearchOpen(false);
                          }}
                          className="shrink-0 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                          aria-label="Clear search"
                        >
                          <i className="bi bi-x text-xs text-gray-600"></i>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSearchExpanded(false);
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close search"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  )}

                {searchOpen && searchQuery.trim() && (
                  <div className="absolute right-0 top-full z-[70] mt-3 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-2xl">
                    <p className="px-1 pb-2 text-xs text-gray-500">Search results for &quot;{searchQuery.trim()}&quot;</p>
                    <div className="max-h-56 overflow-y-auto">
                      {searchResults.length ? searchResults.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                          className="block rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-[#72bf24]/5 hover:text-[#72bf24]"
                        >
                          <div className="flex items-center gap-2">
                            <i className="bi bi-arrow-right-short text-[#72bf24]"></i>
                            {link.label}
                          </div>
                        </Link>
                      )) : (
                        <div className="px-3 py-4 text-center">
                          <i className="bi bi-search text-3xl text-gray-300 mb-2"></i>
                          <p className="text-sm text-gray-500">No results found for &quot;{searchQuery.trim()}&quot;</p>
                          <p className="text-xs text-gray-400 mt-1">Try searching for something else</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile menu toggle */}
            <div className="ml-2 flex items-center lg:hidden">
              {/* Mobile Toggle Button */}
              <button
                onClick={toggleMobile}
                className="lg:hidden text-gray-600 hover:text-[#72bf24] transition-all duration-300 p-2 hover:bg-[#72bf24]/10 rounded-lg"
                aria-label="Toggle menu"
              >
                <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            MOBILE MENU
            ============================================================ */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white border-t border-gray-100 py-4 px-6 shadow-lg">
            <nav className="flex flex-col space-y-1">
              {/* Main Navigation */}
              {navLinks.map((link) => {
                const isActive = link.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={toggleMobile}
                    className={`relative font-normal text-sm transition-all duration-300 py-2.5 px-4 rounded-lg ${
                      isActive
                        ? 'text-[#72bf24] bg-[#72bf24]/5'
                        : 'text-gray-600 hover:text-[#72bf24] hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <Link
                to={contactLink.path}
                onClick={toggleMobile}
                className={`relative font-normal text-sm transition-all duration-300 py-2.5 px-4 rounded-lg ${
                  location.pathname.startsWith(contactLink.path)
                    ? 'text-[#72bf24] bg-[#72bf24]/5'
                    : 'text-gray-600 hover:text-[#72bf24] hover:bg-gray-50'
                }`}
              >
                {contactLink.label}
              </Link>

              {/* Search in mobile */}
              <div className="mt-2 px-4">
                <div className="flex items-center gap-2 rounded-lg border border-[#72bf24] bg-white px-3 py-2">
                  <i className="bi bi-search text-sm text-[#72bf24]"></i>
                  <input
                    id="mobile-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search"
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

                {/* Company Links in Mobile */}
              <div className="mt-1 pt-2 border-t border-gray-100">
                <p className="text-xs font-normal text-gray-400 uppercase tracking-wider px-4 py-1">
                  Company
                </p>
                {companyLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={toggleMobile}
                      className={`relative font-normal text-sm transition-all duration-300 py-2.5 px-4 rounded-lg ${
                        isActive
                          ? 'text-[#72bf24] bg-[#72bf24]/5'
                          : 'text-gray-600 hover:text-[#72bf24] hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Admin Portal */}
              <Link
                to="/admin/login"
                onClick={toggleMobile}
                className="mt-2 font-normal text-sm text-[#72bf24] hover:text-[#62a71e] transition-all duration-300 py-2.5 px-4 rounded-lg border border-[#72bf24]/20 hover:bg-[#72bf24]/5 flex items-center gap-2"
              >
                <i className="bi bi-shield-lock"></i>
                Admin Portal
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
