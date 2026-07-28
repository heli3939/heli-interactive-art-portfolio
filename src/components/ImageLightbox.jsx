import { useEffect } from "react";
import "./ImageLightbox.css";

function ImageLightbox({ image, alt, onClose }) {
  useEffect(() => {
    if (!image) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged process image"
      onClick={onClose}
    >
      <div className="image-lightbox__content" onClick={(event) => event.stopPropagation()}>
        <img src={image} alt={alt} />
        <button
          className="image-lightbox__close"
          type="button"
          aria-label="Close enlarged image"
          onClick={onClose}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default ImageLightbox;
