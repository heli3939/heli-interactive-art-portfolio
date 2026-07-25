function ArtworkCard({ artwork }) {
  const description = artwork.description ?? artwork.shortDescription;
  const isPlaceholder = description?.toLowerCase().startsWith("placeholder");

  return (
    <article className="artwork-card">
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
      <div className="artwork-card__body">
        <p className="artwork-card__category">{artwork.category || "Artwork"}</p>
        <h3 className="artwork-card__title">{artwork.title || "Untitled"}</h3>
        {description && !isPlaceholder && (
          <p className="artwork-card__description">{description}</p>
        )}
        {/* Temporary link until artwork detail routes are implemented. */}
        <a className="artwork-card__link" href={`#${artwork.id}`}>
          View artwork <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export default ArtworkCard;
