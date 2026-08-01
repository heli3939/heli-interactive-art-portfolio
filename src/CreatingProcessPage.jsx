import { useEffect, useMemo, useState } from "react";
import WindowFrame from "./components/WindowFrame";
import ImageLightbox from "./components/ImageLightbox";
import StandingProjector, { MobileProjector } from "./components/StandingProjector";
import ProcessSequence from "./components/ProcessSequence";
import useTimedProcessStage from "./components/useTimedProcessStage";
import processStagesFor from "./components/processStages";
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
  const isProcessPlaybackPaused = isProcessPaused || Boolean(lightboxImage);
  const stages = processStagesFor(selectedArtwork);

  useTimedProcessStage({
    enabled: isProjectorOn && Boolean(selectedArtwork),
    isPaused: isProcessPlaybackPaused,
    stageCount: stages.length,
    stageIndex,
    setStageIndex,
  });

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
            <ProcessSequence
              title={selectedArtwork.title}
              titleAs="h1"
              stages={stages}
              stageIndex={stageIndex}
              isPaused={isProcessPlaybackPaused}
              onStageChange={setStageIndex}
              onPauseChange={setIsProcessPaused}
              onImageOpen={setLightboxImage}
              classes={{
                title: "process-viewer__title",
                stage: "process-viewer__stage",
                sizeReference: "process-viewer__size-reference",
                main: "process-viewer__main",
                thumbnails: "process-thumbnails",
                progress: "process-progress",
              }}
            />
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
        onClose={() => {
          setLightboxImage(null);
          setIsProcessPaused(false);
        }}
      />
    </div>
  );
}

export default CreatingProcessPage;
