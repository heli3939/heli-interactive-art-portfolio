import { useEffect, useLayoutEffect, useRef, useState } from "react";
import WindowFrame from "./components/WindowFrame";
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

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <header className="site-header">
        <a
          className="site-header__logo"
          href="#"
          aria-label="Heli home"
          tabIndex={isMenuOpen ? -1 : undefined}
        >
          <img src={logo} alt="Heli" />
        </a>

        <nav className="site-header__nav" aria-label="Primary navigation">
          <a href="#gallery">Gallery Entrance</a>
          <a href="/creating-process">Creating Process</a>
          <a href="#puzzle">Puzzle Room</a>
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
              <a href="#gallery" onClick={() => setIsMenuOpen(false)}>
                Gallery Entrance
              </a>
              <a href="/creating-process" onClick={() => setIsMenuOpen(false)}>
                Creating Process
              </a>
              <a href="#puzzle" onClick={() => setIsMenuOpen(false)}>
                Puzzle Room
              </a>
            </nav>
          </aside>
        </>
      )}

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
    </div>
  );
}

export default App;
