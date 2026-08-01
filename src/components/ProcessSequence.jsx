import "./ProcessSequence.css";

const progressGradientStart = [128, 71, 255];
const progressGradientEnd = [57, 233, 255];

function getProgressColor(position) {
  const channels = progressGradientStart.map((start, index) =>
    Math.round(start + (progressGradientEnd[index] - start) * position),
  );

  return `rgb(${channels.join(" ")})`;
}

export default function ProcessSequence({
  title,
  titleAs: Title = "h2",
  stages,
  stageIndex,
  isPaused,
  onStageChange,
  onPauseChange,
  onImageOpen,
  classes,
}) {
  const progressStart = ((stageIndex + 0.5) / stages.length) * 100;
  const progressEnd = stageIndex === stages.length - 1
    ? 100
    : ((stageIndex + 1.5) / stages.length) * 100;

  return (
    <>
      <Title className={classes.title}>{title}</Title>
      <div className={classes.stage}>
        <img
          className={classes.sizeReference}
          src={stages.at(-1).image}
          alt=""
          aria-hidden="true"
        />
        <img
          className={classes.main}
          src={stages[stageIndex].image}
          alt={stages[stageIndex].alt}
          tabIndex="0"
          onMouseEnter={() => onPauseChange(true)}
          onMouseLeave={() => onPauseChange(false)}
          onFocus={() => onPauseChange(true)}
          onBlur={() => onPauseChange(false)}
          onClick={() => {
            onPauseChange(true);
            onImageOpen(stages[stageIndex]);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onPauseChange(true);
              onImageOpen(stages[stageIndex]);
            }
          }}
        />
      </div>
      <div className={classes.thumbnails}>
        {stages.map((stage, index) => (
          <button
            className={index === stageIndex ? "is-active" : ""}
            type="button"
            key={stage.id}
            onClick={() => onStageChange(index)}
            aria-label={`View stage ${index + 1} of ${title}`}
            aria-current={index === stageIndex ? "step" : undefined}
          >
            <img src={stage.image} alt="" />
          </button>
        ))}
      </div>
      <div
        className={`${classes.progress} process-sequence-progress`}
        aria-label={`Stage ${stageIndex + 1} of ${stages.length}`}
      >
        <span className="process-sequence-progress__track" aria-hidden="true" />
        <span
          className="process-sequence-progress__fill"
          key={stageIndex}
          style={{
            "--progress-start": `${progressStart}%`,
            "--progress-end": `${progressEnd}%`,
            "--progress-play-state": isPaused ? "paused" : "running",
          }}
          aria-hidden="true"
        />
        {stages.map((stage, index) => (
          <button
            type="button"
            key={stage.id}
            className={index === stageIndex ? "is-active" : ""}
            style={{
              "--stage-progress-color": getProgressColor(
                (index + 0.5) / stages.length,
              ),
            }}
            onClick={() => onStageChange(index)}
            aria-label={`Go to stage ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
}
