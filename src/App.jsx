import "./App.css";

function App() {
  return (
    <main className="landing-page">
      <img
        className="landing-logo"
        src="src/assets/icons/logo.png"
        alt="heli's logo"
      />

      <img
        className="landing-pfp"
        src="src/assets/artworks/chibi/pfp/pfp_1000px.jpg"
        alt="heli's profile picture"
      />

      <div className="landing-text">
        <h1>heli</h1>

        <p>
          Welcome to my interactive art portfolio.
        </p>
      </div>
    </main>
  );
}

export default App;