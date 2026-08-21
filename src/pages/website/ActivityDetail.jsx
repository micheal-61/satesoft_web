import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaRocket, FaCalendar, FaCheckCircle } from 'react-icons/fa';

const ActivityDetail = () => {
  const { milestoneId, activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [milestoneRes, activityRes] = await Promise.all([
          fetch(`/api/milestones/${milestoneId}`),
          fetch(`/api/milestones/${milestoneId}/activities/${activityId}`)
        ]);

        if (milestoneRes.ok) {
          const milestoneData = await milestoneRes.json();
          setMilestone(milestoneData);
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivity(activityData);
        } else {
          setError('Activity not found.');
        }
      } catch (err) {
        setError('Failed to load activity details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [milestoneId, activityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#72bf24] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FaRocket className="text-6xl text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-gray-900 mb-2">Activity Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The activity you are looking for does not exist.'}</p>
          <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-[#72bf24] text-white font-bold rounded-lg hover:bg-[#62a71e] transition-all">
            <FaArrowLeft />
            Back to Journey
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-12">
        <Link to={`/milestone/${milestoneId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-[#72bf24] transition-colors mb-8">
          <FaArrowLeft />
          <span>Back to {milestone?.title || 'Milestone'}</span>
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#72bf24]/20 bg-gradient-to-r from-[#72bf24]/5 to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <FaCheckCircle className="text-2xl text-[#72bf24]" />
              <span className="text-sm font-semibold uppercase tracking-wider text-[#72bf24]">
                {activity.month}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900">{activity.title}</h1>
            {milestone && (
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <FaCalendar className="text-[#72bf24]" />
                <span className="font-light text-lg">{milestone.year} - {milestone.title}</span>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="px-8 py-6">
            <h2 className="text-xl font-light text-gray-900 mb-4">Activity Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
              {activity.description || 'No detailed description provided for this activity.'}
            </p>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <Link to={`/milestone/${milestoneId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-[#72bf24] transition-colors">
              <FaArrowLeft />
              <span>Back to {milestone?.title || 'Milestone'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;
