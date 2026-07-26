import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ArtworkDetailPage from "./ArtworkDetailPage.jsx";

const artworkPathMatch = window.location.pathname.match(/^\/artwork\/([^/]+)\/?$/);
const isLegacyDetailPath = window.location.pathname === "/artwork-detail";
const artworkId = artworkPathMatch
  ? decodeURIComponent(artworkPathMatch[1])
  : new URLSearchParams(window.location.search).get("id") || "chibi-ykhm";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {artworkPathMatch || isLegacyDetailPath ? (
      <ArtworkDetailPage artworkId={artworkId} />
    ) : (
      <App />
    )}
  </StrictMode>
);
