/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { ColorPaletteProp, VariantProp } from "@mui/joy";
import { motion } from "framer-motion";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { useDebounceValue, useResizeObserver } from "usehooks-ts";
import { maxArray } from "../utils";

export type SpeechSoundVisualizerProps = {
  /** The width of the bars */
  step?: number;
  /** The gap between the bars */
  gap?: number;
  /** Whether to interpolate the color of the bars depending on the value */
  interpolate?: boolean;
  /** Whether to display ghost bars */
  ghost?: boolean;
  /** How long the ghost bars should last, set to null to never clear. */
  ghostDuration?: number | null;
  /** The minimum frequency to display */
  minFrequency?: number;
  /** The maximum frequency to display */
  maxFrequency?: number;
  /** The variant of the bars. Cf. MUI Joy */
  variant?: VariantProp;
  /** The color of the bars. Cf. MUI Joy */
  color?: ColorPaletteProp;
} & ComponentProps<typeof motion.div>;

export default function WaveForm({
  step = 8,
  gap = 4,
  interpolate = false,
  ghost = false,
  ghostDuration = null,
  minFrequency = 0,
  maxFrequency = 200,
  variant = "soft",
  color = "primary",
  ...props
}: SpeechSoundVisualizerProps) {
  const [bars, setBars] = useState<number[]>([]);
  const [ghostBars, setGhostBars] = useState<number[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  const { width: observedWidth, height: observedHeight } = useResizeObserver({
    ref,
  });
  const [width, setWidth] = useDebounceValue(0, 200);
  const [height, setHeight] = useDebounceValue(0, 200);

  const [barCount, setBarCount] = useDebounceValue(0, 200);

  // Reset the ghost bars when the ghost prop becomes false
  useEffect(() => {
    if (!ghost) {
      setGhostBars([]);
    }
  }, [ghost]);

  // Compute the width and height of each bar
  useEffect(() => {
    setWidth(observedWidth || 400);
    setHeight(observedHeight || 80);
  }, [observedWidth, observedHeight]);

  // Compute the amount of bars to display
  useEffect(() => {
    const count = Math.floor((width - gap) / (step + gap)) + 1;
    setBarCount(count);
  }, [width, gap, step]);

  // Clear ghost bars after the specified duration
  useEffect(() => {
    if (ghostDuration !== null) {
      const intervalId = setInterval(() => {
        setGhostBars(Array.from({ length: barCount }, () => 0));
      }, ghostDuration);

      return () => clearInterval(intervalId);
    }
  }, [ghostDuration, barCount]);

  // Update the bars based on the audio input
  useEffect(() => {
    const audioContext = new window.AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationFrameId: number;
    let isDestroyed = false;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (isDestroyed) {
        return;
      }
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const updateBars = () => {
        if (isDestroyed) {
          return;
        }
        animationFrameId = requestAnimationFrame(updateBars);
        analyser.getByteFrequencyData(dataArray);

        const newBars = Array.from({ length: barCount }, (_, index) => {
          const start = Math.floor(
            minFrequency + (index / barCount) * (maxFrequency - minFrequency)
          );
          const end = Math.floor(
            minFrequency +
              ((index + 1) / barCount) * (maxFrequency - minFrequency)
          );
          return (
            dataArray.slice(start, end).reduce((acc, value) => acc + value, 0) /
            (end - start)
          );
        });

        setBars(newBars);
        if (ghost)
          setGhostBars((prevGhostBars) =>
            prevGhostBars.length === newBars.length
              ? maxArray(prevGhostBars, newBars)
              : newBars
          );
      };
      updateBars();
    });

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      audioContext.close();
      isDestroyed = true;
    };
  }, [barCount, minFrequency, maxFrequency, ghost]);

  return (
    <motion.div
      ref={ref}
      css={css`
        position: relative;
        display: flex;
        width: min(25rem, 100%);
        height: min(5rem, 100%);
        overflow: hidden;

        & > *:first-of-type {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
        }

        & > *:last-of-type {
          z-index: 1;
        }
      `}
      {...props}
    >
      {Object.entries({ ghostBars, bars }).map(([type, series]) => {
        const isGhost = type === "ghostBars";
        return (
          <div
            key={type}
            id={type}
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;

              & > *:not(:last-child) {
                margin-right: ${gap}px;
              }
            `}
          >
            {series.map((value, index) => {
              const barWidth = (width - (barCount - 1) * gap) / barCount;
              const barHeight = height * (value / 255);
              const percentageOfSaturation = 100 * (barHeight / height);
              const backgroundColor = isGhost
                ? `color-mix(in srgb, transparent 40%, var(--joy-palette-${color}-${variant}Bg))`
                : interpolate
                ? `color-mix(in srgb, var(--joy-palette-${color}-${variant}Color) ${percentageOfSaturation}%, var(--joy-palette-${color}-${variant}Bg, transparent))`
                : value > 0
                ? `var(--joy-palette-${color}-${variant}Color)`
                : `var(--joy-palette-${color}-${variant}Bg)`;
              const borderColor = isGhost
                ? `color-mix(in srgb, transparent 40%, var(--joy-palette-${color}-${variant}Border))`
                : `var(--joy-palette-${color}-${variant}Border)`;

              return (
                <motion.div
                  layoutId={isGhost ? `ghost-${index}` : undefined}
                  key={isGhost ? `ghost-${index}` : index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    ...(interpolate ? { backgroundColor } : {}),
                    borderColor,
                    borderWidth: variant === "outlined" ? "1px" : "0",
                    width: `${barWidth}px`,
                    minHeight: `${barWidth}px`,
                    height: `${barHeight}px`,
                    maxHeight: `${height}px`,
                  }}
                  css={css`
                    ${interpolate
                      ? ""
                      : `background-color: ${backgroundColor};`}
                    border-style: solid;
                    border-radius: 0.4rem;
                    transition: ${interpolate
                      ? "none"
                      : "background-color 0.2s ease"};
                  `}
                />
              );
            })}
          </div>
        );
      })}
    </motion.div>
  );
}
