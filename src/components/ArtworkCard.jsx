const featuredPositions = {
  "chibi-ykhm": { x: 36, y: 42 },
  "illust-matsuri": { x: 64, y: 46 },
  "illust-mwy": { x: 43, y: 64 },
  "illust-puzzle": { x: 61, y: 59 },
  "illust-starlight": { x: 50, y: 36 },
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


  const CardElement = artwork.hasProcess ? "a" : "article";
  const interactiveProps = artwork.hasProcess
    ? {
        href: `/artwork/${encodeURIComponent(artwork.id)}`,
        "aria-label": `View ${artwork.title}`,
      }
    : {};

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
      <CardElement className="artwork-card" {...interactiveProps}>
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
        </div>
        <div className="artwork-card__title-area">
          <h3 className="artwork-card__title">{artwork.title || "Untitled"}</h3>
        </div>
      </CardElement>
    </div>
  );
}

export default ArtworkCard;
