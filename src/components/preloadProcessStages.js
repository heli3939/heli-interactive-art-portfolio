import processStagesFor from "./processStages";

const processImageCache = new Map();

function preloadImage(source, fetchPriority) {
  if (!source) return Promise.resolve();
  if (processImageCache.has(source)) return processImageCache.get(source).promise;

  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = fetchPriority;

  const promise = new Promise((resolve) => {
    image.onload = () => {
      if (!image.decode) {
        resolve();
        return;
      }
      image.decode().catch(() => {}).finally(resolve);
    };
    image.onerror = resolve;
  });

  processImageCache.set(source, { image, promise });
  image.src = source;
  return promise;
}

export default function preloadProcessStages(artwork, fetchPriority = "auto") {
  return Promise.all(
    processStagesFor(artwork).map((stage) =>
      preloadImage(stage.image, fetchPriority),
    ),
  );
}
