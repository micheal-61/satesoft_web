import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRocket, FaCalendar, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import ActivityCalendar from './ActivityCalendar';

const MilestoneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMilestone = async () => {
      try {
        const [milestoneRes, activitiesRes] = await Promise.all([
          fetch(`/api/milestones/${id}?_t=${Date.now()}`),
          fetch(`/api/milestones/${id}/activities?_t=${Date.now()}`)
        ]);
        
        if (milestoneRes.ok) {
          const milestoneData = await milestoneRes.json();
          setMilestone(milestoneData);
        } else {
          setError('Milestone not found.');
        }
        
        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData);
        }
      } catch (err) {
        setError('Failed to load milestone.');
      } finally {
        setLoading(false);
      }
    };
    fetchMilestone();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#72bf24] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-gray-600 font-light">Loading milestone...</p>
        </div>
      </div>
    );
  }

  if (error || !milestone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FaRocket className="text-6xl text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-gray-900 mb-2">Milestone Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The milestone you are looking for does not exist.'}</p>
          <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-[#72bf24] text-white font-bold rounded-lg hover:bg-[#62a71e] transition-all">
            <FaArrowLeft />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#72bf24] transition-colors mb-8">
          <FaArrowLeft />
          <span>Back to Our Journey</span>
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden max-w-5xl mx-auto">
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#72bf24]/20 bg-gradient-to-r from-[#72bf24]/5 to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <FaRocket className="text-2xl text-[#72bf24]" />
              <span className="text-sm font-semibold uppercase tracking-wider text-[#72bf24]">
                Milestone
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900">{milestone.title}</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-2">
              <FaCalendar className="text-[#72bf24]" />
              <span className="font-light text-lg">{milestone.year}</span>
            </div>
          </div>

          {/* About Section */}
          <div className="px-8 py-6">
            <h2 className="text-xl font-light text-gray-900 mb-4">About this milestone</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {milestone.description || 'No detailed description provided for this milestone.'}
            </p>
            {milestone.blogSlug && (
              <div className="mt-4">
                <Link
                  to={`/blog/${milestone.blogSlug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#72bf24]/10 text-[#72bf24] rounded-full text-sm font-medium hover:bg-[#72bf24] hover:text-white transition-all duration-300"
                >
                  <FaExternalLinkAlt className="text-xs" />
                  Read Related Blog Post
                </Link>
              </div>
            )}
          </div>

          {/* Activities Section */}
          <div className="px-8 py-6 border-t border-gray-100">
            <h2 className="text-xl font-light text-gray-900 mb-6">Monthly Activities</h2>
            {activities.filter(a => !a.activityDate).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.filter(a => !a.activityDate).map((activity, idx) => (
                  <Link
                    key={activity.id || idx}
                    to={`/milestone/${id}/month/${encodeURIComponent(activity.month)}`}
                    className="block bg-white rounded-xl border border-[#72bf24]/30 shadow-sm hover:shadow-lg hover:border-[#72bf24] transition-all duration-300 overflow-hidden cursor-pointer group border-r-2 border-b-2"
                    style={{ borderRightColor: '#72bf24', borderBottomColor: '#72bf24' }}
                  >
                    <div className="px-4 py-3 border-b border-[#72bf24]/10 bg-gradient-to-r from-[#72bf24]/5 to-transparent">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-[#72bf24] text-sm" />
                        <span className="text-xs font-normal text-[#72bf24] uppercase tracking-wider">{activity.month}</span>
                      </div>
                      <h3 className="text-sm font-normal text-gray-900 mt-1 group-hover:text-[#72bf24] transition-colors">{activity.title}</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{activity.description || 'No description provided.'}</p>
                      {(activity.blogSlug || milestone?.blogSlug) && (
                        <div className="mt-3">
                          <Link
                            to={`/blog/${activity.blogSlug || milestone.blogSlug}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#72bf24]/10 text-[#72bf24] rounded-full text-xs font-medium hover:bg-[#72bf24] hover:text-white transition-all duration-300"
                          >
                            <FaExternalLinkAlt className="text-[10px]" />
                            Read Blog Post
                          </Link>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaRocket className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No monthly activities recorded for this milestone yet.</p>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#72bf24] text-white font-bold rounded-lg hover:bg-[#62a71e] transition-all"
            >
              <FaArrowLeft />
              Back to Our Journey
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneDetail;