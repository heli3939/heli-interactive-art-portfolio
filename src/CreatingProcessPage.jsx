import { useEffect, useMemo, useState } from "react";
import WindowFrame from "./components/WindowFrame";
import ImageLightbox from "./components/ImageLightbox";
import StandingProjector, { MobileProjector } from "./components/StandingProjector";
import artworks from "./data/artworks";
import background from "./assets/background/bg_1000px.jpg";
import logo from "./assets/icons/logo.png";
import "./CreatingProcessPage.css";
import { sitePath } from "./sitePaths.js";

const rotations = [-6, 4, -2, 5, 1, -7, 8, -3, -1, 4, -2, 5];

function ProcessHeader({ isMenuOpen, onMenuToggle, onMenuClose }) {
  return (
    <>
      <header className="site-header">
        <a className="site-header__logo" href={sitePath()} aria-label="Heli home">
          <img src={logo} alt="Heli" />
        </a>
        <nav className="site-header__nav" aria-label="Primary navigation">
          <a href={sitePath("#gallery")}>Artwork Collection</a>
          <a href={sitePath("creating-process")} aria-current="page">Creating Process</a>
          <a href={sitePath("puzzle-room")}>Puzzle Room</a>
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
              <a href={sitePath("#gallery")}>Artwork Collection</a>
              <a href={sitePath("creating-process")} aria-current="page" onClick={onMenuClose}>Creating Process</a>
              <a href={sitePath("puzzle-room")}>Puzzle Room</a>
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
  const [projectorPhase, setProjectorPhase] = useState(
    processArtworks.some((artwork) => artwork.id === initialId) ? "on" : "off",
  );
  const [stageIndex, setStageIndex] = useState(0);
  const [isProcessPaused, setIsProcessPaused] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const selectedArtwork = processArtworks.find((artwork) => artwork.id === selectedId);
  const isProjectorOn = projectorPhase === "on";
  const stages = selectedArtwork
    ? [...selectedArtwork.processImages, {
        id: `${selectedArtwork.id}-final`,
        image: selectedArtwork.image,
        alt: `${selectedArtwork.title} final artwork`,
      }]
    : [];

  useEffect(() => {
    if (!isProjectorOn || !selectedArtwork || stages.length < 2 || isProcessPaused) return undefined;
    const timer = window.setTimeout(() => {
      setStageIndex((stageIndex + 1) % stages.length);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [isProjectorOn, selectedArtwork, stages.length, isProcessPaused, stageIndex]);

  useEffect(() => {
    if (projectorPhase !== "inserting") return undefined;
    const timer = window.setTimeout(() => setProjectorPhase("on"), 720);
    return () => window.clearTimeout(timer);
  }, [projectorPhase]);

  const selectArtwork = (artwork) => {
    setStageIndex(0);
    setSelectedId(artwork.id);
    setProjectorPhase("inserting");
    window.history.replaceState(null, "", `/creating-process?artwork=${encodeURIComponent(artwork.id)}`);
  };

  return (
    <div
      className="process-page"
      style={{ "--process-background": `url(${background})` }}
    >
      <ProcessHeader
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
        onMenuClose={() => setIsMenuOpen(false)}
      />
      <main className="process-layout" inert={isMenuOpen ? true : undefined}>
        <section className="process-selector" aria-label="Artworks with creating processes">
          <StandingProjector
            artwork={selectedArtwork}
            phase={projectorPhase}
            className="process-projector"
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
                    "--mobile-rotation": `${selected ? 0 : rotations[index % rotations.length] * 0.45}deg`,
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

        <section className={`process-viewer${isProjectorOn ? " process-viewer--active" : ""}`} aria-live="polite">
          {isProjectorOn && selectedArtwork ? (
            <>
              <h1 className="process-viewer__title">{selectedArtwork.title}</h1>
              <div className="process-viewer__stage">
                <img
                  className="process-viewer__size-reference"
                  src={selectedArtwork.image}
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="process-viewer__main"
                  src={stages[stageIndex].image}
                  alt={stages[stageIndex].alt}
                  tabIndex="0"
                  onMouseEnter={() => setIsProcessPaused(true)}
                  onMouseLeave={() => setIsProcessPaused(false)}
                  onFocus={() => setIsProcessPaused(true)}
                  onBlur={() => setIsProcessPaused(false)}
                  onClick={() => setLightboxImage(stages[stageIndex])}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setLightboxImage(stages[stageIndex]);
                    }
                  }}
                />
              </div>
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
                <span
                  className="process-progress__fill"
                  key={`${stageIndex}-${isProcessPaused}`}
                  style={{
                    "--progress-start": `${((stageIndex + 0.5) / stages.length) * 100}%`,
                    "--progress-end": `${stageIndex === stages.length - 1
                      ? 100
                      : ((stageIndex + 1.5) / stages.length) * 100}%`,
                    "--progress-play-state": isProcessPaused ? "paused" : "running",
                  }}
                  aria-hidden="true"
                />
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
        <MobileProjector
          artwork={selectedArtwork}
          phase={projectorPhase}
          className="process-mobile-projector"
        />
      </main>
      <ImageLightbox
        image={lightboxImage?.image}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}

export default CreatingProcessPage;
