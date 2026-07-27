import { useEffect, useState } from "react";
import WindowFrame from "./components/WindowFrame";
import artworks from "./data/artworks";
import background from "./assets/background/bg_1000px.jpg";
import logo from "./assets/icons/logo.png";
import projector from "./assets/icons/projector_button.png";
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
          <a href="/#gallery">Gallery Entrance</a>
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
              <a href="/#gallery">Gallery Entrance</a>
              <a href="/creating-process">Creating Process</a>
              <a href="/#puzzle">Puzzle Room</a>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}

function ProcessGallery({ artwork }) {
  if (!artwork.hasProcess) return null;

  return (
    <div className="detail-process">
      <a
        className="detail-process__toggle"
        href={`/creating-process?artwork=${encodeURIComponent(artwork.id)}`}
        aria-label={`Project the creating process for ${artwork.title}`}
      >
        <img src={projector} alt="" />
      </a>
    </div>
  );
}

function ArtworkDetailPage({ artworkId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const artwork = artworks.find((item) => item.id === artworkId && item.hasProcess);

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
      window.location.assign("/");
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

        <section className="detail-artwork" aria-labelledby="detail-artwork-title">
          <img
            className="detail-artwork__image"
            src={artwork.image}
            alt={artwork.alt || artwork.title}
          />
          <h1 className="detail-artwork__title" id="detail-artwork-title">
            {artwork.title}
          </h1>
          <ProcessGallery artwork={artwork} />
        </section>

        <WindowFrame title="Description" className="detail-description">
          <p>{description}</p>
        </WindowFrame>
      </main>
    </div>
  );
}

export default ArtworkDetailPage;
