import { useEffect, useMemo, useState } from "react";
import WindowFrame from "./components/WindowFrame";
import ImageLightbox from "./components/ImageLightbox";
import artworks from "./data/artworks";
import background from "./assets/background/bg_1000px.jpg";
import logo from "./assets/icons/logo.png";
import projectorOff from "./assets/icons/projector_off.png";
import projectorOn from "./assets/icons/projector_on.png";
import projectorMobileOff from "./assets/icons/projector_mobile_off.png";
import projectorMobileOn from "./assets/icons/projector_mobile_on.png";
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
  const [stageIndex, setStageIndex] = useState(0);
  const [isProcessPaused, setIsProcessPaused] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [leavingDirection, setLeavingDirection] = useState(null);
  const selectedArtwork = processArtworks.find((artwork) => artwork.id === selectedId);
  const stages = selectedArtwork
    ? [...selectedArtwork.processImages, {
        id: `${selectedArtwork.id}-final`,
        image: selectedArtwork.image,
        alt: `${selectedArtwork.title} final artwork`,
      }]
    : [];

  useEffect(() => {
    if (!selectedArtwork || stages.length < 2 || isProcessPaused) return undefined;
    const timer = window.setInterval(() => {
      setStageIndex((index) => (index + 1) % stages.length);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [selectedArtwork, stages.length, isProcessPaused]);

  useEffect(() => {
    let navigationTimer;
    let navigating = false;

    const handlePageTransition = (event) => {
      if (navigating || isMenuOpen || lightboxImage) return;
      const scrollingUp = event.deltaY < 0;
      const scrollingDown = event.deltaY > 0;
      const atTop = window.scrollY <= 1;
      const atBottom = window.innerHeight + window.scrollY
        >= document.documentElement.scrollHeight - 2;
      if ((!scrollingUp || !atTop) && (!scrollingDown || !atBottom)) return;

      event.preventDefault();
      navigating = true;
      setLeavingDirection(scrollingDown ? "puzzle" : "gallery");
      navigationTimer = window.setTimeout(() => {
        if (scrollingDown) {
          window.location.assign(sitePath("puzzle-room"));
        } else {
          window.sessionStorage.setItem("gallery-entry", "from-process");
          window.location.assign(sitePath("#gallery"));
        }
      }, 650);
    };

    window.addEventListener("wheel", handlePageTransition, { passive: false });

    return () => {
      window.removeEventListener("wheel", handlePageTransition);
      if (navigationTimer !== undefined) window.clearTimeout(navigationTimer);
    };
  }, [isMenuOpen, lightboxImage]);

  const selectArtwork = (artwork) => {
    setStageIndex(0);
    setSelectedId(artwork.id);
    window.history.replaceState(null, "", `/creating-process?artwork=${encodeURIComponent(artwork.id)}`);
  };

  return (
    <div
      className={`process-page${
        leavingDirection ? ` process-page--leaving process-page--leaving-${leavingDirection}` : ""
      }`}
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

        <section className={`process-viewer${selectedArtwork ? " process-viewer--active" : ""}`} aria-live="polite">
          {selectedArtwork ? (
            <>
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
        <div
          className={`process-mobile-projector${selectedArtwork ? " process-mobile-projector--on" : ""}`}
          key={selectedArtwork ? "projector-on" : "projector-off"}
        >
          <img
            src={selectedArtwork ? projectorMobileOn : projectorMobileOff}
            alt={selectedArtwork ? "Projector on" : "Projector off"}
          />
        </div>
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
