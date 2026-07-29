import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ArtworkDetailPage from "./ArtworkDetailPage.jsx";
import CreatingProcessPage from "./CreatingProcessPage.jsx";
import PuzzleRoom from "./PuzzleRoom.jsx";

const artworkPathMatch = window.location.pathname.match(/^\/artwork\/([^/]+)\/?$/);
const isLegacyDetailPath = window.location.pathname === "/artwork-detail";
const isCreatingProcessPath = /^\/creating-process\/?$/.test(window.location.pathname);
const isPuzzleRoomPath = /^\/puzzle-room\/?$/.test(window.location.pathname);
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
