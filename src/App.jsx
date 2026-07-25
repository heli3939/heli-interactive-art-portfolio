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
  return (
    <>
      <h1 className="pixel-heading about-window__heading">About Me</h1>
      <div className="about-window__copy">
        <p>
          Hi! I’m heli, a Melbourne-based digital artist who loves drawing cute
          character illustrations with vibrant and vivid colours.
        </p>
        <p>
          My work is mainly inspired by VOCALOID (especially my favourite Hatsune
          Miku!), internet culture, with some retro-futuristic elements.
        </p>
        <p>
          Hope you enjoy visiting my portfolio website! Scroll down to get started!
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
  return (
    <div className="about-page" style={{ "--page-background": `url(${background})` }}>
      <header className="site-header">
        <a className="site-header__logo" href="#" aria-label="Heli home">
          <img src={logo} alt="Heli" />
        </a>

        <nav className="site-header__nav" aria-label="Primary navigation">
          <a href="#gallery">Gallery Entrance</a>
          <a href="#process">Creating Process</a>
          <a href="#puzzle">Puzzle Room</a>
        </nav>

        <button className="site-header__menu" type="button" aria-label="Open navigation">
          <span />
          <span />
          <span />
        </button>
      </header>

      <main className="about-layout">
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
