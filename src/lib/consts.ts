import { GradientConfig } from '@/lib/xsmiles/src/types/gradient.types';

export const defaultGradientConfig: GradientConfig = {
    thresholds: [],
    colorDomain: [],
    palette: {name: "blue", colors: ['purple', 'blue', 'cyan', '#00BCFF']},
    highlight: true,
    blur: 0.7,
    opacity: { min: 0.6, max: 1 },
    radius: { min: 15, max: 30 }, // the function getGradientConfig adjusts
    delta: 0.005,
  }



