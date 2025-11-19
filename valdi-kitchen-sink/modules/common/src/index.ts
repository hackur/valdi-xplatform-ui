/**
 * Common module exports
 * Reusable components, theme, and utilities
 */

// Theme exports
export { Colors, Gradients, type ColorKey } from './theme/colors';
export { Fonts, FontSizes, FontWeights, LineHeights, LetterSpacing } from './theme/fonts';
export {
  CommonStyles,
  Spacing,
  BorderRadius,
  Shadows,
  AnimationCurves,
  AnimationDurations,
} from './theme/styles';

// Component exports
export { Button, type ButtonViewModel } from './components/Button';
export { Card, type CardViewModel } from './components/Card';
export { Header, type HeaderViewModel } from './components/Header';
export { DemoSection, type DemoSectionViewModel } from './components/DemoSection';
export { CodeBlock, type CodeBlockViewModel } from './components/CodeBlock';
