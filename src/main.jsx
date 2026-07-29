import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ArtworkDetailPage from "./ArtworkDetailPage.jsx";
import CreatingProcessPage from "./CreatingProcessPage.jsx";
import PuzzleRoom from "./PuzzleRoom.jsx";
import { currentSitePath } from "./sitePaths.js";

const sitePathname = currentSitePath();
const artworkPathMatch = sitePathname.match(/^\/artwork\/([^/]+)\/?$/);
const isLegacyDetailPath = sitePathname === "/artwork-detail";
const isCreatingProcessPath = /^\/creating-process\/?$/.test(sitePathname);
const isPuzzleRoomPath = /^\/puzzle-room\/?$/.test(sitePathname);
const artworkId = artworkPathMatch
  ? decodeURIComponent(artworkPathMatch[1])
  : new URLSearchParams(window.location.search).get("id") || "chibi-ykhm";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isPuzzleRoomPath ? (
      <PuzzleRoom />
    ) : isCreatingProcessPath ? (
      <CreatingProcessPage />
    ) : artworkPathMatch || isLegacyDetailPath ? (
      <ArtworkDetailPage artworkId={artworkId} />
    ) : (
      <App />
    )}
  </StrictMode>
);
