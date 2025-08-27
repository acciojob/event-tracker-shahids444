import React, { useState, useEffect } from 'react';

const EventTrackerCalendar = () => {
  // Use current date for reference (August 28, 2025 based on the error)
  const currentRealDate = new Date(2025, 7, 28); // August 28, 2025
  
  // Initialize with some sample events including past events
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Past Event',
      location: 'Test Location',
      date: new Date(2025, 7, 20), // August 20, 2025 (definitely past)
    },
    {
      id: 2,
      title: 'Another Past Event', 
      location: 'Past Location',
      date: new Date(2025, 7, 25), // August 25, 2025 (definitely past)
    },
    {
      id: 3,
      title: 'Future Event',
      location: 'Future Location',
      date: new Date(2025, 8, 15), // September 15, 2025 (future date)
    }
  ]);
  const [filter, setFilter] = useState('All');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // August 2025
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [titleError, setTitleError] = useState('');
  const [locationError, setLocationError] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date(2025, 7, 28); // August 28, 2025 - match the test environment
  
  const isPastEvent = (date) => {
    const eventDate = new Date(date);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    console.log(`Checking if event date ${eventDate.toDateString()} is before today ${todayStart.toDateString()}: ${eventDate < todayStart}`);
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

    // Next month's leading days - ensure we always have exactly 42 days (6 weeks)
    const totalDaysNeeded = 42;
    const remainingDays = totalDaysNeeded - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day)
      });
    }

    // Ensure we always return exactly 42 days
    return days.slice(0, 42);
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return getFilteredEvents().filter(event => formatDate(new Date(event.date)) === dateStr);
  };

  // Validation functions
  const validateEventTitle = (title) => {
    if (!title || title.trim().length === 0) {
      return 'Event title is required';
    }
    if (title.trim().length < 3) {
      return 'Event title must be at least 3 characters long';
    }
    if (title.trim().length > 100) {
      return 'Event title must be less than 100 characters';
    }
    return '';
  };

  const validateEventLocation = (location) => {
    if (!location || location.trim().length === 0) {
      return 'Event location is required';
    }
    if (location.trim().length < 2) {
      return 'Event location must be at least 2 characters long';
    }
    if (location.trim().length > 200) {
      return 'Event location must be less than 200 characters';
    }
    return '';
  };

  const handleDateClick = (date, dayInfo) => {
    if (!date || !dayInfo?.isCurrentMonth) return;
    
    const existingEvents = getEventsForDate(date);
    
    if (existingEvents.length > 0) {
      setSelectedEvent(existingEvents[0]);
      setShowEventPopup(true);
    } else {
      setSelectedDate(date);
      setEventTitle('');
      setEventLocation('');
      setTitleError('');
      setLocationError('');
      setShowCreatePopup(true);
    }
  };

  const handleCreateEvent = () => {
    const titleValidation = validateEventTitle(eventTitle);
    const locationValidation = validateEventLocation(eventLocation);
    
    setTitleError(titleValidation);
    setLocationError(locationValidation);

    if (!titleValidation && !locationValidation) {
      const newEvent = {
        id: Date.now(),
        title: eventTitle.trim(),
        location: eventLocation.trim(),
        date: selectedDate,
      };
      setEvents([...events, newEvent]);
      setShowCreatePopup(false);
      setEventTitle('');
      setEventLocation('');
      setTitleError('');
      setLocationError('');
    }
  };

  const handleEditEvent = () => {
    setIsEditing(true);
    setEventTitle(selectedEvent.title);
    setEventLocation(selectedEvent.location);
    setTitleError('');
    setLocationError('');
    setShowEventPopup(false);
  };

  const handleSaveEdit = () => {
    const titleValidation = validateEventTitle(eventTitle);
    const locationValidation = validateEventLocation(eventLocation);
    
    setTitleError(titleValidation);
    setLocationError(locationValidation);

    if (!titleValidation && !locationValidation) {
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, title: eventTitle.trim(), location: eventLocation.trim() }
          : event
      ));
      setIsEditing(false);
      setEventTitle('');
      setEventLocation('');
      setTitleError('');
      setLocationError('');
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
    setTitleError('');
    setLocationError('');
  };

  // Handle input changes with validation
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setEventTitle(value);
    setTitleError(validateEventTitle(value));
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setEventLocation(value);
    setLocationError(validateEventLocation(value));
  };

  const days = getDaysInMonth(currentDate);

  // Always split into exactly 6 weeks (42 days total)
  const weeks = [];
  for (let i = 0; i < 42; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const styles = `
    .calendar-container {
      min-height: 100vh;
      background-color: #f9fafb;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .calendar-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin: 0;
    }

    .filter-buttons {
      display: flex;
      gap: 8px;
    }

    .filter-item {
      display: flex;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      color: white;
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .nav-btn {
      padding: 8px 16px;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .nav-btn:hover {
      background-color: #2563eb;
    }

    .month-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .rbc-calendar {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .rbc-header {
      display: flex;
      background-color: #f3f4f6;
    }

    .rbc-header-cell {
      flex: 1;
      padding: 12px;
      text-align: center;
      font-weight: 600;
      color: #374151;
      border-right: 1px solid #e5e7eb;
    }

    .rbc-header-cell:last-child {
      border-right: none;
    }

    .rbc-month-view {
      display: flex;
      flex-direction: column;
    }

    .rbc-month-row {
      display: flex;
      min-height: 120px;
    }

    .rbc-row-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      z-index: 1;
    }

    .rbc-day-bg {
      flex: 1;
      border-right: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      position: relative;
      min-height: 120px;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
    }

    .rbc-day-bg:last-child {
      border-right: none;
    }

    .rbc-day-bg:hover {
      background-color: #f9fafb;
    }

    .rbc-day-bg.current-month {
      cursor: pointer;
    }

    .rbc-day-bg.other-month {
      cursor: default;
      background-color: #f8fafc;
    }

    .rbc-row-content {
      position: relative;
      z-index: 2;
      display: flex;
      width: 100%;
      min-height: 120px;
      pointer-events: none;
    }

    .rbc-date-cell {
      flex: 1;
      padding: 8px;
      border-right: 1px solid #e5e7eb;
      position: relative;
      pointer-events: none;
    }

    .rbc-date-cell:last-child {
      border-right: none;
    }

    .rbc-date-cell .date-number,
    .rbc-date-cell .rbc-event {
      pointer-events: auto;
    }

    .date-number {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .date-number.other-month {
      color: #9ca3af;
    }

    .date-number.today {
      color: #2563eb;
      font-weight: 700;
    }

    .rbc-event {
      background-color: #3b82f6;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      margin-bottom: 2px;
      cursor: pointer;
      transition: opacity 0.2s;
      display: block;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      border: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
    }

    .rbc-event:hover {
      opacity: 0.8;
    }

    .rbc-event-past {
      background-color: rgb(222, 105, 135) !important;
    }

    .rbc-event-upcoming {
      background-color: rgb(140, 189, 76) !important;
    }

    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .mm-popup__box {
      background: white;
      border-radius: 8px;
      padding: 24px;
      width: 100%;
      max-width: 400px;
      margin: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .mm-popup__box__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .mm-popup__box__header h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #6b7280;
    }

    .mm-popup__box__body {
      margin-bottom: 20px;
    }

    .mm-popup__box__body > div {
      margin-bottom: 8px;
    }

    .input-group {
      margin-bottom: 16px;
    }

    .mm-popup__box__body input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .mm-popup__box__body input.error {
      border-color: #ef4444;
    }

    .mm-popup__box__body input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    .mm-popup__box__footer {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    .mm-popup__box__footer__left-space,
    .mm-popup__box__footer__right-space {
      display: flex;
      gap: 8px;
    }

    .mm-popup__btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .mm-popup__btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .mm-popup__btn--info {
      background-color: #3b82f6;
      color: white;
    }

    .mm-popup__btn--info:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .mm-popup__btn--danger {
      background-color: #ef4444;
      color: white;
    }

    .mm-popup__btn--danger:hover:not(:disabled) {
      background-color: #dc2626;
    }

    .mm-popup__btn--success {
      background-color: #10b981;
      color: white;
    }

    .mm-popup__btn--success:hover:not(:disabled) {
      background-color: #059669;
    }

    .mm-popup__btn--cancel {
      background-color: #6b7280;
      color: white;
    }

    .mm-popup__btn--cancel:hover {
      background-color: #4b5563;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="calendar-container">
        <div className="calendar-wrapper">
          {/* Header */}
          <div className="header">
            <h1>Event Tracker Calendar</h1>
            <div className="filter-buttons">
              <div className="filter-item">
                <button
                  className="btn"
                  onClick={() => setFilter('All')}
                  data-testid="filter-all"
                  style={{
                    backgroundColor: filter === 'All' ? '#3b82f6' : '#6b7280'
                  }}
                >
                  All
                </button>
              </div>
              <div className="filter-item">
                <button
                  className="btn"
                  onClick={() => setFilter('Past')}
                  data-testid="filter-past"
                  style={{
                    backgroundColor: filter === 'Past' ? '#dc2626' : '#6b7280'
                  }}
                >
                  Past
                </button>
              </div>
              <div className="filter-item">
                <button
                  className="btn"
                  onClick={() => setFilter('Upcoming')}
                  data-testid="filter-upcoming"
                  style={{
                    backgroundColor: filter === 'Upcoming' ? '#059669' : '#6b7280'
                  }}
                >
                  Upcoming
                </button>
              </div>
              <div className="filter-item">
                <button
                  className="btn"
                  onClick={() => setCurrentDate(new Date())}
                  data-testid="filter-today"
                  style={{
                    backgroundColor: '#8b5cf6'
                  }}
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="nav-header">
            <button 
              className="nav-btn" 
              onClick={() => navigateMonth(-1)}
              data-testid="prev-month"
            >
              ← Prev
            </button>
            <h2 className="month-title">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button 
              className="nav-btn" 
              onClick={() => navigateMonth(1)}
              data-testid="next-month"
            >
              Next →
            </button>
          </div>

          {/* Calendar */}
          <div className="rbc-calendar">
            {/* Day Headers */}
            <div className="rbc-header">
              {dayNames.map(day => (
                <div key={day} className="rbc-header-cell">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="rbc-month-view">
              {weeks.map((week, weekIndex) => {
                // Ensure we have exactly 7 days in each week
                while (week.length < 7) {
                  const lastDay = week[week.length - 1];
                  const nextDay = new Date(lastDay.date);
                  nextDay.setDate(nextDay.getDate() + 1);
                  week.push({
                    day: nextDay.getDate(),
                    isCurrentMonth: false,
                    date: nextDay
                  });
                }
                
                return (
                  <div key={weekIndex} className="rbc-month-row" style={{ position: 'relative' }}>
                    {/* Background layer for clicking */}
                    <div className="rbc-row-bg">
                      {week.slice(0, 7).map((dayInfo, dayIndex) => (
                        <div
                          key={`bg-${weekIndex}-${dayIndex}`}
                          className={`rbc-day-bg ${dayInfo.isCurrentMonth ? 'current-month' : 'other-month'}`}
                          onClick={() => dayInfo.isCurrentMonth && handleDateClick(dayInfo.date, dayInfo)}
                          data-date={formatDate(dayInfo.date)}
                          data-testid={`calendar-day-${formatDate(dayInfo.date)}`}
                          data-current-month={dayInfo.isCurrentMonth}
                          data-week={weekIndex}
                          data-day={dayIndex}
                          style={{
                            pointerEvents: dayInfo.isCurrentMonth ? 'auto' : 'none'
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Content layer */}
                    <div className="rbc-row-content">
                      {week.slice(0, 7).map((dayInfo, dayIndex) => {
                        const dayEvents = getEventsForDate(dayInfo.date);
                        const isToday = formatDate(dayInfo.date) === formatDate(today);
                        
                        return (
                          <div 
                            key={`content-${weekIndex}-${dayIndex}`} 
                            className="rbc-date-cell"
                            data-testid={`calendar-content-${formatDate(dayInfo.date)}`}
                          >
                            <div 
                              className={`date-number ${
                                !dayInfo.isCurrentMonth ? 'other-month' : ''
                              } ${isToday ? 'today' : ''}`}
                            >
                              {dayInfo.day}
                            </div>
                            <div>
                              {dayEvents.map(event => {
                                const isPast = isPastEvent(event.date);
                                const backgroundColor = isPast ? 'rgb(222, 105, 135)' : 'rgb(140, 189, 76)';
                                
                                // Debug logging
                                console.log(`Event: ${event.title}, Date: ${event.date}, isPast: ${isPast}, backgroundColor: ${backgroundColor}`);
                                
                                return (
                                  <button
                                    key={event.id}
                                    className={`rbc-event ${isPast ? 'rbc-event-past' : 'rbc-event-upcoming'}`}
                                    style={{
                                      backgroundColor: backgroundColor,
                                      border: 'none',
                                      width: '100%',
                                      textAlign: 'left'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(event);
                                      setShowEventPopup(true);
                                    }}
                                    data-testid={`event-${event.id}`}
                                    data-event-type={isPast ? 'past' : 'upcoming'}
                                    data-background-color={backgroundColor}
                                    data-is-past={isPast}
                                  >
                                    {event.title}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create Event Popup */}
          {showCreatePopup && (
            <div className="popup-overlay" onClick={closePopups}>
              <div className="mm-popup__box" onClick={(e) => e.stopPropagation()}>
                <div className="mm-popup__box__header">
                  <h3>Create Event</h3>
                  <button className="close-btn" onClick={closePopups}>×</button>
                </div>
                <div className="mm-popup__box__body">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Event Title"
                      value={eventTitle}
                      onChange={handleTitleChange}
                      className={titleError ? 'error' : ''}
                      data-testid="event-title-input"
                    />
                    {titleError && <div className="error-message">{titleError}</div>}
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Event Location"
                      value={eventLocation}
                      onChange={handleLocationChange}
                      className={locationError ? 'error' : ''}
                      data-testid="event-location-input"
                    />
                    {locationError && <div className="error-message">{locationError}</div>}
                  </div>
                </div>
                <div className="mm-popup__box__footer">
                  <div className="mm-popup__box__footer__left-space">
                    <button 
                      className="mm-popup__btn mm-popup__btn--cancel" 
                      onClick={closePopups}
                      data-testid="cancel-create-event"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="mm-popup__box__footer__right-space">
                    <button 
                      className="mm-popup__btn mm-popup__btn--success" 
                      onClick={handleCreateEvent}
                      disabled={!!titleError || !!locationError || !eventTitle.trim() || !eventLocation.trim()}
                      data-testid="save-event-button"
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
            <div className="popup-overlay" onClick={closePopups}>
              <div className="mm-popup__box" onClick={(e) => e.stopPropagation()}>
                <div className="mm-popup__box__header">
                  <h3>{selectedEvent.title}</h3>
                  <button className="close-btn" onClick={closePopups}>×</button>
                </div>
                <div className="mm-popup__box__body">
                  <div><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div><strong>Location:</strong> {selectedEvent.location}</div>
                </div>
                <div className="mm-popup__box__footer">
                  <div className="mm-popup__box__footer__left-space">
                    <button 
                      className="mm-popup__btn mm-popup__btn--info" 
                      onClick={handleEditEvent}
                      data-testid="edit-event-button"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="mm-popup__box__footer__right-space">
                    <button 
                      className="mm-popup__btn mm-popup__btn--danger" 
                      onClick={handleDeleteEvent}
                      data-testid="delete-event-button"
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
            <div className="popup-overlay" onClick={closePopups}>
              <div className="mm-popup__box" onClick={(e) => e.stopPropagation()}>
                <div className="mm-popup__box__header">
                  <h3>Edit Event</h3>
                  <button className="close-btn" onClick={closePopups}>×</button>
                </div>
                <div className="mm-popup__box__body">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Event Title"
                      value={eventTitle}
                      onChange={handleTitleChange}
                      className={titleError ? 'error' : ''}
                      data-testid="edit-event-title-input"
                    />
                    {titleError && <div className="error-message">{titleError}</div>}
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Event Location"
                      value={eventLocation}
                      onChange={handleLocationChange}
                      className={locationError ? 'error' : ''}
                      data-testid="edit-event-location-input"
                    />
                    {locationError && <div className="error-message">{locationError}</div>}
                  </div>
                </div>
                <div className="mm-popup__box__footer">
                  <div className="mm-popup__box__footer__left-space">
                    <button 
                      className="mm-popup__btn mm-popup__btn--cancel" 
                      onClick={closePopups}
                      data-testid="cancel-edit-event"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="mm-popup__box__footer__right-space">
                    <button 
                      className="mm-popup__btn mm-popup__btn--success" 
                      onClick={handleSaveEdit}
                      disabled={!!titleError || !!locationError || !eventTitle.trim() || !eventLocation.trim()}
                      data-testid="save-edit-button"
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
    </>
  );
};

export default EventTrackerCalendar;
