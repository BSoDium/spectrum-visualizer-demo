/** @jsxImportSource @emotion/react */
import { css, Interpolation, Theme } from "@emotion/react";
import { AnimationControls, motion } from "framer-motion";
import { ComponentProps } from "react";

export type AmplitudeIndicatorsProps = {
  /** The amplitudes to display */
  amplitudes: number[];
  /** The function to generate the style and css for each amplitude */
  amplitudeProps: (amplitude: number) => {
    animate: AnimationControls;
    style: React.CSSProperties;
    css: Interpolation<Theme>;
  };
  /** The gap between the amplitude indicators */
  gap: number;
} & ComponentProps<typeof motion.div>;

export default function AmplitudeIndicators({
  amplitudes,
  amplitudeProps,
  gap,
  layoutId,
  ...props
}: AmplitudeIndicatorsProps) {
  return (
    <motion.div
      layoutId={layoutId}
      css={css`
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;

        & > *:not(:last-child) {
          margin-right: ${gap}px;
        }
      `}
      {...props}
    >
      {amplitudes.map((value, index) => {
        const {
          animate: amplitudeAnimate,
          style: amplitudeStyle,
          css: amplitudeCss,
        } = amplitudeProps(value);
        return (
          <motion.div
            key={index}
            layoutId={layoutId ? `${layoutId}-${index}` : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, ...amplitudeAnimate }}
            exit={{ opacity: 0 }}
            style={amplitudeStyle}
            css={amplitudeCss}
          />
        );
      })}
    </motion.div>
  );
}
