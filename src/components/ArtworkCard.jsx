import { sitePath } from "../sitePaths.js";

const featuredPositions = {
  "chibi-ykhm": { x: 43, y: 46 },
  "illust-matsuri": { x: 57, y: 48 },
  "illust-mwy": { x: 47, y: 56 },
  "illust-puzzle": { x: 55, y: 54 },
  "illust-starlight": { x: 50, y: 44 },
};

function ArtworkCard({ artwork, index = 0 }) {
  const featuredPosition = featuredPositions[artwork.id];
  const xPosition = featuredPosition?.x
    ?? [24, 72, 43, 76, 28, 60, 38, 70, 23, 52, 77][index % 11];
  const yPosition = featuredPosition?.y
    ?? [34, 30, 64, 58, 68, 38, 44, 70, 52, 66, 45][index % 11];
  const cardWidth = featuredPosition
    ? [19, 20, 21, 19, 20][
        ["chibi-ykhm", "illust-matsuri", "illust-mwy", "illust-puzzle", "illust-starlight"]
          .indexOf(artwork.id)
      ]
    : [20, 17, 19, 16, 18, 20, 17, 19, 16, 20, 17][index % 11];


  return (
    <div
      className="artwork-card-flight"
      style={{
        "--card-x": `${xPosition}%`,
        "--card-y": `${yPosition}%`,
        "--card-width": `${cardWidth}rem`,
        zIndex: 20 - index,
      }}
    >
      <a
        className="artwork-card"
        href={sitePath(`artwork/${encodeURIComponent(artwork.id)}`)}
        aria-label={`View details for ${artwork.title || "Untitled"}`}
      >
        <div className="artwork-card__frame">
          <div className="artwork-card__image-wrap">
            {artwork.image ? (
              <img
                className="artwork-card__image"
                src={artwork.image}
                alt={artwork.alt || artwork.title || "Artwork by heli"}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="artwork-card__image-placeholder">Image coming soon</div>
            )}
          </div>
          <div className="artwork-card__title-area">
            <p className="artwork-card__title">{artwork.title || "Untitled"}</p>
          </div>
        </div>
      </a>
    </div>
  );
}

export default ArtworkCard;
