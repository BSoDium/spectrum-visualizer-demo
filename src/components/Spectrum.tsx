/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { ColorPaletteProp, LinearProgress, Stack, Typography } from "@mui/joy";
import { AnimationControls, motion } from "framer-motion";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { useDebounceValue, useInterval, useResizeObserver } from "usehooks-ts";
import { maxArray } from "../utils";
import AmplitudeIndicators from "./AmplitudeIndicators";
import { PiMicrophoneSlash } from "react-icons/pi";

export type SpectrumVariantProp = "soft" | "outlined";

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
  variant?: SpectrumVariantProp;
  /** The color of the bars. Cf. MUI Joy */
  color?: ColorPaletteProp;
  /** Callback when the audio input is ready */
  onLoad?: () => void;
  /** Callback when an error occurs */
  onError?: () => void;
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
  onLoad,
  onError,
  ...props
}: SpectrumProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    if (ghost) setGhostBars(Array.from({ length: barCount }, () => 0));
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
      .catch(() => {
        setError(true);
        onError?.();
      })
      .finally(() => {
        // Stop loading when the audio input is ready
        setLoading(false);
        onLoad?.();
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
      aria-label="Audio spectrum"
      css={css`
        position: relative;
        display: flex;
        border-radius: 1.375rem;
        width: min(27rem, 100%);
        height: min(7rem, 100%);
        overflow: hidden;
      `}
      {...props}
    >
      {loading || error ? (
        <motion.div
          layoutId="content"
          key={loading ? "loading" : "error"}
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
          {error ? (
            <Stack direction="row" gap={2} alignItems="center">
              <PiMicrophoneSlash size="1.25rem" style={{ flexShrink: 0 }} />
              <Typography level="body-sm" textColor="text.secondary">
                It seems like we couldn't access your microphone.
              </Typography>
            </Stack>
          ) : (
            <LinearProgress
              color={color}
              variant="soft"
              thickness={barWidth}
              sx={{
                width: "100%",
              }}
            />
          )}
        </motion.div>
      ) : (
        <>
          {[ghostBars, bars].map((amplitudes, index) => {
            const spectrumType = index === 0 ? "ghost" : "bars";
            const computedGap =
              spectrumType === "bars" && variant === "outlined" && ghost
                ? gap + 2
                : gap;
            return (
              <AmplitudeIndicators
                layoutId="content"
                key={spectrumType}
                amplitudes={amplitudes}
                amplitudeProps={(amplitude) => {
                  const barHeight = height * (amplitude / 255);
                  const outlined = variant === "outlined";

                  let backgroundColor: string;
                  let borderColor: string;

                  if (spectrumType === "ghost") {
                    backgroundColor = `color-mix(in srgb, transparent 40%, var(--joy-palette-${color}-${variant}Bg))`;
                    borderColor = `color-mix(in srgb, transparent 40%, var(--joy-palette-${color}-outlinedBorder))`;
                  } else {
                    const amplitudePercentage = 100 * (barHeight / height);
                    backgroundColor = `color-mix(in srgb, var(--joy-palette-${color}-${variant}Color) ${
                      interpolate
                        ? amplitudePercentage
                        : amplitude > 0
                        ? 100
                        : 0
                    }%, var(--joy-palette-${color}-${variant}Bg, transparent))`;
                    borderColor = `color-mix(in srgb, var(--joy-palette-${color}-outlinedBorder) ${
                      interpolate
                        ? amplitudePercentage
                        : amplitude > 0
                        ? 100
                        : 0
                    }%, var(--joy-palette-${color}-${variant}Bg, transparent))`;
                  }

                  const computedBarWidth =
                    spectrumType === "bars" && variant === "outlined" && ghost
                      ? barWidth - 2
                      : barWidth;
                  const computedBarHeight =
                    spectrumType === "bars" && variant === "outlined" && ghost
                      ? barHeight - 2
                      : barHeight;

                  return {
                    animate: (spectrumType === "ghost"
                      ? {
                          height: `${computedBarHeight}px`,
                        }
                      : {}) as AnimationControls,

                    style: {
                      ...(interpolate ? { backgroundColor, borderColor } : {}),
                      ...(spectrumType === "bars"
                        ? {
                            height: `${computedBarHeight}px`,
                          }
                        : {}),

                      width: `${computedBarWidth}px`,
                      minHeight: `${computedBarWidth}px`,
                      maxHeight: `${height}px`,
                    },
                    css: css`
                      ${interpolate
                        ? ""
                        : `background-color: ${backgroundColor}; border-color: ${borderColor};`}
                      border-width: ${outlined ? "1px" : "0"};
                      border-style: solid;
                      border-radius: 0.4rem;
                      transition: ${interpolate
                        ? "none"
                        : "background-color 0.2s ease"};
                    `,
                  };
                }}
                gap={computedGap}
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
              />
            );
          })}
        </>
      )}
    </motion.div>
  );
}
