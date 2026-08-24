import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaLinkedin, FaTwitter, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';

const safeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('data:')) return trimmed;
  return '/' + trimmed;
};

const AdvisorDetail = () => {
  const { id } = useParams();
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvisor = async () => {
      try {
        const response = await fetch(`/api/advisors/${id}`);
        if (!response.ok) throw new Error('Failed to fetch advisor');
        const data = await response.json();
        setAdvisor(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#72bf24] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500 font-light animate-pulse">Loading message...</p>
        </div>
      </div>
    );
  }

  if (error || !advisor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to load message</h3>
          <p className="text-gray-500">{error || 'The message you are looking for does not exist.'}</p>
          <Link to="/board" className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#72bf24] text-white font-semibold rounded-lg hover:bg-[#62a71e] transition-all">
            <FaArrowLeft />
            Back to Board
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${advisor.firstName || ''} ${advisor.lastName || ''}`.trim();
  const roleName = advisor.roleTitle || advisor.roleName || 'Advisor';
  const imageSrc = safeImageUrl(advisor.imageUrl);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <Link to="/board" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#72bf24] transition-colors mb-6 text-sm">
          <FaArrowLeft />
          <span>Back to Board</span>
        </Link>

        <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#72bf24]/10 via-[#72bf24]/5 to-white px-6 py-5 border-b border-[#72bf24]/10 flex items-center gap-4">
            {imageSrc && (
              <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img 
                  src={imageSrc} 
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{fullName}</h1>
              <p className="text-base text-[#72bf24] font-medium">{roleName}</p>
            </div>
          </div>

            {/* Message Section */}
            <div className="px-6 py-6">
              <div className="flex items-center gap-2 mb-4">
                <FaQuoteLeft className="text-[#72bf24] text-lg" />
                <h2 className="text-xl font-bold text-gray-900">Message from {advisor.firstName || 'Member'}</h2>
              </div>
              
              <div className="bg-gradient-to-br from-[#72bf24]/5 to-white rounded-xl p-6 border border-[#72bf24]/10">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {advisor.bio || advisor.message || 'No message provided.'}
                </p>
              </div>

              {advisor.message && advisor.bio && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Additional Message</h3>
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{advisor.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <Link to="/board" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#72bf24] transition-colors text-sm">
                <FaArrowLeft />
                Back to Board
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FaQuoteRight className="text-[#72bf24]" />
                <span>SATESOFT Leadership</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorDetail;
