import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

const ActivityCalendar = ({ activities, milestoneId, year }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(Number(year) || new Date().getFullYear(), 0, 1));

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
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (!activitiesByDate[key]) {
        activitiesByDate[key] = [];
      }
      activitiesByDate[key].push(activity);
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
    if (activitiesByDate[dateStr]) {
      navigate(`/milestone/${milestoneId}/date/${dateStr}`);
    }
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasActivities = activitiesByDate[dateStr];
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 relative
            ${hasActivities 
              ? 'bg-[#72bf24] text-white hover:bg-[#62a71e] cursor-pointer shadow-md hover:shadow-lg' 
              : 'text-gray-400 hover:text-gray-600 cursor-default'
            }`}
        >
          {day}
          {hasActivities && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
          )}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden max-w-2xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaChevronLeft className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-[#72bf24]" />
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaChevronRight className="text-gray-600" />
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="h-10 flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderDays()}
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          <span className="inline-block w-3 h-3 bg-[#72bf24] rounded-full mr-1 align-middle"></span>
          Dates with activities are clickable
        </p>
      </div>
    </div>
  );
};

export default ActivityCalendar;
