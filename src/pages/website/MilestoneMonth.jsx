import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCalendarAlt, FaCheckCircle, FaRocket } from 'react-icons/fa';

const MilestoneMonth = () => {
  const { id, month } = useParams();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
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
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (month) {
      const date = new Date(month + ' 1, 2000');
      if (!isNaN(date.getTime())) {
        setCurrentDate(date);
      }
    }
  }, [month]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const activitiesByDate = {};
  activities.forEach(activity => {
    if (activity.activityDate) {
      const date = new Date(activity.activityDate);
      const activityMonth = monthNames[date.getMonth()];
      if (activityMonth.toLowerCase() === month?.toLowerCase()) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!activitiesByDate[key]) {
          activitiesByDate[key] = [];
        }
        activitiesByDate[key].push(activity);
      }
    }
  });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    navigate(`/milestone/${id}/date/${dateStr}`);
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasActivities = activitiesByDate[dateStr];
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-12 w-full flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 relative
            ${hasActivities 
              ? 'bg-[#72bf24] text-white hover:bg-[#62a71e] cursor-pointer shadow-md hover:shadow-lg' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
            }`}
        >
          <span>{day}</span>
          {hasActivities && (
            <span className="text-[10px] mt-0.5">{hasActivities.length} {hasActivities.length === 1 ? 'activity' : 'activities'}</span>
          )}
        </button>
      );
    }
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#72bf24] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
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
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#72bf24] text-white font-bold rounded-lg hover:bg-[#62a71e] transition-all">
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
        <Link to={`/milestone/${id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-[#72bf24] transition-colors mb-8">
          <FaArrowLeft />
          <span>Back to {milestone.title}</span>
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
          <div className="px-8 py-6 border-b border-[#72bf24]/20 bg-gradient-to-r from-[#72bf24]/5 to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <FaCalendarAlt className="text-2xl text-[#72bf24]" />
              <span className="text-sm font-semibold uppercase tracking-wider text-[#72bf24]">
                {month}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900">{milestone.title} - {month}</h1>
            <p className="text-gray-600 mt-1">
              Select a highlighted date to view activities
            </p>
          </div>

          <div className="p-6 md:p-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaArrowLeft className="text-gray-600" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaArrowRight className="text-gray-600" />
                </button>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="h-10 flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {renderDays()}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#72bf24] rounded"></span>
                <span>Has activities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-gray-100 rounded border border-gray-200"></span>
                <span>No activities</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneMonth;
