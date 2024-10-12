/** @jsxImportSource @emotion/react */
import { css, Interpolation, Theme } from "@emotion/react";
import { ColorPaletteProp, LinearProgress, VariantProp } from "@mui/joy";
import { motion } from "framer-motion";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { useDebounceValue, useInterval, useResizeObserver } from "usehooks-ts";
import { maxArray } from "../utils";
import AmplitudeIndicators from "./AmplitudeIndicators";

export type SpectrumProps = {
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

export default function Spectrum({
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
}: SpectrumProps) {
  const [loading, setLoading] = useState(true);

  const [bars, setBars] = useState<number[]>([]);
  const [ghostBars, setGhostBars] = useState<number[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  const { width: observedWidth, height: observedHeight } = useResizeObserver({
    ref,
  });

  // Debounce the width, height and bar count to avoid unnecessary re-renders on resize
  const [width, setWidth] = useDebounceValue(0, 200);
  const [height, setHeight] = useDebounceValue(0, 200);
  const [barCount, setBarCount] = useDebounceValue(0, 200);

  // Clear ghost bars after the specified duration
  useInterval(() => {
    setGhostBars(Array.from({ length: barCount }, () => 0));
  }, ghostDuration);

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

  // Update the bars based on the audio input
  useEffect(() => {
    let audioContext: AudioContext;
    let animationFrameId: number;
    let lifeCycleCompleted = false;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioContext = new window.AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        if (lifeCycleCompleted) {
          return;
        }

        // Connect the audio input to the analyser
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        // Stop loading when the audio input is ready
        setLoading(false);

        /**
         * Update the bars based on the audio input. This function is called recursively using
         * requestAnimationFrame.
         */
        const updateBars = () => {
          if (lifeCycleCompleted) {
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
              dataArray
                .slice(start, end)
                .reduce((acc, value) => acc + value, 0) /
              (end - start)
            );
          });

          // Update the bars
          setBars(newBars);
          if (ghost)
            setGhostBars((prevGhostBars) =>
              prevGhostBars.length === newBars.length
                ? maxArray(prevGhostBars, newBars)
                : newBars
            );
        };

        // Start the animation loop
        updateBars();
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      // Clean up the audio context and the animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      audioContext?.close();
      lifeCycleCompleted = true;
    };
  }, [barCount, minFrequency, maxFrequency, ghost]);

  /** Since the bar width is used in both the loading and the loaded state, we compute it here */
  const barWidth = (width - (barCount - 1) * gap) / barCount;

  return (
    <motion.div
      ref={ref}
      css={css`
        position: relative;
        display: flex;
        width: min(25rem, 100%);
        height: min(5rem, 100%);
        overflow: hidden;
      `}
      {...props}
    >
      {loading ? (
        <motion.div
          layoutId="bars"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          css={css`
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <LinearProgress
            {...{ color, variant }}
            thickness={barWidth}
            sx={{
              width: "100%",
            }}
          />
        </motion.div>
      ) : (
        <>
          {[ghostBars, bars].map((amplitudes, index) => {
            const spectrumType = index === 0 ? "ghost" : "bars";
            return (
              <AmplitudeIndicators
                amplitudes={amplitudes}
                amplitudeProps={(amplitude) => {
                  let backgroundColor: string;
                  let borderColor: string;

                  const barHeight = height * (amplitude / 255);

                  if (spectrumType === "ghost") {
                    backgroundColor = `color-mix(in srgb, transparent 40%, var(--joy-palette-${color}-${variant}Bg))`;
                    borderColor = `color-mix(in srgb, transparent 40%, var(--joy-palette-${color}-${variant}Border))`;
                  } else {
                    const percentageOfSaturation = 100 * (barHeight / height);
                    backgroundColor = interpolate
                      ? `color-mix(in srgb, var(--joy-palette-${color}-${variant}Color) ${percentageOfSaturation}%, var(--joy-palette-${color}-${variant}Bg, transparent))`
                      : amplitude > 0
                      ? `var(--joy-palette-${color}-${variant}Color)`
                      : `var(--joy-palette-${color}-${variant}Bg)`;
                    borderColor = `var(--joy-palette-${color}-${variant}Border)`;
                  }

                  return {
                    style: {
                      ...(interpolate ? { backgroundColor } : {}),
                      borderColor,
                      borderWidth: variant === "outlined" ? "1px" : "0",
                      width: `${barWidth}px`,
                      minHeight: `${barWidth}px`,
                      height: `${barHeight}px`,
                      maxHeight: `${height}px`,
                    },
                    css: css`
                      ${interpolate
                        ? ""
                        : `background-color: ${backgroundColor};`}
                      border-style: solid;
                      border-radius: 0.4rem;
                      transition: ${interpolate
                        ? "none"
                        : "background-color 0.2s ease"};
                    `,
                  };
                }}
                gap={gap}
                style={
                  spectrumType === "ghost"
                    ? {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 0,
                      }
                    : {
                        zIndex: 1,
                      }
                }
                layoutId={spectrumType === "ghost" ? "ghost" : undefined}
              />
            );
          })}
        </>
      )}
    </motion.div>
  );
}
