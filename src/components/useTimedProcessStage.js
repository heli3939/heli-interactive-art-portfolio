import { useEffect, useRef } from "react";

export default function useTimedProcessStage({
  enabled,
  isPaused,
  stageCount,
  stageIndex,
  setStageIndex,
  duration = 1500,
}) {
  const remainingRef = useRef(duration);
  const previousStageRef = useRef(stageIndex);

  useEffect(() => {
    if (previousStageRef.current !== stageIndex) {
      previousStageRef.current = stageIndex;
      remainingRef.current = duration;
    }

    if (!enabled || stageCount < 2) {
      remainingRef.current = duration;
      return undefined;
    }
    if (isPaused) return undefined;

    const startedAt = performance.now();
    const remaining = remainingRef.current;
    let completed = false;
    const timer = window.setTimeout(() => {
      completed = true;
      remainingRef.current = duration;
      setStageIndex((stageIndex + 1) % stageCount);
    }, remaining);

    return () => {
      window.clearTimeout(timer);
      if (!completed) {
        remainingRef.current = Math.max(
          0,
          remaining - (performance.now() - startedAt),
        );
      }
    };
  }, [duration, enabled, isPaused, setStageIndex, stageCount, stageIndex]);
}
