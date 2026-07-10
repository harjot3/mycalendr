import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/events';

export default function App() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [comments, setComments] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recurrence, setRecurrence] = useState('NONE');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const openNewEventModal = (dateStr) => {
    setSelectedEvent(null);
    setTitle('');
    setComments('');
    setStartTime(`${dateStr}T09:00`);
    setEndTime(`${dateStr}T10:00`);
    setRecurrence('NONE');
    setIsModalOpen(true);
  };

  const openEditEventModal = (e, event) => {
    e.stopPropagation(); // Prevents clicking the background cell trigger
    setSelectedEvent(event);
    setTitle(event.title);
    setComments(event.comments || '');
    setStartTime(event.startTime.substring(0, 16));
    setEndTime(event.endTime.substring(0, 16));
    setRecurrence(event.recurrence || 'NONE');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { title, comments, startTime, endTime, recurrence };
    const method = selectedEvent ? 'PUT' : 'POST';
    const url = selectedEvent ? `${API_URL}/${selectedEvent.id}` : API_URL;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setIsModalOpen(false);
    fetchEvents();
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    await fetch(`${API_URL}/${selectedEvent.id}`, { method: 'DELETE' });
    setIsModalOpen(false);
    fetchEvents();
  };

  // Logic to build simple grid layout
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null); // Empty slots for preceding month offsets
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(year, month, i));
  }

  const formatLocalDate = (date) => {
    if (!date) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
  };

  return (
    <div className="app-container">
      <header className="calendar-header">
        <h1>mycalendr<span>.us</span></h1>
        <div className="nav-controls">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>&larr; Prev</button>
          <h2>{currentDate.toLocaleString('default', { month: 'long' })} {year}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>Next &rarr;</button>
        </div>
      </header>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="weekday-label">{d}</div>
        ))}
        
        {daysArray.map((date, index) => {
          const dateStr = formatLocalDate(date);
          const dayEvents = events.filter(e => e.startTime.startsWith(dateStr));

          return (
            <div 
              key={index} 
              className={`calendar-cell ${!date ? 'empty' : ''}`}
              onClick={() => date && openNewEventModal(dateStr)}
            >
              {date && (
                <>
                  <span className="day-number">{date.getDate()}</span>
                  <div className="cell-events">
                    {dayEvents.map(evt => (
                      <div 
                        key={evt.id} 
                        className="event-pill" 
                        onClick={(e) => openEditEventModal(e, evt)}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedEvent ? 'Edit Event' : 'Add Event'}</h3>
            <form onSubmit={handleSave}>
              <label>Event Name</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Keep it brief..." />
              
              <div className="time-row">
                <div>
                  <label>Starts</label>
                  <input type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div>
                  <label>Ends</label>
                  <input type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>

              <label>Repeat</label>
              <select value={recurrence} onChange={e => setRecurrence(e.target.value)}>
                <option value="NONE">Does not repeat</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>

              <label>Comments / Notes</label>
              <textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Add details here..." />

              <div className="modal-actions">
                {selectedEvent && (
                  <button type="button" className="btn-delete" onClick={handleDelete}>Delete</button>
                )}
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}