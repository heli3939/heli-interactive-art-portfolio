import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import artworks from "./data/artworks";
import background from "./assets/background/bg_1000px.jpg";
import logo from "./assets/icons/logo.png";
import "./PuzzleRoom.css";

const puzzlePieceIds = Array.from(
  { length: 9 },
  (_, index) => `illust-puzzle-game-${index + 1}`,
);
const progressStorageKey = "puzzle-room-placed";
const layoutStorageKey = "puzzle-room-layout";

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
  const [drag, setDrag] = useState(null);
  const [highlighted, setHighlighted] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [incorrectPiece, setIncorrectPiece] = useState(null);
  const [recentPiece, setRecentPiece] = useState(null);
  const [hoveredPiece, setHoveredPiece] = useState(null);
  const [isLeavingPage, setIsLeavingPage] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const completed = placed.size === pieces.length;
  const finalArtwork = artworks.find((item) => item.id === "illust-puzzle");
  const boardArtwork = artworks.find((item) => item.id === "illust-puzzle-game-0");

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
    let navigationTimer;
    let navigating = false;

    const returnToCreatingProcess = (event) => {
      if (
        event.deltaY >= 0
        || window.scrollY > 1
        || navigating
        || dragRef.current
        || isMenuOpen
      ) return;

      event.preventDefault();
      navigating = true;
      setIsLeavingPage(true);
      navigationTimer = window.setTimeout(() => {
        window.location.assign("/creating-process");
      }, 650);
    };

    window.addEventListener("wheel", returnToCreatingProcess, { passive: false });
    return () => {
      window.removeEventListener("wheel", returnToCreatingProcess);
      if (navigationTimer !== undefined) window.clearTimeout(navigationTimer);
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

  const cellFromPoint = useCallback((clientX, clientY, tolerance = 16) => {
    const board = boardRef.current?.getBoundingClientRect();
    if (!board) return null;
    if (
      clientX < board.left - tolerance || clientX > board.right + tolerance
      || clientY < board.top - tolerance || clientY > board.bottom + tolerance
    ) return null;

    const x = Math.min(board.width - 1, Math.max(0, clientX - board.left));
    const y = Math.min(board.height - 1, Math.max(0, clientY - board.top));
    return Math.floor(y / (board.height / 3)) * 3
      + Math.floor(x / (board.width / 3));
  }, []);

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
    for (let index = 0; index < alpha.length; index += 1) {
      alpha[index] = pixels[index * 4 + 3];
    }
    alphaMap = { alpha, width: canvas.width, height: canvas.height };
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

  const shapesOverlap = (activeElement, activeBounds, otherElement) => {
    const otherBounds = otherElement.getBoundingClientRect();
    const left = Math.max(activeBounds.left, otherBounds.left);
    const right = Math.min(activeBounds.right, otherBounds.right);
    const top = Math.max(activeBounds.top, otherBounds.top);
    const bottom = Math.min(activeBounds.bottom, otherBounds.bottom);
    if (left >= right || top >= bottom) return false;

    const activeImage = activeElement.querySelector("img");
    const otherImage = otherElement.querySelector("img");
    const sampleStep = Math.max(2, Math.min(5, (right - left) / 20, (bottom - top) / 20));

    for (let y = top; y < bottom; y += sampleStep) {
      for (let x = left; x < right; x += sampleStep) {
        if (
          isOpaqueAt(activeImage, activeBounds, x, y)
          && isOpaqueAt(otherImage, otherBounds, x, y)
        ) return true;
      }
    }
    return false;
  };

  const collidesWithLoosePiece = (pieceId, nextX, nextY) => {
    const activeElement = document.querySelector(
      `.puzzle-piece[data-piece-id="${pieceId}"]`,
    );
    if (!activeElement) return false;
    const currentBounds = activeElement.getBoundingClientRect();
    const activeBounds = {
      left: nextX,
      top: nextY,
      width: currentBounds.width,
      height: currentBounds.height,
      right: nextX + currentBounds.width,
      bottom: nextY + currentBounds.height,
    };
    return [...document.querySelectorAll(".puzzle-piece")].some((element) => (
      element !== activeElement
      && shapesOverlap(activeElement, activeBounds, element)
    ));
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

  const handlePointerDown = (event, piece) => {
    if (placed.has(piece.id) || completed) return;
    const visibleTarget = visiblePieceAtPoint(event);
    if (!visibleTarget) return;
    const activePiece = visibleTarget.piece;
    const bounds = visibleTarget.element.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id: activePiece.id, pointerId: event.pointerId };
    setDrag({
      id: activePiece.id,
      x: bounds.left,
      y: bounds.top,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    });
    setSelectedPiece(activePiece.id);
    setHoveredPiece(null);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    setDrag((current) => {
      if (!current) return current;
      const nextX = event.clientX - current.offsetX;
      const nextY = event.clientY - current.offsetY;
      const distance = Math.hypot(nextX - current.x, nextY - current.y);
      const steps = Math.max(1, Math.ceil(distance / 20));
      for (let step = 1; step <= steps; step += 1) {
        const progress = step / steps;
        const sampleX = current.x + (nextX - current.x) * progress;
        const sampleY = current.y + (nextY - current.y) * progress;
        if (collidesWithLoosePiece(current.id, sampleX, sampleY)) return current;
      }
      return { ...current, x: nextX, y: nextY };
    });
    setHighlighted(cellFromPoint(event.clientX, event.clientY));
  };

  const handlePointerUp = (event) => {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const droppedCell = cellFromPoint(event.clientX, event.clientY);
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
  };

  return (
    <div
      className={`puzzle-page${isLeavingPage ? " puzzle-page--leaving" : ""}`}
      style={{ "--puzzle-background": `url(${background})` }}
    >
      <header className="puzzle-header">
        <a className="puzzle-header__back" href="/" aria-label="Return to Artwork Collection">
          <span aria-hidden="true">&gt;</span>
        </a>
        <a className="puzzle-header__logo" href="/" aria-label="Heli home">
          <img src={logo} alt="Heli" />
        </a>
        <nav className="puzzle-header__nav" aria-label="Primary navigation">
          <a href="/#gallery">Artwork Collection</a>
          <a href="/creating-process">Creating Process</a>
          <a href="/puzzle-room" aria-current="page">Puzzle Room</a>
        </nav>
        <button
          className="puzzle-header__menu"
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
              <a href="/#gallery">Artwork Collection</a>
              <a href="/creating-process">Creating Process</a>
              <a href="/puzzle-room" aria-current="page" onClick={() => setIsMenuOpen(false)}>
                Puzzle Room
              </a>
            </nav>
          </aside>
        </>
      )}

      <main className="puzzle-room" ref={roomRef} inert={isMenuOpen ? true : undefined}>
        <div className="puzzle-board-column">
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
            {completed && finalArtwork?.image && (
              <img
                className="puzzle-board__final"
                src={finalArtwork.image}
                alt={finalArtwork.alt || finalArtwork.title}
              />
            )}
          </section>
          <div className="puzzle-status">
            <p aria-live="polite">
              {completed ? "Puzzle Complete!" : `${placed.size} of 9 pieces placed`}
            </p>
            <div>
              <button type="button" onClick={resetPuzzle}>Reset Puzzle</button>
              {completed && <a href="/artwork/illust-puzzle">View Artwork</a>}
            </div>
            {completed && finalArtwork?.title && <h1>{finalArtwork.title}</h1>}
          </div>
        </div>

        <section className="puzzle-pieces-area" aria-label="Loose puzzle pieces">
          {pieces.map((piece) => {
            if (placed.has(piece.id) || !piece.image) return null;
            const isDragging = drag?.id === piece.id;
            return (
              <button
                className={[
                  "puzzle-piece",
                  isDragging ? "is-dragging" : "",
                  incorrectPiece === piece.id ? "is-incorrect" : "",
                  selectedPiece === piece.id ? "is-selected" : "",
                  hoveredPiece === piece.id ? "is-alpha-hover" : "",
                ].join(" ")}
                type="button"
                key={piece.id}
                data-piece-id={piece.id}
                aria-label={`Puzzle piece ${piece.number}. Press Enter or Space to select it.`}
                aria-pressed={selectedPiece === piece.id}
                style={isDragging ? {
                  left: `${drag.x}px`,
                  top: `${drag.y}px`,
                  position: "fixed",
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
            );
          })}
        </section>

      </main>
    </div>
  );
}

export default PuzzleRoom;
