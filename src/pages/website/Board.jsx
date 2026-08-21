import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  FaArrowLeft, FaSearch, FaEnvelope, FaLinkedin, FaTwitter, 
  FaUser, FaBriefcase, FaUsers, FaChevronRight, FaBuilding,
  FaQuoteLeft, FaQuoteRight, FaStar, FaHeart, FaLightbulb
} from "react-icons/fa";

const Board = () => {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("board");

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const response = await fetch('/api/advisors');
        if (!response.ok) throw new Error('Failed to fetch advisors');
        const data = await response.json();
        setAdvisors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisors();
  }, []);

  const getRoleName = (roleId) => {
    const roles = {
      1: 'Board Member',
      2: 'Advisor',
      3: 'Executive',
      4: 'Investor',
    };
    return roles[roleId] || 'Advisor';
  };

  const getRoleColor = (roleId) => {
    const colors = {
      1: 'bg-[#72bf24]/10 text-[#72bf24] border-[#72bf24]/20',
      2: 'bg-blue-50 text-blue-600 border-blue-200',
      3: 'bg-purple-50 text-purple-600 border-purple-200',
      4: 'bg-orange-50 text-orange-600 border-orange-200',
    };
    return colors[roleId] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const filteredAdvisors = advisors.filter(adv => {
    const fullName = `${adv.firstName || ''} ${adv.lastName || ''}`.trim().toLowerCase();
    const roleName = getRoleName(adv.roleId).toLowerCase();
    const category = (adv.category || 'board').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = !searchQuery || 
      fullName.includes(query) ||
      roleName.includes(query) ||
      (adv.bio && adv.bio.toLowerCase().includes(query)) ||
      (adv.expertise && adv.expertise.toLowerCase().includes(query));
    
    const matchesCategory = category === activeCategory;
    
    return adv.isActive !== false && matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#72bf24] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500 font-light animate-pulse">Loading leadership team...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to load team</h3>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-[#72bf24] text-white rounded-lg hover:bg-[#62a71e] transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const renderMemberCard = (member, index) => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
    const roleName = getRoleName(member.roleId);
    const roleColor = getRoleColor(member.roleId);
    const messageLabel = `Message from ${member.firstName || 'member'}`;
    
    return (
      <div 
        key={member.id} 
        className="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        style={{ animationDelay: `${index * 0.08}s` }}
      >
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#72bf24]/0 via-[#72bf24]/10 to-[#72bf24]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col relative">
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#72bf24] transition-colors">
              {fullName}
            </h3>
            
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${roleColor} mb-4`}>
              <FaBriefcase className="text-xs" />
              {roleName}
            </div>
            
            {member.bio && (
              <div className="relative">
                <FaQuoteLeft className="absolute -top-2 -left-1 text-[#72bf24]/20 text-2xl" />
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 pl-4">
                  {member.bio}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <Link 
              to={`/board/${member.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#72bf24]/10 text-[#72bf24] rounded-full text-sm font-medium hover:bg-[#72bf24] hover:text-white transition-all duration-300 group/btn"
            >
              {messageLabel}
              <FaChevronRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* ============================================================
            HERO HEADER
            ============================================================ */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 pb-8 border-b border-gray-200 gap-6">
          <div className="lg:w-2/3">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-[#72bf24] font-medium text-sm transition-colors mb-6 group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#72bf24]/10 border border-[#72bf24]/20 rounded-full text-[#72bf24] text-sm font-medium">
                {activeCategory === 'board' ? <FaUsers className="text-[#72bf24]" /> : <FaBuilding className="text-[#72bf24]" />}
                {activeCategory === 'board' ? 'Board of Advisors' : 'Management Team'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
              {activeCategory === 'board' ? 'Board of ' : ''}<span className="font-semibold text-[#72bf24]">{activeCategory === 'board' ? 'Advisors' : 'Management Team'}</span>
            </h1>
            
            <p className="text-lg text-gray-600 font-light max-w-3xl leading-relaxed">
              {activeCategory === 'board' 
                ? 'Meet the visionaries and industry leaders guiding Satesoft\'s mission to transform Africa\'s digital landscape.'
                : 'Meet the executive leaders driving Satesoft\'s day-to-day operations and strategic growth across Africa.'}
            </p>
          </div>
          
          <div className="lg:w-1/3 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, role, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#72bf24] focus:border-transparent transition-all"
                aria-label="Search board members"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-x-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-x-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================
            CATEGORY BUTTONS
            ============================================================ */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button
            onClick={() => setActiveCategory('board')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              activeCategory === 'board'
                ? 'bg-[#72bf24] text-white shadow-lg shadow-[#72bf24]/30 scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#72bf24]/30 hover:text-[#72bf24] hover:scale-105'
            }`}
          >
            <FaUsers className="text-sm" />
            Board of Advisors
          </button>
          <button
            onClick={() => setActiveCategory('management')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              activeCategory === 'management'
                ? 'bg-[#72bf24] text-white shadow-lg shadow-[#72bf24]/30 scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#72bf24]/30 hover:text-[#72bf24] hover:scale-105'
            }`}
          >
            <FaBuilding className="text-sm" />
            Management Team
          </button>
        </div>

        {/* ============================================================
            MEMBERS GRID
            ============================================================ */}
        {filteredAdvisors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAdvisors.map((advisor, index) => {
              const fullName = `${advisor.firstName || ''} ${advisor.lastName || ''}`.trim();
              const roleName = getRoleName(advisor.roleId);
              const roleColor = getRoleColor(advisor.roleId);
              const messageLabel = `Message from ${advisor.firstName || 'member'}`;
              
              return (
                <div 
                  key={advisor.id} 
                  className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Animated gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#72bf24]/0 via-[#72bf24]/10 to-[#72bf24]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Content */}
                  <div className="p-4 md:p-5 flex flex-col relative">
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 group-hover:text-[#72bf24] transition-colors">
                        {fullName}
                      </h3>
                      
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${roleColor} mb-3`}>
                        <FaBriefcase className="text-[10px]" />
                        {roleName}
                      </div>
                      
                      {advisor.bio && (
                        <div className="relative">
                          <FaQuoteLeft className="absolute -top-1 -left-0.5 text-[#72bf24]/20 text-lg" />
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 pl-3">
                            {advisor.bio}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                      <Link 
                        to={`/board/${advisor.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#72bf24]/10 text-[#72bf24] rounded-full text-xs font-medium hover:bg-[#72bf24] hover:text-white transition-all duration-300 group/btn"
                      >
                        {messageLabel}
                        <FaChevronRight className="text-[10px] group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No members found</h3>
            <p className="text-gray-400 font-light">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("board"); }}
              className="mt-4 text-[#72bf24] hover:text-[#62a71e] font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ============================================================
            CTA SECTION
            ============================================================ */}
        <div className="mt-16 p-8 bg-gradient-to-br from-[#72bf24]/5 to-white rounded-3xl border border-[#72bf24]/10 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#72bf24]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart className="text-2xl text-[#72bf24]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Interested in joining our team?</h3>
            <p className="text-gray-500 font-light mb-6">
              We're always looking for visionary leaders, innovative thinkers, and passionate professionals to join our advisory board and management team.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#72bf24] text-white font-semibold rounded-xl hover:bg-[#62a71e] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              Get in Touch
              <FaChevronRight className="text-sm" />
            </Link>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default Board;
