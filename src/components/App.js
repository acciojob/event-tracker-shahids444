import React, { useState, useCallback } from 'react';

// Date utility functions to replace moment.js
const dateUtils = {
  format: (date, format) => {
    const d = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (format === 'MMMM YYYY') {
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    if (format === 'MMMM D, YYYY') {
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    if (format === 'YYYY-MM-DD') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    if (format === 'D') {
      return d.getDate().toString();
    }
    return d.toString();
  },
  
  startOfMonth: (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  },
  
  endOfMonth: (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  },
  
  startOfWeek: (date) => {
    const d = new Date(date);
    const day = d.getDay();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
  },
  
  endOfWeek: (date) => {
    const d = new Date(date);
    const day = d.getDay();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (6 - day));
  },
  
  isSameMonth: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
  },
  
  isSameDay: (date1, date2) => {
    return dateUtils.format(date1, 'YYYY-MM-DD') === dateUtils.format(date2, 'YYYY-MM-DD');
  },
  
  isBeforeDay: (date1, date2) => {
    const d1 = new Date(dateUtils.format(date1, 'YYYY-MM-DD'));
    const d2 = new Date(dateUtils.format(date2, 'YYYY-MM-DD'));
    return d1 < d2;
  },
  
  isSameOrAfterDay: (date1, date2) => {
    const d1 = new Date(dateUtils.format(date1, 'YYYY-MM-DD'));
    const d2 = new Date(dateUtils.format(date2, 'YYYY-MM-DD'));
    return d1 >= d2;
  },
  
  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
};

