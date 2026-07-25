import closeIcon from "../assets/icons/window-close.svg";
import maximizeIcon from "../assets/icons/window-maximize.svg";
import "../window.css";

function WindowControls() {
  return (
    <span className="window-frame__controls" aria-hidden="true">
      <span className="window-frame__button window-frame__button--minimize" />
      <span className="window-frame__button">
        <img src={maximizeIcon} alt="" />
      </span>
      <span className="window-frame__button window-frame__button--close">
        <img src={closeIcon} alt="" />
      </span>
    </span>
  );
}

function WindowFrame({ title, className = "", children }) {
  return (
    <section className={`window-frame ${className}`}>
      <header className="window-frame__title-bar">
        <span className="window-frame__title">{title}</span>
        <WindowControls />
      </header>
      <div className="window-frame__content">{children}</div>
    </section>
  );
}

export default WindowFrame;
