export default function processStagesFor(artwork) {
  if (!artwork) return [];
  return [
    ...artwork.processImages,
    {
      id: `${artwork.id}-final`,
      image: artwork.image,
      alt: `${artwork.title} final artwork`,
    },
  ];
}
