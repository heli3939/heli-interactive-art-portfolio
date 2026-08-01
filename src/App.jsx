import { useEffect, useLayoutEffect, useRef, useState } from "react";
import WindowFrame from "./components/WindowFrame";
import ArtworkCard from "./components/ArtworkCard";
import artworks from "./data/artworks";
import background from "./assets/background/bg_1000px.jpg";
import portrait from "./assets/artworks/chibi/pfp/pfp_1000px.jpg";
import logo from "./assets/icons/logo.png";
import instagramIcon from "./assets/icons/ig.png";
import discordIcon from "./assets/icons/discord.png";
import pixivIcon from "./assets/icons/pixiv.png";
import "./App.css";
import { sitePath } from "./sitePaths.js";

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
    name: "Pixiv",
    label: "ID: 79458501",
    href: "https://www.pixiv.net/en/users/79458501",
    icon: pixivIcon,
  },
];

const galleryArtworks = artworks.filter((artwork) => artwork.hasProcess);
const contactAlphaMaps = new WeakMap();

function isOpaqueContactPixel(image, clientX, clientY) {
  if (!image?.complete || !image.naturalWidth) return false;
  let alphaMap = contactAlphaMaps.get(image);

  if (!alphaMap) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    alphaMap = new Uint8Array(canvas.width * canvas.height);
    for (let index = 0; index < alphaMap.length; index += 1) {
      alphaMap[index] = pixels[index * 4 + 3];
    }
    contactAlphaMaps.set(image, alphaMap);
  }

  const bounds = image.getBoundingClientRect();
  const relativeX = (clientX - bounds.left) / bounds.width;
  const relativeY = (clientY - bounds.top) / bounds.height;
  if (relativeX < 0 || relativeX >= 1 || relativeY < 0 || relativeY >= 1) return false;
  const x = Math.min(255, Math.floor(relativeX * 256));
  const y = Math.min(255, Math.floor(relativeY * 256));
  return alphaMap[y * 256 + x] > 24;
}

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

function ContactLink({ contact, mobile }) {
  const imageRef = useRef(null);
  const [isAlphaHovered, setIsAlphaHovered] = useState(false);
  const isPointerOnIcon = (event) => (
    isOpaqueContactPixel(imageRef.current, event.clientX, event.clientY)
  );

  return (
    <a
      className={`${mobile ? "mobile-contact__link" : "contact-list__link"}${isAlphaHovered ? " is-alpha-hover" : ""}`}
      href={contact.href}
      aria-label={`${contact.name}: ${contact.label}`}
      target={contact.href.startsWith("http") ? "_blank" : undefined}
      rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
      onPointerMove={(event) => setIsAlphaHovered(isPointerOnIcon(event))}
      onPointerLeave={() => setIsAlphaHovered(false)}
    >
      <span className={`contact-icon contact-icon--${contact.name.toLowerCase()}`}>
        <img ref={imageRef} src={contact.icon} alt="" draggable={false} />
      </span>
      {!mobile && <span>{contact.label}</span>}
    </a>
  );
}

function ContactLinks({ mobile = false }) {
  return (
    <div className={mobile ? "mobile-contact__links" : "contact-list"}>
      {contacts.map((contact) => (
        <ContactLink
          contact={contact}
          mobile={mobile}
          key={contact.name}
        />
      ))}
    </div>
  );
}

