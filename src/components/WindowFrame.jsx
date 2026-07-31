import closeIcon from "../assets/icons/window-close.svg";
import "../window.css";

function WindowCloseButton({ onClose }) {
  return (
    <button
      className="window-frame__button window-frame__button--close"
      type="button"
      onClick={onClose}
      aria-label="Close window"
    >
      <img src={closeIcon} alt="" />
    </button>
  );
}

function WindowFrame({
  title,
  className = "",
  children,
  onClose,
  showCloseButton = false,
  ...props
}) {
  return (
    <section className={`window-frame ${className}`} {...props}>
      <header className="window-frame__title-bar">
        <span className="window-frame__title">{title}</span>
        {showCloseButton && onClose && <WindowCloseButton onClose={onClose} />}
      </header>
      <div className="window-frame__content">{children}</div>
    </section>
  );
}

export default WindowFrame;
