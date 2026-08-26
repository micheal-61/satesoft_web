import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaCheckCircle, FaRocket, FaExternalLinkAlt } from 'react-icons/fa';

const ActivityDateDetail = () => {
  const { id, date } = useParams();
  const [milestone, setMilestone] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const milestoneUrl = `/api/milestones/${id}?_t=${Date.now()}`;
        const activitiesUrl = `/api/milestones/${id}/activities/date/${date}?_t=${Date.now()}`;
        const [milestoneRes, activitiesRes] = await Promise.all([
          fetch(milestoneUrl),
          fetch(activitiesUrl)
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
        } else {
          setError('Activities not found for this date.');
        }
      } catch (err) {
        setError('Failed to load activities.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, date]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#72bf24] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error || !milestone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FaRocket className="text-6xl text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-gray-900 mb-2">Activities Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'No activities found for this date.'}</p>
          <Link to={`/milestone/${id}`} className="inline-flex items-center gap-2 px-6 py-3 bg-[#72bf24] text-white font-bold rounded-lg hover:bg-[#62a71e] transition-all">
            <FaArrowLeft />
            Back to Milestone
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-12">
        <Link to={`/milestone/${id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-[#72bf24] transition-colors mb-8">
          <FaArrowLeft />
          <span>Back to {milestone.title}</span>
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden max-w-5xl mx-auto">
          <div className="px-8 py-6 border-b border-[#72bf24]/20 bg-gradient-to-r from-[#72bf24]/5 to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <FaCalendarAlt className="text-2xl text-[#72bf24]" />
              <span className="text-sm font-semibold uppercase tracking-wider text-[#72bf24]">
                Activities
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900">{formatDate(date)}</h1>
            <p className="text-gray-600 mt-1">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'} on this date
            </p>
          </div>

           <div className="p-8">
             {activities.length > 0 ? (
               <div className="space-y-4">
                 {activities.map((activity) => (
                   <div
                     key={activity.id}
                     className="bg-white rounded-xl border border-[#72bf24]/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-r-2 border-b-2"
                     style={{ borderRightColor: '#72bf24', borderBottomColor: '#72bf24' }}
                   >
                     <div className="px-6 py-4 border-b border-[#72bf24]/10 bg-gradient-to-r from-[#72bf24]/5 to-transparent">
                       <div className="flex items-center gap-2">
                         <FaCheckCircle className="text-[#72bf24]" />
                         <span className="text-sm font-semibold text-[#72bf24] uppercase tracking-wider">{activity.month}</span>
                       </div>
                       <h3 className="text-lg font-semibold text-gray-900 mt-1">{activity.title}</h3>
                     </div>
                     <div className="p-6">
                       <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                         {activity.description || 'No description provided.'}
                       </p>
                        {activity.blogSlug && (
                          <Link
                            to={`/blog/${activity.blogSlug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#72bf24]/10 text-[#72bf24] rounded-full text-sm font-medium hover:bg-[#72bf24] hover:text-white transition-all duration-300"
                          >
                            <FaExternalLinkAlt className="text-xs" />
                            Read Activity Blog Post
                          </Link>
                        )}
                        {milestone.blogSlug && activity.blogSlug !== milestone.blogSlug && (
                          <Link
                            to={`/blog/${milestone.blogSlug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#72bf24]/10 text-[#72bf24] rounded-full text-sm font-medium hover:bg-[#72bf24] hover:text-white transition-all duration-300 ml-2"
                          >
                            <FaExternalLinkAlt className="text-xs" />
                            Read Milestone Blog Post
                          </Link>
                        )}
                        {!activity.blogSlug && milestone.blogSlug && (
                          <Link
                            to={`/blog/${milestone.blogSlug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#72bf24]/10 text-[#72bf24] rounded-full text-sm font-medium hover:bg-[#72bf24] hover:text-white transition-all duration-300 ml-2"
                          >
                            <FaExternalLinkAlt className="text-xs" />
                            Read Month Blog Post
                          </Link>
                        )}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
              <div className="text-center py-12">
                <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No activities recorded for this date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDateDetail;
