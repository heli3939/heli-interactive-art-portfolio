import { useEffect, useLayoutEffect, useRef, useState } from "react";
import WindowFrame from "./components/WindowFrame";
import ArtworkCard from "./components/ArtworkCard";
import artworks from "./data/artworks";
import background from "./assets/background/bg_1000px.jpg";
import portrait from "./assets/artworks/chibi/pfp/pfp_1000px.jpg";
import logo from "./assets/icons/logo.png";
import instagramIcon from "./assets/icons/ig.png";
import discordIcon from "./assets/icons/discord.png";
import gmailIcon from "./assets/icons/gmail.png";
import "./App.css";

const contacts = [
  {
    name: "Instagram",
    label: "@heli_draw39",
    href: "https://www.instagram.com/heli_draw39/",
    icon: instagramIcon,
  },
  {
    name: "Discord",
    label: "@heli3939",
    href: "https://discord.gg/VCUMfKtH",
    icon: discordIcon,
  },
  {
    name: "Email",
    label: "luo325692@gmail.com",
    href: "mailto:luo325692@gmail.com",
    icon: gmailIcon,
  },
];

const galleryArtworks = artworks.filter((artwork) => artwork.hasProcess);

function AboutCopy() {
  const copyRef = useRef(null);

  useLayoutEffect(() => {
    const copy = copyRef.current;
    const textBox = copy?.closest(".about-window");
    if (!copy || !textBox) return undefined;

    const fitCopy = () => {
      const styles = getComputedStyle(copy);
      const minSize = Number.parseFloat(styles.getPropertyValue("--about-copy-min-size"));
      const maxSize = Number.parseFloat(styles.getPropertyValue("--about-copy-max-size"));
      const availableHeight = textBox.clientHeight - copy.offsetTop - 16;
      let low = minSize;
      let high = maxSize;

      for (let index = 0; index < 10; index += 1) {
        const size = (low + high) / 2;
        copy.style.setProperty("--about-copy-font-size", `${size}px`);

        if (copy.scrollHeight <= availableHeight) {
          low = size;
        } else {
          high = size;
        }
      }

      copy.style.setProperty("--about-copy-font-size", `${low}px`);
    };

    const resizeObserver = new ResizeObserver(fitCopy);
    resizeObserver.observe(textBox);
    document.fonts?.ready.then(fitCopy);
    fitCopy();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <>
      <h1 className="pixel-heading about-window__heading">About Me</h1>
      <div className="about-window__copy" ref={copyRef}>
        <p>
Hi! I'm heli, a Melbourne-based digital artist who loves drawing cute character illustrations with vibrant colours.</p>

<p>My work is mainly inspired by VOCALOID - a creative culture built around voice-synthesizer technology and virtual singers such as Hatsune Miku. These virtual singers are brought to life by creators through music, illustration, animation and live performances, becoming a medium for self-expression and inspiring the creative journeys of artists like me.
        </p>
<p>
Alongside VOCALOID, I also create fan art inspired by anime, games and internet culture.
        </p>
        <p>
Through this portfolio, I hope you can connect with both my artwork and the creative world inspring me. Scroll down to start exploration!
        </p>
      </div>
    </>
  );
}

function ContactLinks({ mobile = false }) {
  return (
    <div className={mobile ? "mobile-contact__links" : "contact-list"}>
      {contacts.map((contact) => (
        <a
          className={mobile ? "mobile-contact__link" : "contact-list__link"}
          href={contact.href}
          key={contact.name}
          aria-label={`${contact.name}: ${contact.label}`}
          target={contact.href.startsWith("http") ? "_blank" : undefined}
          rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
        >
          <span className={`contact-icon contact-icon--${contact.name.toLowerCase()}`}>
            <img src={contact.icon} alt="" />
          </span>
          {!mobile && <span>{contact.label}</span>}
        </a>
      ))}
    </div>
  );
}

function FloatingGallery({ disabled = false, entryMode = "default" }) {
  const galleryRef = useRef(null);
  const [isInstructionVisible, setIsInstructionVisible] = useState(true);

  useEffect(() => {
    const instructionTimer = window.setTimeout(() => {
      setIsInstructionVisible(false);
    }, 2500);

    return () => window.clearTimeout(instructionTimer);
  }, []);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return undefined;

    const cards = [...gallery.querySelectorAll(".artwork-card-flight")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minimumProgress = 0.16;
    const stagger = 0.68;
    const enteredFromProcess = entryMode === "from-process";
    const savedProgress = Number.parseFloat(
      window.sessionStorage.getItem("gallery-progress") || "",
    );
    const shouldRestoreProgress = entryMode === "restore-progress"
      && Number.isFinite(savedProgress);
    const startingProgress = shouldRestoreProgress
      ? Math.min(1 + (cards.length - 1) * stagger, Math.max(minimumProgress, savedProgress))
      : enteredFromProcess
        ? (cards.length - 1) * stagger + 0.91
        : minimumProgress;
    let progress = startingProgress;
    let animationFrame;
    let navigationTimer;
    let isNavigating = false;
    const maximumProgress = 1 + (cards.length - 1) * stagger;

    const renderDepth = () => {
      animationFrame = undefined;

      cards.forEach((card, index) => {
        if (reducedMotion) {
          card.style.setProperty("--scroll-z", "0px");
          card.style.setProperty("--scroll-opacity", "1");
          return;
        }

        const cardProgress = Math.min(
          1,
          Math.max(0, progress - index * stagger),
        );
        const isInstruction = card.classList.contains("gallery-instruction");
        const zPosition = isInstruction
          ? -220 + cardProgress * 220
          : -1100 + cardProgress * 1620;
        const fadeIn = Math.min(1, cardProgress / 0.16);
        const fadeOut = Math.min(1, (1 - cardProgress) / 0.09);
        const opacity = Math.max(0, Math.min(fadeIn, fadeOut));

        card.style.setProperty("--scroll-z", `${zPosition}px`);
        card.style.setProperty("--scroll-opacity", opacity.toFixed(3));
        card.style.pointerEvents = opacity < 0.08 ? "none" : "";
      });
    };

    const requestRender = () => {
      if (animationFrame !== undefined) return;
      animationFrame = window.requestAnimationFrame(renderDepth);
    };

    const handleWheel = (event) => {
      if (disabled || reducedMotion) return;

      const bounds = gallery.getBoundingClientRect();
      const headerHeight = document.querySelector(".site-header--home")?.offsetHeight ?? 0;
      const isPinned = bounds.top <= headerHeight + 1
        && bounds.bottom >= window.innerHeight - 1;
      if (!isPinned) return;

      const movingForward = event.deltaY > 0;
      const canMoveForward = progress < maximumProgress;
      const canMoveBackward = progress > minimumProgress;

      if (!movingForward && !canMoveBackward) {
        event.preventDefault();
        if (!isNavigating) {
          isNavigating = true;
          gallery.classList.add("gallery--leaving", "gallery--leaving-back");
          navigationTimer = window.setTimeout(() => {
            window.location.assign("/");
          }, 650);
        }
        return;
      }

      if (movingForward && !canMoveForward) {
        event.preventDefault();
        if (!isNavigating) {
          isNavigating = true;
          gallery.classList.add("gallery--leaving");
          navigationTimer = window.setTimeout(() => {
            window.location.assign("/creating-process");
          }, 650);
        }
        return;
      }

      if ((movingForward && canMoveForward) || (!movingForward && canMoveBackward)) {
        event.preventDefault();
        progress = Math.min(
          maximumProgress,
          Math.max(minimumProgress, progress + event.deltaY * 0.0009),
        );
        requestRender();
      }
    };

    const resetGallery = () => {
      progress = minimumProgress;
      requestRender();
    };

    const savePositionBeforeOpeningArtwork = (event) => {
      if (!event.target.closest("a.artwork-card")) return;

      window.sessionStorage.setItem("gallery-entry", "restore-progress");
      window.sessionStorage.setItem("gallery-progress", String(progress));
    };

    const resetWhenLeavingGallery = () => {
      const bounds = gallery.getBoundingClientRect();
      const headerHeight = document.querySelector(".site-header--home")?.offsetHeight ?? 0;

      if (bounds.top > headerHeight + 1 && progress !== minimumProgress) {
        resetGallery();
      }
    };

    renderDepth();
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", resetWhenLeavingGallery, { passive: true });
    window.addEventListener("gallery:reset", resetGallery);
    gallery.addEventListener("click", savePositionBeforeOpeningArtwork);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", resetWhenLeavingGallery);
      window.removeEventListener("gallery:reset", resetGallery);
      gallery.removeEventListener("click", savePositionBeforeOpeningArtwork);
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
      if (navigationTimer !== undefined) window.clearTimeout(navigationTimer);
    };
  }, [disabled, entryMode]);

  return (
    <section
      className="gallery"
      id="gallery"
      aria-label="Artwork gallery"
      inert={disabled ? true : undefined}
      ref={galleryRef}
    >
      <div className="gallery__space">
        <div
          className={`artwork-card-flight gallery-instruction${isInstructionVisible ? "" : " gallery-instruction--hidden"}`}
          style={{
            "--card-x": "50%",
            "--card-y": "52%",
            "--card-width": "25rem",
            zIndex: 30,
          }}
        >
          <WindowFrame title="*Hint*" className="gallery-instruction__window">
            <p>
              Scroll to explore my artworks. Click an artwork to
              view its details.
            </p>
          </WindowFrame>
        </div>
        {galleryArtworks.map((artwork, index) => (
          <ArtworkCard artwork={artwork} index={index} key={artwork.id} />
        ))}
      </div>
      <div className="gallery-scroll-cue" aria-hidden="true">
        <span className="gallery-scroll-cue__arrow">↕</span>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [galleryEntryMode, setGalleryEntryMode] = useState(
    () => window.sessionStorage.getItem("gallery-entry") || "default",
  );
  const [currentPage, setCurrentPage] = useState(
    window.location.hash === "#gallery" ? "gallery" : "about",
  );

  useEffect(() => {
    const updatePageFromHash = () => {
      const nextPage = window.location.hash === "#gallery" ? "gallery" : "about";

      if (nextPage === "gallery") {
        setGalleryEntryMode("default");
        window.sessionStorage.removeItem("gallery-entry");
        window.sessionStorage.removeItem("gallery-progress");
      }

      setCurrentPage(nextPage);
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", updatePageFromHash);
    return () => window.removeEventListener("hashchange", updatePageFromHash);
  }, []);

  useEffect(() => {
    if (currentPage === "gallery") {
      window.sessionStorage.removeItem("gallery-entry");
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== "about") return undefined;

    const openGalleryOnScroll = (event) => {
      const atPageBottom = window.scrollY + window.innerHeight
        >= document.documentElement.scrollHeight - 2;

      if (event.deltaY > 0 && atPageBottom && !isMenuOpen) {
        event.preventDefault();
        window.location.hash = "gallery";
      }
    };

    window.addEventListener("wheel", openGalleryOnScroll, { passive: false });
    return () => window.removeEventListener("wheel", openGalleryOnScroll);
  }, [currentPage, isMenuOpen]);

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

  return (
    <div className="about-page" style={{ "--page-background": `url(${background})` }}>
      <header className="site-header site-header--home">
        <a
          className="site-header__logo"
          href="#"
          aria-label="Heli home"
          tabIndex={isMenuOpen ? -1 : undefined}
        >
          <img src={logo} alt="Heli" />
        </a>

        <nav className="site-header__nav" aria-label="Primary navigation">
          <a
            href="#gallery"
            aria-current={currentPage === "gallery" ? "page" : undefined}
            onClick={() => window.dispatchEvent(new Event("gallery:reset"))}
          >
            Artwork Collection
          </a>
          <a href="/creating-process">Creating Process</a>
          <a href="/puzzle-room">Puzzle Room</a>
        </nav>

      </header>
      <button
        className="site-header__menu site-header__menu--home"
        type="button"
        aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
        aria-controls="mobile-navigation"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      {isMenuOpen && (
        <>
          <button
            className="mobile-nav-backdrop"
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside
            className="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-heading"
          >
            <p className="mobile-nav__heading" id="mobile-nav-heading">
              Navigation
            </p>
            <nav id="mobile-navigation" aria-label="Mobile navigation">
              <a
                href="#gallery"
                aria-current={currentPage === "gallery" ? "page" : undefined}
                onClick={() => {
                  window.dispatchEvent(new Event("gallery:reset"));
                  setIsMenuOpen(false);
                }}
              >
                Artwork Collection
              </a>
              <a href="/creating-process" onClick={() => setIsMenuOpen(false)}>
                Creating Process
              </a>
              <a href="/puzzle-room" onClick={() => setIsMenuOpen(false)}>
                Puzzle Room
              </a>
            </nav>
          </aside>
        </>
      )}

      {currentPage === "about" ? (
        <main className="about-layout" inert={isMenuOpen ? true : undefined}>
        <div className="profile-column">
          <img className="profile-portrait" src={portrait} alt="Pixel illustration of Heli" />

          <WindowFrame title="Contact Me" className="contact-window">
            <h2 className="pixel-heading contact-window__heading">Contact Me</h2>
            <ContactLinks />
          </WindowFrame>
        </div>

        <WindowFrame title="About Me" className="about-window">
          <AboutCopy />
        </WindowFrame>

        <section className="mobile-contact" aria-labelledby="mobile-contact-heading">
          <h2 className="pixel-heading" id="mobile-contact-heading">
            Contact Me
          </h2>
          <ContactLinks mobile />
        </section>
        </main>
      ) : (
        <FloatingGallery
          disabled={isMenuOpen}
          entryMode={galleryEntryMode}
        />
      )}
    </div>
  );
}

export default App;
