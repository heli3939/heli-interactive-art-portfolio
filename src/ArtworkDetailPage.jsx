import { useEffect, useState } from "react";
import WindowFrame from "./components/WindowFrame";
import artworks from "./data/artworks";
import background from "./assets/background/bg_1000px.jpg";
import logo from "./assets/icons/logo.png";
import projectorOff from "./assets/icons/projector_button_off.png";
import projectorOn from "./assets/icons/projector_button_on.png";
import standingProjectorOff from "./assets/icons/projector_off.png";
import standingProjectorOn from "./assets/icons/projector_on.png";
import "./ArtworkDetailPage.css";

function DetailHeader({ isMenuOpen, onMenuToggle, onMenuClose }) {
  return (
    <>
      <header className="site-header">
        <a
          className="site-header__logo"
          href="/"
          aria-label="Heli home"
          tabIndex={isMenuOpen ? -1 : undefined}
        >
          <img src={logo} alt="Heli" />
        </a>

        <nav className="site-header__nav" aria-label="Primary navigation">
          <a href="/#gallery" aria-current="page">Gallery Entrance</a>
          <a href="/creating-process">Creating Process</a>
          <a href="/#puzzle">Puzzle Room</a>
        </nav>

        <button
          className="site-header__menu"
          type="button"
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-controls="detail-mobile-navigation"
          aria-expanded={isMenuOpen}
          onClick={onMenuToggle}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {isMenuOpen && (
        <>
          <button
            className="mobile-nav-backdrop"
            type="button"
            aria-label="Close navigation"
            onClick={onMenuClose}
          />
          <aside
            className="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-mobile-nav-heading"
          >
            <p className="mobile-nav__heading" id="detail-mobile-nav-heading">
              Navigation
            </p>
            <nav id="detail-mobile-navigation" aria-label="Mobile navigation">
              <a href="/#gallery" aria-current="page">Gallery Entrance</a>
              <a href="/creating-process">Creating Process</a>
              <a href="/#puzzle">Puzzle Room</a>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}

function ProcessToggle({ artwork, isOn, onToggle }) {
  if (!artwork.hasProcess) return null;

  return (
    <div className="detail-process">
      <button
        className="detail-process__toggle"
        type="button"
        aria-label={`${isOn ? "Turn off" : "Turn on"} the creating process projector for ${artwork.title}`}
        aria-pressed={isOn}
        onClick={onToggle}
      >
        <img
          className="detail-process__icon"
          src={isOn ? projectorOn : projectorOff}
          alt=""
        />
      </button>
    </div>
  );
}

function DetailProcessViewer({ artwork, stageIndex, onStageChange }) {
  const stages = [
    ...artwork.processImages,
    {
      id: `${artwork.id}-final`,
      image: artwork.image,
      alt: `${artwork.title} final artwork`,
    },
  ];

  return (
    <section className="detail-process-viewer" aria-label={`Creating process for ${artwork.title}`} aria-live="polite">
      <div className="detail-process-viewer__stage">
        <img
          className="detail-process-viewer__main"
          src={stages[stageIndex].image}
          alt={stages[stageIndex].alt}
        />
      </div>
      <div className="detail-process-thumbnails">
        {stages.map((stage, index) => (
          <button
            className={index === stageIndex ? "is-active" : ""}
            type="button"
            key={stage.id}
            onClick={() => onStageChange(index)}
            aria-label={`View stage ${index + 1} of ${artwork.title}`}
            aria-current={index === stageIndex ? "step" : undefined}
          >
            <img src={stage.image} alt="" />
          </button>
        ))}
      </div>
      <div className="detail-process-progress" aria-label={`Stage ${stageIndex + 1} of ${stages.length}`}>
        {stages.map((stage, index) => (
          <button
            type="button"
            key={stage.id}
            className={index === stageIndex ? "is-active" : ""}
            onClick={() => onStageChange(index)}
            aria-label={`Go to stage ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function ArtworkDetailPage({ artworkId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [projectorPhase, setProjectorPhase] = useState("off");
  const [stageIndex, setStageIndex] = useState(0);
  const artwork = artworks.find((item) => item.id === artworkId && item.hasProcess);
  const stageCount = artwork ? artwork.processImages.length + 1 : 0;
  const isProjectorOn = projectorPhase === "on";
  const isProjectorActive = projectorPhase !== "off";

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (projectorPhase !== "inserting") return undefined;

    const timer = window.setTimeout(() => {
      setProjectorPhase("on");
    }, 720);

    return () => window.clearTimeout(timer);
  }, [projectorPhase]);

  useEffect(() => {
    if (!isProjectorOn || stageCount < 2) return undefined;

    const timer = window.setInterval(() => {
      setStageIndex((index) => (index + 1) % stageCount);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [isProjectorOn, stageCount]);

  if (!artwork) {
    return (
      <div className="detail-page detail-page--unavailable">
        <WindowFrame title="Artwork unavailable" className="detail-unavailable">
          <p>This artwork detail is not available yet.</p>
          <a href="/">Return home</a>
        </WindowFrame>
      </div>
    );
  }

  const description = artwork.description ?? artwork.shortDescription ?? "";
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign("/#gallery");
    }
  };

  return (
    <div
      className="detail-page"
      style={{ "--detail-background": `url(${background})` }}
    >
      <DetailHeader
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
        onMenuClose={() => setIsMenuOpen(false)}
      />

      <main className="detail-layout" inert={isMenuOpen ? true : undefined}>
        <button
          className="detail-back"
          type="button"
          aria-label="Go back"
          onClick={goBack}
        >
          <span aria-hidden="true">&gt;</span>
        </button>

        <section
          className={`detail-artwork${isProjectorActive ? " detail-artwork--projecting" : ""}`}
          aria-labelledby="detail-artwork-title"
        >
          {isProjectorActive ? (
            <div className="detail-standing-projector" aria-hidden="true">
              <img
                className="detail-standing-projector__image"
                src={isProjectorOn ? standingProjectorOn : standingProjectorOff}
                alt=""
              />
              {projectorPhase === "inserting" && (
                <div className="detail-standing-projector__artwork">
                  <img src={artwork.image} alt="" />
                </div>
              )}
            </div>
          ) : (
            <img
              className="detail-artwork__image"
              src={artwork.image}
              alt={artwork.alt || artwork.title}
            />
          )}
          <h1 className="detail-artwork__title" id="detail-artwork-title">
            {artwork.title}
          </h1>
          <ProcessToggle
            artwork={artwork}
            isOn={isProjectorOn}
            onToggle={() => {
              setStageIndex(0);
              setProjectorPhase((phase) => {
                if (phase !== "off") return "off";
                return window.matchMedia("(max-width: 1024px)").matches ? "on" : "inserting";
              });
            }}
          />
        </section>

        {isProjectorOn ? (
          <DetailProcessViewer
            artwork={artwork}
            stageIndex={stageIndex}
            onStageChange={setStageIndex}
          />
        ) : projectorPhase === "off" ? (
          <WindowFrame title="Description" className="detail-description">
            <p>{description}</p>
          </WindowFrame>
        ) : <div className="detail-process-pending" aria-label="Artwork is entering the projector" />}
      </main>
    </div>
  );
}

export default ArtworkDetailPage;
