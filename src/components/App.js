import React, { useState, useEffect } from 'react';

const EventTrackerCalendar = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  
  const isPastEvent = (date) => {
    const eventDate = new Date(date);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return eventDate < todayStart;
  };

  const isUpcomingEvent = (date) => {
    const eventDate = new Date(date);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return eventDate >= todayStart;
  };

  const getFilteredEvents = () => {
    switch (filter) {
      case 'Past':
        return events.filter(event => isPastEvent(event.date));
      case 'Upcoming':
        return events.filter(event => isUpcomingEvent(event.date));
      default:
        return events;
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonth.getDate() - i)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day)
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day)
      });
    }

    return days;
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return getFilteredEvents().filter(event => formatDate(new Date(event.date)) === dateStr);
  };

  const handleDateClick = (date) => {
    const existingEvents = getEventsForDate(date);
    
    if (existingEvents.length > 0) {
      setSelectedEvent(existingEvents[0]);
      setShowEventPopup(true);
    } else {
      setSelectedDate(date);
      setEventTitle('');
      setEventLocation('');
      setShowCreatePopup(true);
    }
  };

  const handleCreateEvent = () => {
    if (eventTitle.trim() && eventLocation.trim()) {
      const newEvent = {
        id: Date.now(),
        title: eventTitle,
        location: eventLocation,
        date: selectedDate,
      };
      setEvents([...events, newEvent]);
      setShowCreatePopup(false);
      setEventTitle('');
      setEventLocation('');
    }
  };

  const handleEditEvent = () => {
    setIsEditing(true);
    setEventTitle(selectedEvent.title);
    setEventLocation(selectedEvent.location);
    setShowEventPopup(false);
  };

  const handleSaveEdit = () => {
    if (eventTitle.trim() && eventLocation.trim()) {
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, title: eventTitle, location: eventLocation }
          : event
      ));
      setIsEditing(false);
      setEventTitle('');
      setEventLocation('');
    }
  };

  const handleDeleteEvent = () => {
    setEvents(events.filter(event => event.id !== selectedEvent.id));
    setShowEventPopup(false);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const closePopups = () => {
    setShowCreatePopup(false);
    setShowEventPopup(false);
    setIsEditing(false);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Event Tracker Calendar</h1>
          <div className="flex gap-2">
            <button
              className="btn px-4 py-2 rounded-md text-white font-medium transition-colors"
              onClick={() => setFilter('All')}
              style={{
                backgroundColor: filter === 'All' ? '#3b82f6' : '#6b7280'
              }}
            >
              All
            </button>
            <button
              className="btn px-4 py-2 rounded-md text-white font-medium transition-colors"
              onClick={() => setFilter('Past')}
              style={{
                backgroundColor: filter === 'Past' ? '#dc2626' : '#6b7280'
              }}
            >
              Past
            </button>
            <button
              className="btn px-4 py-2 rounded-md text-white font-medium transition-colors"
              onClick={() => setFilter('Upcoming')}
              style={{
                backgroundColor: filter === 'Upcoming' ? '#059669' : '#6b7280'
              }}
            >
              Upcoming
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => navigateMonth(-1)}
          >
            ← Prev
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => navigateMonth(1)}
          >
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-100">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((dayInfo, index) => {
              const dayEvents = getEventsForDate(dayInfo.date);
              const isToday = formatDate(dayInfo.date) === formatDate(today);
              
              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !dayInfo.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'bg-blue-50' : ''}`}
                  onClick={() => dayInfo.isCurrentMonth && handleDateClick(dayInfo.date)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {dayInfo.day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className="rbc-event text-xs px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: isPastEvent(event.date) 
                            ? 'rgb(222, 105, 135)' 
                            : 'rgb(140, 189, 76)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setShowEventPopup(true);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Event Popup */}
        {showCreatePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="mm-popup__box bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="mm-popup__box__header flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Create Event</h3>
                <button
                  onClick={closePopups}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="mm-popup__box__body space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Event Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Event Location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
              </div>
              <div className="mm-popup__box__footer flex justify-between">
                <div className="mm-popup__box__footer__left-space">
                  <button 
                    className="mm-popup__btn px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    onClick={closePopups}
                  >
                    Cancel
                  </button>
                </div>
                <div className="mm-popup__box__footer__right-space">
                  <button 
                    className="mm-popup__btn px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    onClick={handleCreateEvent}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Popup */}
        {showEventPopup && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="mm-popup__box bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="mm-popup__box__header flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Event 3</h3>
                <button
                  onClick={closePopups}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="mm-popup__box__body space-y-2 mb-6">
                <div><span className="font-medium">Date:</span> {new Date(selectedEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div><span className="font-medium">Location:</span> {selectedEvent.location}</div>
              </div>
              <div className="mm-popup__box__footer flex justify-between">
                <div className="mm-popup__box__footer__left-space">
                  <button 
                    className="mm-popup__btn mm-popup__btn--info px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    onClick={handleEditEvent}
                  >
                    Edit
                  </button>
                </div>
                <div className="mm-popup__box__footer__right-space">
                  <button 
                    className="mm-popup__btn mm-popup__btn--danger px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    onClick={handleDeleteEvent}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Event Popup */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="mm-popup__box bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="mm-popup__box__header flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Event</h3>
                <button
                  onClick={closePopups}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="mm-popup__box__body space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Event Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Event Location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
              </div>
              <div className="mm-popup__box__footer flex justify-between">
                <div className="mm-popup__box__footer__left-space">
                  <button 
                    className="mm-popup__btn px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    onClick={closePopups}
                  >
                    Cancel
                  </button>
                </div>
                <div className="mm-popup__box__footer__right-space">
                  <button 
                    className="mm-popup__btn px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    onClick={handleSaveEdit}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTrackerCalendar;
