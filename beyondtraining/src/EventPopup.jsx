function EventPopup({ event, onOptionClick, disabled }) {
  if (!event) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>Evento da Semana</h2>
        <h3 className="popup-title">{event.title}</h3>
        <p className="popup-text">{event.text}</p>

        <div className="popup-options">
          {event.options.map(opt => (
            <button
              key={opt.id}
              className="popup-option-button"
              onClick={() => onOptionClick(opt)}
              disabled={disabled}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventPopup;
