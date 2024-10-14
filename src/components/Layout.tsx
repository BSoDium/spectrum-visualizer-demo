import {
  ColorPaletteProp,
  Select,
  Option,
  Stack,
  Checkbox,
  FormControl,
  FormLabel,
  Button,
  useColorScheme,
  Slider,
} from "@mui/joy";
import { useState } from "react";
import { useBoolean } from "usehooks-ts";
import Spectrum, { SpectrumVariantProp } from "./Spectrum";
import { LuMoon, LuSun, LuSunMoon } from "react-icons/lu";
import { motion } from "framer-motion";

export const modes = ["light", "dark", "system"] as const;
export type Mode = (typeof modes)[number];

export default function Layout() {
  const { mode, setMode } = useColorScheme();

  const [variant, setVariant] = useState<SpectrumVariantProp>("soft");
  const [color, setColor] = useState<ColorPaletteProp>("primary");
  const { value: interpolate, toggle: toggleInterpolate } = useBoolean(true);
  const { value: ghost, toggle: toggleGhost } = useBoolean(true);

  return (
    <Stack
      component="main"
      alignItems="center"
      justifyContent="space-between"
      height="100%"
      width="100%"
      paddingTop="3.25rem"
    >
      <Button
        color="neutral"
        variant="plain"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          margin: "0.5rem",
        }}
        startDecorator={
          { light: <LuSun />, dark: <LuMoon />, system: <LuSunMoon /> }[
            mode as Mode
          ]
        }
        onClick={() => {
          const currentModeIndex = modes.findIndex((m) => m === mode);
          const nextMode = modes[(currentModeIndex + 1) % modes.length];
          setMode(nextMode);
        }}
      >
        <motion.span
          layoutId="mode-selector-value"
          style={{
            textTransform: "capitalize",
          }}
        >
          {mode}
        </motion.span>
        <motion.span layoutId="mode-selector-label">&nbsp;theme</motion.span>
      </Button>
      <Stack
        alignItems="center"
        justifyContent="center"
        width="100%"
        minHeight="7rem"
        flex={1}
        px={4}
      >
        <Spectrum
          {...{
            interpolate,
            ghost,
            variant,
            color,
          }}
          ghostDuration={10000}
        />
      </Stack>
      <Stack
        direction="row"
        alignItems="end"
        justifyContent="center"
        m={2}
        p={2}
        gap={2}
        flexWrap="wrap"
        sx={{
          backgroundColor: "var(--joy-palette-background-surface)",
          border: "1px solid var(--joy-palette-divider)",
          borderRadius: "1.375rem",
          "& > *": {
            flex: 1,
          },
        }}
      >
        <FormControl
          sx={{
            minWidth: "min(7rem, 100vw)",
          }}
        >
          <FormLabel>Variant</FormLabel>
          <Select
            value={variant}
            onChange={(_, newValue) => newValue && setVariant(newValue)}
          >
            {["outlined", "soft"].map((value) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
        </FormControl>
        <FormControl
          sx={{
            minWidth: "min(7rem, 100vw)",
          }}
        >
          <FormLabel>Colour</FormLabel>
          <Select
            value={color}
            onChange={(_, newValue) => newValue && setColor(newValue)}
          >
            {["primary", "neutral", "danger", "success", "warning"].map(
              (value) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              )
            )}
          </Select>
        </FormControl>

        <Checkbox
          label="Interpolate colours"
          aria-label="Interpolate colours"
          checked={interpolate}
          onChange={toggleInterpolate}
          sx={{
            whiteSpace: "nowrap",
            height: "36px",
            display: "flex",
            alignItems: "center",
            padding: "0.5rem 0.75rem 0.5rem 0.5rem",
            backgroundColor: "var(--joy-palette-neutral-softBg)",
            border: "1px solid var(--joy-palette-neutral-outlinedBorder)",
            borderRadius: "0.375rem",
          }}
        />
        <Checkbox
          label="Display ghost"
          aria-label="Display ghost"
          checked={ghost}
          onChange={toggleGhost}
          sx={{
            whiteSpace: "nowrap",
            height: "2.25rem",
            display: "flex",
            alignItems: "center",
            padding: "0.5rem 0.75rem 0.5rem 0.5rem",
            backgroundColor: "var(--joy-palette-neutral-softBg)",
            border: "1px solid var(--joy-palette-neutral-outlinedBorder)",
            borderRadius: "0.375rem",
          }}
        />
      </Stack>
    </Stack>
  );
}
