import closeIcon from "../assets/icons/window-close.svg";
import maximizeIcon from "../assets/icons/window-maximize.svg";
import "../window.css";

function WindowControls({ onClose }) {
  return (
    <span className="window-frame__controls" aria-hidden={onClose ? undefined : "true"}>
      <span className="window-frame__button window-frame__button--minimize" />
      <span className="window-frame__button">
        <img src={maximizeIcon} alt="" />
      </span>
      {onClose ? (
        <button
          className="window-frame__button window-frame__button--close"
          type="button"
          onClick={onClose}
          aria-label="Close window"
        >
          <img src={closeIcon} alt="" />
        </button>
      ) : (
        <span className="window-frame__button window-frame__button--close">
          <img src={closeIcon} alt="" />
        </span>
      )}
    </span>
  );
}

function WindowFrame({ title, className = "", children, onClose, ...props }) {
  return (
    <section className={`window-frame ${className}`} {...props}>
      <header className="window-frame__title-bar">
        <span className="window-frame__title">{title}</span>
        <WindowControls onClose={onClose} />
      </header>
      <div className="window-frame__content">{children}</div>
    </section>
  );
}

export default WindowFrame;
