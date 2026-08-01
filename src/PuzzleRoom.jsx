import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import artworks from "./data/artworks";
import puzzleReferences from "./data/puzzleReferences";
import WindowFrame from "./components/WindowFrame";
import background from "./assets/background/bg_1000px.jpg";
import logo from "./assets/icons/logo.png";
import "./PuzzleRoom.css";
import { sitePath } from "./sitePaths.js";

const puzzlePieceIds = Array.from(
  { length: 9 },
  (_, index) => `illust-puzzle-game-${index + 1}`,
);
const progressStorageKey = "puzzle-room-placed";
const layoutStorageKey = "puzzle-room-layout";
const completionPromptDelay = 1400;

const desktopPositions = [
  [21, 20], [50, 19], [79, 21], [22, 50], [50, 49],
  [78, 51], [21, 80], [50, 81], [79, 79],
];

const mobilePositions = [
  [17, 16], [49, 15], [82, 18], [18, 49], [50, 48],
  [82, 51], [17, 82], [49, 83], [81, 81],
];

function readStoredArray(key) {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function createLayoutOrder() {
  const storedOrder = readStoredArray(layoutStorageKey);
  const isValidOrder = storedOrder.length === puzzlePieceIds.length
    && new Set(storedOrder).size === puzzlePieceIds.length
    && storedOrder.every((index) => Number.isInteger(index) && index >= 0 && index < 9);
  if (isValidOrder) return storedOrder;

  const order = Array.from({ length: puzzlePieceIds.length }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }
  try {
    window.sessionStorage.setItem(layoutStorageKey, JSON.stringify(order));
  } catch {
    // The puzzle still works when browser storage is unavailable.
  }
  return order;
}

function createPlacedSet() {
  return new Set(
    readStoredArray(progressStorageKey).filter((id) => puzzlePieceIds.includes(id)),
  );
}

function makePieces(isMobile, layoutOrder) {
  const positions = [...(isMobile ? mobilePositions : desktopPositions)];
  const xCellOffset = isMobile ? 23.2 : 21;
  const yCellOffset = isMobile ? 22.5 : 20.4;

  return puzzlePieceIds.map((id, index) => {
    const artwork = artworks.find((item) => item.id === id);
    const position = positions[layoutOrder[index]];
    const columnOffset = (index % 3 - 1) * xCellOffset;
    const rowOffset = (Math.floor(index / 3) - 1) * yCellOffset;
    if (!artwork?.image) {
      console.warn(`[Puzzle Room] Missing artwork or image source for "${id}".`);
    }

    return {
      id,
      number: index + 1,
      correctIndex: index,
      image: artwork?.image,
      alt: artwork?.alt || artwork?.title || `Puzzle piece ${index + 1}`,
      x: position[0] - columnOffset,
      y: position[1] - rowOffset,
      duration: 4.8 + (index % 4) * 0.7,
      delay: -(index * 0.43),
    };
  });
}

function ReferencePiece({ piece, reference, active, dimmed, onToggle }) {
  const row = Math.floor((reference.id - 1) / 3);
  const column = (reference.id - 1) % 3;

  return (
    <button
      className={[
        "reference-piece",
        active ? "is-active" : "",
        dimmed ? "is-dimmed" : "",
      ].join(" ")}
      type="button"
      aria-label={`${active ? "Close" : "Open"} reference ${reference.id}: ${reference.albumTitle}`}
      aria-pressed={active}
      onClick={(event) => {
        event.stopPropagation();
        onToggle(reference.id);
      }}
      style={{
        "--reference-row": row,
        "--reference-column": column,
        "--reference-shape": `url("${piece.image}")`,
      }}
    >
      <img className="reference-piece__art" src={piece.image} alt="" draggable={false} />
    </button>
  );
}

function ReferenceAnnotation({ reference, onClose }) {
  const row = Math.floor((reference.id - 1) / 3);
  const column = (reference.id - 1) % 3;

  return (
    <WindowFrame
      className={`reference-note reference-note--${reference.position}`}
      title={`REFERENCE ${String(reference.id).padStart(2, "0")}`}
      onClose={onClose}
      onClick={(event) => event.stopPropagation()}
      style={{
        "--reference-row": row,
        "--reference-column": column,
      }}
    >
      <div className="reference-note__body">
        <a
          className="reference-note__cover-link"
          href={reference.musicUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Listen to ${reference.albumTitle} on YouTube Music`}
        >
          <img
            src={reference.albumCover}
            alt={`${reference.albumTitle} album cover`}
            draggable={false}
            referrerPolicy="no-referrer"
          />
          <span>♪ Listen ↗</span>
        </a>
        <div className="reference-note__copy">
          <h2>{reference.albumTitle}</h2>
          <p className="reference-note__credit">
            {reference.artist}{reference.year ? ` · ${reference.year}` : ""}
          </p>
          <p className="reference-note__description">{reference.description}</p>
        </div>
      </div>
    </WindowFrame>
  );
}

function PuzzleRoom() {
  const roomRef = useRef(null);
  const boardRef = useRef(null);
  const dragRef = useRef(null);
  const alphaCanvasRef = useRef(new WeakMap());
  const [layoutOrder] = useState(createLayoutOrder);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 720);
  const pieces = useMemo(
    () => makePieces(isMobile, layoutOrder),
    [isMobile, layoutOrder],
  );
  const [placed, setPlaced] = useState(createPlacedSet);
  const unlockPromptOpenedRef = useRef(placed.size === puzzlePieceIds.length);
  const [isExploring, setIsExploring] = useState(false);
  const [drag, setDrag] = useState(null);
  const [highlighted, setHighlighted] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [incorrectPiece, setIncorrectPiece] = useState(null);
  const [recentPiece, setRecentPiece] = useState(null);
  const [hoveredPiece, setHoveredPiece] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeReference, setActiveReference] = useState(null);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);

  const completed = placed.size === pieces.length;
  const puzzleMode = !completed
    ? "playing"
    : activeReference
      ? "viewingDetail"
      : isExploring
        ? "exploring"
        : "completed";
  const boardArtwork = artworks.find((item) => item.id === "illust-puzzle-game-0");

  useEffect(() => {
    document.body.classList.add("has-puzzle-room");
    return () => document.body.classList.remove("has-puzzle-room");
  }, []);

  useEffect(() => {
    const updateLayout = () => setIsMobile(window.innerWidth <= 720);
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(progressStorageKey, JSON.stringify([...placed]));
    } catch {
      // The in-memory puzzle state remains available when storage is blocked.
    }
  }, [placed]);

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
    if (!incorrectPiece && !recentPiece) return undefined;
    const timer = window.setTimeout(() => {
      setIncorrectPiece(null);
      setRecentPiece(null);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [incorrectPiece, recentPiece]);

  useEffect(() => {
    if (!activeReference) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setActiveReference(null);
        setIsExploring(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeReference]);

  useEffect(() => {
    if (!showUnlockPrompt) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowUnlockPrompt(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showUnlockPrompt]);

  useEffect(() => {
    if (!completed || unlockPromptOpenedRef.current) return undefined;
    unlockPromptOpenedRef.current = true;
    setIsExploring(true);
    const timer = window.setTimeout(() => {
      setShowUnlockPrompt(true);
    }, completionPromptDelay);
    return () => window.clearTimeout(timer);
  }, [completed]);

  const attemptPlacement = useCallback((pieceId, cellIndex) => {
    const piece = pieces.find((item) => item.id === pieceId);
    const isAvailable = !placed.has(pieceId)
      && ![...placed].some((id) => pieces.find((item) => item.id === id)?.correctIndex === cellIndex);

    if (piece && cellIndex === piece.correctIndex && isAvailable) {
      setPlaced((current) => new Set(current).add(pieceId));
      setRecentPiece(pieceId);
      setSelectedPiece(null);
      return true;
    }

    setIncorrectPiece(pieceId);
    return false;
  }, [pieces, placed]);

  const getAlphaMap = (image) => {
    if (!image?.complete || !image.naturalWidth) return null;
    let alphaMap = alphaCanvasRef.current.get(image);
    if (alphaMap) return alphaMap;

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const alpha = new Uint8Array(canvas.width * canvas.height);
    let opaqueLeft = canvas.width;
    let opaqueRight = -1;
    let opaqueTop = canvas.height;
    let opaqueBottom = -1;
    for (let index = 0; index < alpha.length; index += 1) {
      alpha[index] = pixels[index * 4 + 3];
      if (alpha[index] > 24) {
        const x = index % canvas.width;
        const y = Math.floor(index / canvas.width);
        opaqueLeft = Math.min(opaqueLeft, x);
        opaqueRight = Math.max(opaqueRight, x);
        opaqueTop = Math.min(opaqueTop, y);
        opaqueBottom = Math.max(opaqueBottom, y);
      }
    }
    const hasOpaquePixels = opaqueRight >= opaqueLeft && opaqueBottom >= opaqueTop;
    alphaMap = {
      alpha,
      width: canvas.width,
      height: canvas.height,
      opaqueCenterX: hasOpaquePixels
        ? ((opaqueLeft + opaqueRight) / 2 + 0.5) / canvas.width
        : 0.5,
      opaqueCenterY: hasOpaquePixels
        ? ((opaqueTop + opaqueBottom) / 2 + 0.5) / canvas.height
        : 0.5,
      opaqueLeft: hasOpaquePixels ? opaqueLeft / canvas.width : 0,
      opaqueRight: hasOpaquePixels ? (opaqueRight + 1) / canvas.width : 1,
      opaqueTop: hasOpaquePixels ? opaqueTop / canvas.height : 0,
      opaqueBottom: hasOpaquePixels ? (opaqueBottom + 1) / canvas.height : 1,
    };
    alphaCanvasRef.current.set(image, alphaMap);
    return alphaMap;
  };

  const isOpaqueAt = (image, bounds, clientX, clientY) => {
    const map = getAlphaMap(image);
    if (!map || bounds.width <= 0 || bounds.height <= 0) return false;
    const relativeX = (clientX - bounds.left) / bounds.width;
    const relativeY = (clientY - bounds.top) / bounds.height;
    if (relativeX < 0 || relativeX >= 1 || relativeY < 0 || relativeY >= 1) return false;
    const x = Math.min(map.width - 1, Math.floor(relativeX * map.width));
    const y = Math.min(map.height - 1, Math.floor(relativeY * map.height));
    return map.alpha[y * map.width + x] > 24;
  };

  const isVisiblePixel = (event, element = event.currentTarget) => {
    const image = element.querySelector("img");
    return isOpaqueAt(
      image,
      element.getBoundingClientRect(),
      event.clientX,
      event.clientY,
    );
  };

  const visiblePieceAtPoint = (event) => {
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    for (const element of elements) {
      if (!element.classList?.contains("puzzle-piece")) continue;
      if (!isVisiblePixel(event, element)) continue;
      const piece = pieces.find((item) => item.id === element.dataset.pieceId);
      if (piece && !placed.has(piece.id)) return { piece, element };
    }
    return null;
  };

  const updatePieceHover = (event, pieceId) => {
    if (dragRef.current) return;
    const visibleTarget = visiblePieceAtPoint(event);
    setHoveredPiece(visibleTarget?.piece.id ?? (
      isVisiblePixel(event) ? pieceId : null
    ));
  };

  const cellFromDraggedPiece = (dragState) => {
    const board = boardRef.current;
    if (!board) return null;
    const boardBounds = board.getBoundingClientRect();
    const opaqueBounds = {
      left: dragState.x + dragState.width * dragState.opaqueLeft,
      right: dragState.x + dragState.width * dragState.opaqueRight,
      top: dragState.y + dragState.height * dragState.opaqueTop,
      bottom: dragState.y + dragState.height * dragState.opaqueBottom,
    };
    const opaqueArea = Math.max(
      1,
      (opaqueBounds.right - opaqueBounds.left)
        * (opaqueBounds.bottom - opaqueBounds.top),
    );
    const cellWidth = boardBounds.width / 3;
    const cellHeight = boardBounds.height / 3;
    let strongestCell = null;
    let strongestOverlap = 0;

    for (let index = 0; index < 9; index += 1) {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const cellLeft = boardBounds.left + column * cellWidth;
      const cellRight = cellLeft + cellWidth;
      const cellTop = boardBounds.top + row * cellHeight;
      const cellBottom = cellTop + cellHeight;
      const overlapWidth = Math.max(
        0,
        Math.min(opaqueBounds.right, cellRight)
          - Math.max(opaqueBounds.left, cellLeft),
      );
      const overlapHeight = Math.max(
        0,
        Math.min(opaqueBounds.bottom, cellBottom)
          - Math.max(opaqueBounds.top, cellTop),
      );
      const overlap = overlapWidth * overlapHeight / opaqueArea;
      if (overlap > strongestOverlap) {
        strongestOverlap = overlap;
        strongestCell = index;
      }
    }

    return strongestOverlap >= 0.3 ? strongestCell : null;
  };

  const handlePointerDown = (event, piece) => {
    if (placed.has(piece.id) || completed) return;
    const visibleTarget = visiblePieceAtPoint(event);
    if (!visibleTarget) return;
    const activePiece = visibleTarget.piece;
    const bounds = visibleTarget.element.getBoundingClientRect();
    const piecesArea = visibleTarget.element.closest(".puzzle-pieces-area");
    if (!piecesArea) return;
    const piecesAreaBounds = piecesArea.getBoundingClientRect();
    const alphaMap = getAlphaMap(visibleTarget.element.querySelector("img"));
    event.preventDefault();
    visibleTarget.element.setPointerCapture(event.pointerId);
    visibleTarget.element.blur();
    const nextDrag = {
      id: activePiece.id,
      x: bounds.left,
      y: bounds.top,
      width: bounds.width,
      height: bounds.height,
      containerLeft: piecesAreaBounds.left + piecesArea.clientLeft,
      containerTop: piecesAreaBounds.top + piecesArea.clientTop,
      anchorRatioX: alphaMap?.opaqueCenterX ?? 0.5,
      anchorRatioY: alphaMap?.opaqueCenterY ?? 0.5,
      opaqueLeft: alphaMap?.opaqueLeft ?? 0,
      opaqueRight: alphaMap?.opaqueRight ?? 1,
      opaqueTop: alphaMap?.opaqueTop ?? 0,
      opaqueBottom: alphaMap?.opaqueBottom ?? 1,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    };
    dragRef.current = { ...nextDrag, pointerId: event.pointerId };
    setDrag(nextDrag);
    setSelectedPiece(activePiece.id);
    setHoveredPiece(null);
  };

  const handlePointerMove = (event) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const nextDrag = {
      ...current,
      x: event.clientX - current.offsetX,
      y: event.clientY - current.offsetY,
    };
    dragRef.current = nextDrag;
    setDrag(nextDrag);
    setHighlighted(cellFromDraggedPiece(nextDrag));
  };

  const handlePointerUp = (event) => {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.blur();
    const droppedCell = cellFromDraggedPiece(active);
    if (droppedCell !== null) {
      attemptPlacement(active.id, droppedCell);
    }
    dragRef.current = null;
    setDrag(null);
    setHighlighted(null);
    setSelectedPiece(null);
  };

  const resetPuzzle = () => {
    try {
      window.sessionStorage.removeItem(progressStorageKey);
    } catch {
      // Reset still clears the in-memory state when storage is blocked.
    }
    setPlaced(new Set());
    setDrag(null);
    dragRef.current = null;
    setHighlighted(null);
    setSelectedPiece(null);
    setHoveredPiece(null);
    setIncorrectPiece(null);
    setRecentPiece(null);
    setActiveReference(null);
    setIsExploring(false);
    setShowUnlockPrompt(false);
    unlockPromptOpenedRef.current = false;
  };

  const returnFromPuzzle = () => {
    setActiveReference(null);
    setIsExploring(false);
  };

  const activeReferenceData = puzzleReferences.find(
    (reference) => reference.id === activeReference,
  );

  return (
    <div
      className={`puzzle-page ${completed ? "is-complete" : "is-incomplete"}`}
      style={{ "--puzzle-background": `url(${background})` }}
    >
      <header className="site-header">
        {completed && isExploring && !isMenuOpen && (
          <button
            className="puzzle-header__back"
            type="button"
            onClick={returnFromPuzzle}
            aria-label="Return to the completed Puzzle Room"
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        )}
        <a className="site-header__logo" href={sitePath()} aria-label="Heli home">
          <img src={logo} alt="Heli" />
        </a>
        <nav className="site-header__nav" aria-label="Primary navigation">
          <a href={sitePath("#gallery")}>Artwork Collection</a>
          <a href={sitePath("creating-process")}>Creating Process</a>
          <a href={sitePath("puzzle-room")} aria-current="page">Puzzle Room</a>
        </nav>
        <button
          className="site-header__menu"
          type="button"
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-controls="puzzle-mobile-navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span /><span /><span />
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
            aria-labelledby="puzzle-mobile-nav-heading"
          >
            <p className="mobile-nav__heading" id="puzzle-mobile-nav-heading">
              Navigation
            </p>
            <nav id="puzzle-mobile-navigation" aria-label="Mobile navigation">
              <a href={sitePath("#gallery")}>Artwork Collection</a>
              <a href={sitePath("creating-process")}>Creating Process</a>
              <a href={sitePath("puzzle-room")} aria-current="page" onClick={() => setIsMenuOpen(false)}>
                Puzzle Room
              </a>
            </nav>
          </aside>
        </>
      )}

      <main
        className={`puzzle-room ${completed ? "is-complete" : "is-incomplete"}${isExploring ? " is-exploring" : ""}`}
        data-puzzle-mode={puzzleMode}
        ref={roomRef}
        inert={isMenuOpen || showUnlockPrompt ? true : undefined}
      >
        {completed && isExploring && !isMenuOpen && (
          <button
            className="puzzle-complete-back"
            type="button"
            onClick={returnFromPuzzle}
            aria-label="Return to the completed Puzzle Room"
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        )}
        <div className="puzzle-board-column">
          <div
            className={`puzzle-explorer${activeReference ? " has-active-reference" : ""}`}
            onClick={() => {
              if (completed) setActiveReference(null);
            }}
          >
            <section
              className={`puzzle-board${completed ? " is-complete" : ""}`}
              ref={boardRef}
              aria-label="Three by three puzzle board"
            >
            {boardArtwork?.image && (
              <img className="puzzle-board__guide" src={boardArtwork.image} alt="" draggable={false} />
            )}
            <div className="puzzle-board__cells">
              {pieces.map((piece, index) => {
                const isMatch = selectedPiece === piece.id && piece.correctIndex === index;
                return (
                  <button
                    className={[
                      "puzzle-cell",
                      highlighted === index ? (isMatch ? "is-valid" : "is-invalid") : "",
                    ].join(" ")}
                    type="button"
                    key={piece.id}
                    aria-label={`Puzzle position ${index + 1}${placed.has(piece.id) ? ", filled" : ""}`}
                    onKeyDown={(event) => {
                      if ((event.key === "Enter" || event.key === " ") && selectedPiece) {
                        event.preventDefault();
                        attemptPlacement(selectedPiece, index);
                      }
                    }}
                  />
                );
              })}
            </div>
            {pieces.filter((piece) => placed.has(piece.id)).map((piece) => (
              piece.image && (
                <img
                  className={`puzzle-board__placed${recentPiece === piece.id ? " is-recent" : ""}`}
                  src={piece.image}
                  alt=""
                  draggable={false}
                  key={piece.id}
                />
              )
            ))}
            {highlighted !== null && pieces[highlighted]?.image && (
              <div
                className={`puzzle-board__drop-shape${
                  selectedPiece === pieces[highlighted].id ? " is-valid" : " is-invalid"
                }`}
                style={{ "--drop-shape": `url("${pieces[highlighted].image}")` }}
                aria-hidden="true"
              />
            )}
              {completed && isExploring && (
                <div className="reference-grid" aria-label="Album references">
                  {puzzleReferences.map((reference) => {
                    const piece = pieces[reference.id - 1];
                    return piece?.image ? (
                      <ReferencePiece
                        key={reference.id}
                        piece={piece}
                        reference={reference}
                        active={activeReference === reference.id}
                        dimmed={activeReference !== null && activeReference !== reference.id}
                        onToggle={(id) => setActiveReference((current) => current === id ? null : id)}
                      />
                    ) : null;
                  })}
                </div>
              )}
            </section>
            {completed && activeReferenceData && (
              <ReferenceAnnotation
                reference={activeReferenceData}
                onClose={returnFromPuzzle}
              />
            )}
          </div>
          {!isExploring && (
            <div className="puzzle-status">
              <p aria-live="polite">{`${placed.size} of 9 pieces placed`}</p>
              <div>
                <button type="button" onClick={resetPuzzle}>Reset</button>
                {completed && (
                  <button type="button" onClick={() => setIsExploring(true)}>
                    Explore
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <section className="puzzle-pieces-area" aria-label="Loose puzzle pieces">
          {pieces.map((piece) => {
            if (placed.has(piece.id) || !piece.image) return null;
            const isDragging = drag?.id === piece.id;
            const isSelected = selectedPiece === piece.id;
            return (
              <div
                className={`puzzle-piece-boundary${isSelected ? " is-active" : ""}`}
                key={piece.id}
              >
                <button
                  className={[
                    "puzzle-piece",
                    isDragging ? "is-dragging" : "",
                    incorrectPiece === piece.id ? "is-incorrect" : "",
                    isSelected ? "is-selected" : "",
                    hoveredPiece === piece.id ? "is-alpha-hover" : "",
                  ].join(" ")}
                  type="button"
                  data-piece-id={piece.id}
                  aria-label={`Puzzle piece ${piece.number}. Press Enter or Space to select it.`}
                  aria-pressed={isSelected}
                  style={isDragging ? {
                    left: `${drag.x - drag.containerLeft}px`,
                    top: `${drag.y - drag.containerTop}px`,
                    width: `${drag.width}px`,
                    height: `${drag.height}px`,
                    position: "absolute",
                    "--piece-shape": `url("${piece.image}")`,
                    "--float-duration": `${piece.duration}s`,
                    "--float-delay": `${piece.delay}s`,
                  } : {
                    left: `${piece.x}%`,
                    top: `${piece.y}%`,
                    "--piece-shape": `url("${piece.image}")`,
                    "--float-duration": `${piece.duration}s`,
                    "--float-delay": `${piece.delay}s`,
                  }}
                  onPointerDown={(event) => handlePointerDown(event, piece)}
                  onPointerMove={(event) => {
                    updatePieceHover(event, piece.id);
                    handlePointerMove(event);
                  }}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onPointerLeave={() => {
                    if (!dragRef.current) setHoveredPiece(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPiece(piece.id);
                    }
                  }}
                >
                  <img src={piece.image} alt={piece.alt} draggable={false} />
                </button>
              </div>
            );
          })}
        </section>

      </main>

      {showUnlockPrompt && (
        <div className="puzzle-unlock-prompt" role="presentation">
          <WindowFrame
            className="puzzle-unlock-prompt__window"
            title="PUZZLE COMPLETE!"
            onClose={() => setShowUnlockPrompt(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="puzzle-unlock-heading"
          >
            <div className="puzzle-unlock-prompt__content">
              <h2 id="puzzle-unlock-heading">Music references unlocked!</h2>
              <p>
                Click each puzzle piece to explore music and concepts behind it.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowUnlockPrompt(false);
                  setIsExploring(true);
                }}
              >
                Start Exploration
              </button>
            </div>
          </WindowFrame>
        </div>
      )}
    </div>
  );
}

export default PuzzleRoom;
