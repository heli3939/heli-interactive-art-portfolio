import { useEffect, useState } from "react";
import WindowFrame from "./components/WindowFrame";
import ImageLightbox from "./components/ImageLightbox";
import StandingProjector, { MobileProjector } from "./components/StandingProjector";
import ProcessSequence from "./components/ProcessSequence";
import useTimedProcessStage from "./components/useTimedProcessStage";
import processStagesFor from "./components/processStages";
import artworks from "./data/artworks";
import background from "./assets/background/bg_1000px.jpg";
import logo from "./assets/icons/logo.png";
import projectorOff from "./assets/icons/projector_button_off.png";
import projectorOn from "./assets/icons/projector_button_on.png";
import "./ArtworkDetailPage.css";
import { sitePath } from "./sitePaths.js";

function DetailHeader({ isMenuOpen, onMenuToggle, onMenuClose }) {
  return (
    <>
      <header className="site-header">
        <a
          className="site-header__logo"
          href={sitePath()}
          aria-label="Heli home"
          tabIndex={isMenuOpen ? -1 : undefined}
        >
          <img src={logo} alt="Heli" />
        </a>

        <nav className="site-header__nav" aria-label="Primary navigation">
          <a href={sitePath("#gallery")}>Artwork Collection</a>
          <a href={sitePath("creating-process")}>Creating Process</a>
          <a href={sitePath("puzzle-room")}>Puzzle Room</a>
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
              <a href={sitePath("#gallery")}>Artwork Collection</a>
              <a href={sitePath("creating-process")}>Creating Process</a>
              <a href={sitePath("puzzle-room")}>Puzzle Room</a>
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

function DetailProcessViewer({
  artwork,
  stageIndex,
  isPaused,
  onStageChange,
  onPauseChange,
  onImageOpen,
}) {
  const stages = processStagesFor(artwork);

  return (
    <section className="detail-process-viewer" aria-label={`Creating process for ${artwork.title}`} aria-live="polite">
      <ProcessSequence
        title={artwork.title}
        stages={stages}
        stageIndex={stageIndex}
        isPaused={isPaused}
        onStageChange={onStageChange}
        onPauseChange={onPauseChange}
        onImageOpen={onImageOpen}
        classes={{
          title: "detail-process-viewer__title",
          stage: "detail-process-viewer__stage",
          sizeReference: "detail-process-viewer__size-reference",
          main: "detail-process-viewer__main",
          thumbnails: "detail-process-thumbnails",
          progress: "detail-process-progress",
        }}
      />
    </section>
  );
}

function ArtworkDetailPage({ artworkId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [projectorPhase, setProjectorPhase] = useState("off");
  const [stageIndex, setStageIndex] = useState(0);
  const [isProcessPaused, setIsProcessPaused] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const artwork = artworks.find((item) => item.id === artworkId);
  const stageCount = artwork?.hasProcess ? artwork.processImages.length + 1 : 0;
  const isProjectorOn = projectorPhase === "on";
  const isProjectorActive = projectorPhase !== "off";
  const isProcessPlaybackPaused = isProcessPaused || Boolean(lightboxImage);

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

  useTimedProcessStage({
    enabled: isProjectorOn,
    isPaused: isProcessPlaybackPaused,
    stageCount,
    stageIndex,
    setStageIndex,
  });

  if (!artwork) {
    return (
      <div className="detail-page detail-page--unavailable">
        <WindowFrame title="Artwork unavailable" className="detail-unavailable">
          <p>This artwork detail is not available yet.</p>
          <a href={sitePath()}>Return home</a>
        </WindowFrame>
      </div>
    );
  }

  const description = artwork.description ?? artwork.shortDescription ?? "";
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign(sitePath("#gallery"));
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
          className={`detail-back${isMenuOpen ? " detail-back--menu-hidden" : ""}`}
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
            <StandingProjector
              artwork={artwork}
              phase={projectorPhase}
              className="detail-standing-projector"
            />
          ) : (
            <img
              className="detail-artwork__image"
              src={artwork.image}
              alt={artwork.alt || artwork.title}
              tabIndex="0"
              onClick={() => setLightboxImage({
                image: artwork.image,
                alt: artwork.alt || artwork.title,
              })}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setLightboxImage({
                    image: artwork.image,
                    alt: artwork.alt || artwork.title,
                  });
                }
              }}
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
                return "inserting";
              });
            }}
          />
        </section>

        <div className={`detail-content-slot${isProjectorActive ? " detail-content-slot--projecting" : ""}`}>
          {isProjectorOn ? (
            <DetailProcessViewer
              artwork={artwork}
              stageIndex={stageIndex}
              isPaused={isProcessPlaybackPaused}
              onStageChange={setStageIndex}
              onPauseChange={setIsProcessPaused}
              onImageOpen={setLightboxImage}
            />
          ) : projectorPhase === "off" ? (
            <WindowFrame title="Description" className="detail-description">
              <p>{description}</p>
            </WindowFrame>
          ) : <div className="detail-process-pending" aria-label="Artwork is entering the projector" />}
        </div>
        {isProjectorActive && (
          <MobileProjector
            artwork={artwork}
            phase={projectorPhase}
            className="detail-mobile-projector"
          />
        )}
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

export default ArtworkDetailPage;