function FloatingGallery({ disabled = false, entryMode = "default" }) {
  const galleryRef = useRef(null);
  const [isInstructionVisible, setIsInstructionVisible] = useState(true);
  const [hasMoreArtworks, setHasMoreArtworks] = useState(true);

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
    const artworkCards = [
      ...gallery.querySelectorAll(
        ".artwork-card-flight:not(.gallery-instruction)",
      ),
    ];
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
    let touchStartY = null;
    let touchDeltaY = 0;
    let touchMode = false;
    let hasTouchNavigated = false;
    let suppressClickUntil = 0;
    const maximumProgress = 1 + (cards.length - 1) * stagger;
    const finalArtworkRevealProgress = (cards.length - 1) * stagger + 0.16;
    const fullCardProgress = 1100 / 1620;
    let touchArtworkIndex = Math.min(
      artworkCards.length - 1,
      Math.max(0, Math.round((progress - fullCardProgress) / stagger) - 1),
    );

    const renderDepth = () => {
      animationFrame = undefined;

      if (touchMode) {
        setHasMoreArtworks(touchArtworkIndex < artworkCards.length - 1);
        artworkCards.forEach((card, index) => {
          const isCurrentArtwork = index === touchArtworkIndex;
          card.hidden = !isCurrentArtwork;
          card.inert = !isCurrentArtwork;
          card.style.setProperty("--scroll-z", "0px");
          card.style.setProperty(
            "--scroll-opacity",
            isCurrentArtwork ? "1" : "0",
          );
          card.style.pointerEvents = isCurrentArtwork ? "auto" : "none";
          card.style.zIndex = isCurrentArtwork ? "1" : "0";
        });
        return;
      }

      setHasMoreArtworks(!reducedMotion && progress < finalArtworkRevealProgress);

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
        const fadeOut = Math.min(1, (1 - cardProgress) / 0.07);
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
        return;
      }

      if (movingForward && !canMoveForward) {
        return;
      }

      if ((movingForward && canMoveForward) || (!movingForward && canMoveBackward)) {
        event.preventDefault();
        setIsInstructionVisible(false);
        progress = Math.min(
          maximumProgress,
          Math.max(minimumProgress, progress + event.deltaY * 0.0009),
        );
        requestRender();
      }
    };

    const handleTouchStart = (event) => {
      if (disabled || event.touches.length !== 1) return;
      if (!touchMode) {
        touchMode = true;
        gallery.classList.add("gallery--touch-carousel");
        touchArtworkIndex = Math.min(
          artworkCards.length - 1,
          Math.max(0, touchArtworkIndex),
        );
        requestRender();
      }
      touchStartY = event.touches[0].clientY;
      touchDeltaY = 0;
    };

    const handleTouchMove = (event) => {
      if (
        disabled
        || touchStartY === null
        || event.touches.length !== 1
      ) return;

      const currentTouchY = event.touches[0].clientY;
      touchDeltaY = touchStartY - currentTouchY;

      const movingForward = touchDeltaY > 0;
      const canMoveForward = touchArtworkIndex < artworkCards.length - 1;
      const canMoveBackward = touchArtworkIndex > 0;

      if (
        (movingForward && canMoveForward)
        || (!movingForward && canMoveBackward)
      ) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (touchStartY === null) return;

      if (Math.abs(touchDeltaY) >= 24) {
        suppressClickUntil = Date.now() + 500;
        if (!hasTouchNavigated) {
          hasTouchNavigated = true;
          touchArtworkIndex = 0;
        } else if (
          touchDeltaY > 0
          && touchArtworkIndex < artworkCards.length - 1
        ) {
          touchArtworkIndex += 1;
        } else if (touchDeltaY < 0 && touchArtworkIndex > 0) {
          touchArtworkIndex -= 1;
        }

        setIsInstructionVisible(false);
        progress = Math.min(
          maximumProgress,
          Math.max(
            minimumProgress,
            (touchArtworkIndex + 1) * stagger + fullCardProgress,
          ),
        );
        requestRender();
      }

      touchStartY = null;
      touchDeltaY = 0;
    };

    const resetGallery = () => {
      progress = minimumProgress;
      touchArtworkIndex = 0;
      hasTouchNavigated = false;
      requestRender();
    };

    const savePositionBeforeOpeningArtwork = (event) => {
      if (!event.target.closest("a.artwork-card")) return;
      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

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
    gallery.addEventListener("touchstart", handleTouchStart, { passive: true });
    gallery.addEventListener("touchmove", handleTouchMove, { passive: false });
    gallery.addEventListener("touchend", handleTouchEnd);
    gallery.addEventListener("touchcancel", handleTouchEnd);
    window.addEventListener("scroll", resetWhenLeavingGallery, { passive: true });
    window.addEventListener("gallery:reset", resetGallery);
    gallery.addEventListener("click", savePositionBeforeOpeningArtwork, true);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      gallery.removeEventListener("touchstart", handleTouchStart);
      gallery.removeEventListener("touchmove", handleTouchMove);
      gallery.removeEventListener("touchend", handleTouchEnd);
      gallery.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("scroll", resetWhenLeavingGallery);
      window.removeEventListener("gallery:reset", resetGallery);
      gallery.removeEventListener("click", savePositionBeforeOpeningArtwork, true);
      gallery.classList.remove("gallery--touch-carousel");
      artworkCards.forEach((card) => {
        card.hidden = false;
        card.inert = false;
        card.style.pointerEvents = "";
        card.style.zIndex = "";
      });
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
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
        {isInstructionVisible && (
          <div
            className="artwork-card-flight gallery-instruction"
            style={{
              "--card-x": "50%",
              "--card-y": "52%",
              "--card-width": "25rem",
              zIndex: 30,
            }}
          >
            <WindowFrame title="*Hint*" className="gallery-instruction__window">
              <p>
                Scroll or swipe to explore my artworks. Click an artwork to
                view its details.
              </p>
            </WindowFrame>
          </div>
        )}
        {galleryArtworks.map((artwork, index) => (
          <ArtworkCard artwork={artwork} index={index} key={artwork.id} />
        ))}
      </div>
      <div
        className={`gallery-scroll-cue${hasMoreArtworks ? "" : " gallery-scroll-cue--complete"}`}
        aria-hidden="true"
      >
        <span className="gallery-scroll-cue__arrow">
          {hasMoreArtworks ? "↕" : "✦"}
        </span>
        <span>
          {hasMoreArtworks
            ? "Scroll or swipe to explore"
            : "Check out other sections in the menu"}
        </span>
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
          <a href={sitePath("creating-process")}>Creating Process</a>
          <a href={sitePath("puzzle-room")}>Puzzle Room</a>
        </nav>
        <button
          className="site-header__menu"
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
      </header>

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
              <a href={sitePath("creating-process")} onClick={() => setIsMenuOpen(false)}>
                Creating Process
              </a>
              <a href={sitePath("puzzle-room")} onClick={() => setIsMenuOpen(false)}>
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
