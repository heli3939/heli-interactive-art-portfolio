import { useEffect, useMemo, useState } from "react";
import WindowFrame from "./components/WindowFrame";
import artworks from "./data/artworks";
import background from "./assets/background/bg_1000px.jpg";
import logo from "./assets/icons/logo.png";
import projectorOff from "./assets/icons/projector_off.png";
import projectorOn from "./assets/icons/projector_on.png";
import "./CreatingProcessPage.css";

const rotations = [-3, 2, -2, 3, 2, -3, 3, -2, -2, 2, -3, 3];

function ProcessHeader({ isMenuOpen, onMenuToggle, onMenuClose }) {
  return (
    <>
      <header className="site-header">
        <a className="site-header__logo" href="/" aria-label="Heli home">
          <img src={logo} alt="Heli" />
        </a>
        <nav className="site-header__nav" aria-label="Primary navigation">
          <a href="/#gallery">Gallery Entrance</a>
          <a href="/creating-process" aria-current="page">Creating Process</a>
          <a href="/#puzzle">Puzzle Room</a>
        </nav>
        <button
          className="site-header__menu"
          type="button"
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMenuOpen}
          onClick={onMenuToggle}
        >
          <span /><span /><span />
        </button>
      </header>
      {isMenuOpen && (
        <>
          <button className="mobile-nav-backdrop" type="button" aria-label="Close navigation" onClick={onMenuClose} />
          <aside className="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation">
            <p className="mobile-nav__heading">Navigation</p>
            <nav>
              <a href="/#gallery">Gallery Entrance</a>
              <a href="/creating-process" aria-current="page" onClick={onMenuClose}>Creating Process</a>
              <a href="/#puzzle">Puzzle Room</a>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}

function CreatingProcessPage() {
  const processArtworks = useMemo(() => artworks.filter((artwork) => artwork.hasProcess), []);
  const initialId = new URLSearchParams(window.location.search).get("artwork");
  const [selectedId, setSelectedId] = useState(
    processArtworks.some((artwork) => artwork.id === initialId) ? initialId : null,
  );
  const [stageIndex, setStageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeavingPage, setIsLeavingPage] = useState(false);
  const selectedArtwork = processArtworks.find((artwork) => artwork.id === selectedId);
  const stages = selectedArtwork
    ? [...selectedArtwork.processImages, {
        id: `${selectedArtwork.id}-final`,
        image: selectedArtwork.image,
        alt: `${selectedArtwork.title} final artwork`,
      }]
    : [];

  useEffect(() => {
    if (!selectedArtwork || stages.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setStageIndex((index) => (index + 1) % stages.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [selectedArtwork, stages.length]);

  useEffect(() => {
    let navigationTimer;
    let navigating = false;

    const returnToGallery = (event) => {
      if (event.deltaY >= 0 || window.scrollY > 1 || navigating || isMenuOpen) return;

      event.preventDefault();
      navigating = true;
      setIsLeavingPage(true);
      navigationTimer = window.setTimeout(() => {
        window.sessionStorage.setItem("gallery-entry", "from-process");
        window.location.assign("/#gallery");
      }, 650);
    };

    window.addEventListener("wheel", returnToGallery, { passive: false });

    return () => {
      window.removeEventListener("wheel", returnToGallery);
      if (navigationTimer !== undefined) window.clearTimeout(navigationTimer);
    };
  }, [isMenuOpen]);

  const selectArtwork = (artwork) => {
    setStageIndex(0);
    setSelectedId(artwork.id);
    window.history.replaceState(null, "", `/creating-process?artwork=${encodeURIComponent(artwork.id)}`);
  };

  return (
    <div
      className={`process-page${isLeavingPage ? " process-page--leaving" : ""}`}
      style={{ "--process-background": `url(${background})` }}
    >
      <ProcessHeader
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
        onMenuClose={() => setIsMenuOpen(false)}
      />
      <main className="process-layout" inert={isMenuOpen ? true : undefined}>
        <section className="process-selector" aria-label="Artworks with creating processes">
          <img
            className="process-projector"
            src={selectedArtwork ? projectorOn : projectorOff}
            alt={selectedArtwork ? "Projector on" : "Projector off"}
          />
          <div className="process-stack">
            {processArtworks.map((artwork, index) => {
              const selected = artwork.id === selectedId;
              return (
                <button
                  className={`process-card${artwork.category === "Printmaking" ? " process-card--printmaking" : ""}${selected ? " process-card--selected" : ""}`}
                  type="button"
                  key={artwork.id}
                  aria-pressed={selected}
                  aria-label={`Show the creating process for ${artwork.title}`}
                  style={{
                    "--rotation": `${selected ? 0 : rotations[index % rotations.length]}deg`,
                    "--card-index": index,
                  }}
                  onClick={() => selectArtwork(artwork)}
                >
                  <img src={artwork.image} alt="" />
                </button>
              );
            })}
          </div>
        </section>

        <section className={`process-viewer${selectedArtwork ? " process-viewer--active" : ""}`} aria-live="polite">
          {selectedArtwork ? (
            <>
              <img className="process-viewer__main" src={stages[stageIndex].image} alt={stages[stageIndex].alt} />
              <div className="process-thumbnails">
                {stages.map((stage, index) => (
                  <button
                    className={index === stageIndex ? "is-active" : ""}
                    type="button"
                    key={stage.id}
                    onClick={() => setStageIndex(index)}
                    aria-label={`View stage ${index + 1} of ${selectedArtwork.title}`}
                    aria-current={index === stageIndex ? "step" : undefined}
                  >
                    <img src={stage.image} alt="" />
                  </button>
                ))}
              </div>
              <div className="process-progress" aria-label={`Stage ${stageIndex + 1} of ${stages.length}`}>
                {stages.map((stage, index) => (
                  <button
                    type="button"
                    key={stage.id}
                    className={index === stageIndex ? "is-active" : ""}
                    onClick={() => setStageIndex(index)}
                    aria-label={`Go to stage ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <WindowFrame title="*Hint*" className="process-viewer__prompt-window">
              <p className="process-viewer__prompt">Select an artwork to view its creating process.</p>
            </WindowFrame>
          )}
        </section>
      </main>
    </div>
  );
}

export default CreatingProcessPage;