// Mock react-big-calendar components for this demo
const Calendar = ({ localizer, events, startAccessor, endAccessor, titleAccessor, onSelectSlot, onSelectEvent, eventPropGetter, views, defaultView, style }) => {
  const today = new Date();
  const startOfMonth = dateUtils.startOfMonth(today);
  const endOfMonth = dateUtils.endOfMonth(today);
  const startOfCalendar = dateUtils.startOfWeek(startOfMonth);
  const endOfCalendar = dateUtils.endOfWeek(endOfMonth);
  
  const days = [];
  let currentDay = new Date(startOfCalendar);
  
  while (currentDay <= endOfCalendar) {
    days.push(new Date(currentDay));
    currentDay = dateUtils.addDays(currentDay, 1);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div style={style} className="rbc-calendar">
      <div className="rbc-toolbar">
        <span className="rbc-toolbar-label">{dateUtils.format(today, 'MMMM YYYY')}</span>
      </div>
      <div className="rbc-month-view">
        <div className="rbc-month-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="rbc-header" style={{ padding: '8px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', fontWeight: 'bold' }}>{day}</div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="rbc-month-row" style={{ display: 'flex' }}>
            {week.map(day => {
              const dayEvents = events.filter(event => 
                dateUtils.isSameDay(event.start, day)
              );
              
              return (
                <div 
                  key={dateUtils.format(day, 'YYYY-MM-DD')} 
                  className={`rbc-date-cell ${dateUtils.isSameMonth(day, today) ? '' : 'rbc-off-range'}`}
                  onClick={() => onSelectSlot({ start: day, end: day })}
                  style={{ 
                    cursor: 'pointer', 
                    minHeight: '100px', 
                    border: '1px solid #ddd', 
                    padding: '4px',
                    flex: 1,
                    backgroundColor: dateUtils.isSameMonth(day, today) ? 'white' : '#f8f9fa'
                  }}
                >
                  <span className="rbc-date-cell-value" style={{ fontWeight: dateUtils.isSameDay(day, today) ? 'bold' : 'normal' }}>
                    {dateUtils.format(day, 'D')}
                  </span>
                  {dayEvents.map((event, idx) => {
                    const eventStyle = eventPropGetter ? eventPropGetter(event) : {};
                    return (
                      <div
                        key={idx}
                        className="rbc-event"
                        style={{
                          backgroundColor: eventStyle.style?.backgroundColor || '#3174ad',
                          color: 'white',
                          padding: '2px 4px',
                          margin: '1px 0',
                          borderRadius: '3px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          wordBreak: 'break-word'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                      >
                        {event[titleAccessor]}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock Popup component
const Popup = ({ open, closeOnDocumentClick, onClose, children }) => {
  if (!open) return null;
  
  return (
    <div 
      className="mm-popup__overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={closeOnDocumentClick ? onClose : undefined}
    >
      <div 
        className="mm-popup__box"
        style={{
          backgroundColor: 'white',
          borderRadius: '4px',
          padding: '20px',
          minWidth: '300px',
          maxWidth: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const EventTracker = () => {
  const [events, setEvents] = useState([]);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [filter, setFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectSlot = useCallback(({ start }) => {
    setSelectedDate(start);
    setEventTitle('');
    setEventLocation('');
    setShowCreatePopup(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setShowEventPopup(true);
  }, []);

  const handleCreateEvent = () => {
    if (eventTitle.trim()) {
      const newEvent = {
        id: Date.now(),
        title: eventTitle,
        location: eventLocation,
        start: selectedDate,
        end: selectedDate
      };
      setEvents(prev => [...prev, newEvent]);
      setShowCreatePopup(false);
      setEventTitle('');
      setEventLocation('');
    }
  };

  const handleEditEvent = () => {
    setEventTitle(selectedEvent.title);
    setEventLocation(selectedEvent.location);
    setIsEditing(true);
  };

  const handleUpdateEvent = () => {
    if (eventTitle.trim()) {
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, title: eventTitle, location: eventLocation }
          : event
      ));
      setShowEventPopup(false);
      setIsEditing(false);
      setEventTitle('');
      setEventLocation('');
    }
  };

  const handleDeleteEvent = () => {
    setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
    setShowEventPopup(false);
  };

  const eventStyleGetter = (event) => {
    const today = new Date();
    
    if (dateUtils.isBeforeDay(event.start, today)) {
      // Past events - pink background
      return {
        style: {
          backgroundColor: 'rgb(222, 105, 135)'
        }
      };
    } else {
      // Upcoming events - green background
      return {
        style: {
          backgroundColor: 'rgb(140, 189, 76)'
        }
      };
    }
  };

  const getFilteredEvents = () => {
    const today = new Date();
    
    switch (filter) {
      case 'past':
        return events.filter(event => dateUtils.isBeforeDay(event.start, today));
      case 'upcoming':
        return events.filter(event => dateUtils.isSameOrAfterDay(event.start, today));
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Event Tracker Calendar</h1>
      
      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button 
          className="btn"
          onClick={() => setFilter('all')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            backgroundColor: filter === 'all' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          All
        </button>
        <button 
          className="btn"
          onClick={() => setFilter('past')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            backgroundColor: filter === 'past' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Past
        </button>
        <button 
          className="btn"
          onClick={() => setFilter('upcoming')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            backgroundColor: filter === 'upcoming' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Upcoming
        </button>
      </div>

      {/* Calendar */}
      <Calendar
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={['month']}
        defaultView="month"
        style={{ height: '600px', border: '1px solid #ddd', borderRadius: '4px' }}
      />

      {/* Create Event Popup */}
      <Popup
        open={showCreatePopup}
        closeOnDocumentClick
        onClose={() => setShowCreatePopup(false)}
      >
        <div>
          <h3 style={{ marginTop: 0, color: '#333' }}>Create New Event</h3>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Event Title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Event Location"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div className="mm-popup__box__footer">
            <div className="mm-popup__box__footer__right-space">
              <button
                className="mm-popup__btn"
                onClick={handleCreateEvent}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontSize: '14px'
                }}
              >
                Save
              </button>
              <button
                className="mm-popup__btn"
                onClick={() => setShowCreatePopup(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Popup>

      {/* Event Details/Edit/Delete Popup */}
      <Popup
        open={showEventPopup}
        closeOnDocumentClick
        onClose={() => {
          setShowEventPopup(false);
          setIsEditing(false);
          setEventTitle('');
          setEventLocation('');
        }}
      >
        <div>
          {!isEditing ? (
            <>
              <h3 style={{ marginTop: 0, color: '#333' }}>Event Details</h3>
              <p><strong>Title:</strong> {selectedEvent?.title}</p>
              <p><strong>Location:</strong> {selectedEvent?.location}</p>
              <p><strong>Date:</strong> {selectedEvent ? dateUtils.format(selectedEvent.start, 'MMMM D, YYYY') : ''}</p>
              <div style={{ marginTop: '20px' }}>
                <button
                  className="mm-popup__btn mm-popup__btn--info"
                  onClick={handleEditEvent}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px',
                    fontSize: '14px'
                  }}
                >
                  Edit
                </button>
                <button
                  className="mm-popup__btn mm-popup__btn--danger"
                  onClick={handleDeleteEvent}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 style={{ marginTop: 0, color: '#333' }}>Edit Event</h3>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Event Title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Event Location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <button
                  className="mm-popup__btn"
                  onClick={handleUpdateEvent}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px',
                    fontSize: '14px'
                  }}
                >
                  Save
                </button>
                <button
                  className="mm-popup__btn"
                  onClick={() => {
                    setIsEditing(false);
                    setEventTitle('');
                    setEventLocation('');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </Popup>
    </div>
  );
};

export default EventTracker;
