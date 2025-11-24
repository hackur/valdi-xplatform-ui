/**
 * Card Component Tests
 *
 * Comprehensive unit tests for the Card component.
 * Tests elevation levels, padding, children rendering, and interactions.
 */

import { Card, CardProps, CardElevation } from '../Card';
import {
  Colors,
  Spacing,
  BorderRadius,
  SemanticShadows,
  Shadows,
} from '../../theme';

describe('Card Component', () => {
  describe('Component Instantiation', () => {
    it('should create a Card instance with minimal props', () => {
      const card = new Card({});
      expect(card).toBeInstanceOf(Card);
    });

    it('should apply default props when not specified', () => {
      const card = new Card({});
      expect(card.viewModel.elevation).toBe('sm');
      expect(card.viewModel.padding).toBe(Spacing.base);
      expect(card.viewModel.backgroundColor).toBe(Colors.surface);
      expect(card.viewModel.borderRadius).toBe(BorderRadius.md);
      expect(card.viewModel.bordered).toBe(false);
    });

    it('should accept all props when provided', () => {
      const onTap = jest.fn();
      const children = { type: 'view', props: {} };
      const customStyle = { marginTop: 10 };

      const card = new Card({
        children,
        elevation: 'lg',
        padding: 20,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        bordered: true,
        onTap,
        style: customStyle,
      });

      expect(card.viewModel.children).toBe(children);
      expect(card.viewModel.elevation).toBe('lg');
      expect(card.viewModel.padding).toBe(20);
      expect(card.viewModel.backgroundColor).toBe(Colors.primary);
      expect(card.viewModel.borderRadius).toBe(8);
      expect(card.viewModel.bordered).toBe(true);
      expect(card.viewModel.onTap).toBe(onTap);
      expect(card.viewModel.style).toBe(customStyle);
    });

    it('should work without children', () => {
      const card = new Card({});
      expect(card.viewModel.children).toBeUndefined();
    });
  });

  describe('Elevation Levels', () => {
    const elevations: CardElevation[] = ['none', 'sm', 'md', 'lg'];

    elevations.forEach((elevation) => {
      it(`should handle ${elevation} elevation`, () => {
        const card = new Card({ elevation });
        expect(card.viewModel.elevation).toBe(elevation);

        const elevationStyle = (card as any).getElevationStyle();
        expect(elevationStyle).toBeDefined();
      });

      it(`should return correct shadow for ${elevation} elevation`, () => {
        const card = new Card({ elevation });
        const elevationStyle = (card as any).getElevationStyle();

        switch (elevation) {
          case 'none':
            expect(elevationStyle).toEqual({});
            break;
          case 'sm':
            expect(elevationStyle).toEqual(SemanticShadows.card);
            break;
          case 'md':
            expect(elevationStyle).toEqual(Shadows.md);
            break;
          case 'lg':
            expect(elevationStyle).toEqual(Shadows.lg);
            break;
        }
      });
    });

    it('should default to sm elevation for invalid values', () => {
      const card = new Card({ elevation: 'invalid' as CardElevation });
      const elevationStyle = (card as any).getElevationStyle();
      expect(elevationStyle).toEqual(SemanticShadows.card);
    });

    it('should apply no shadow for none elevation', () => {
      const card = new Card({ elevation: 'none' });
      const elevationStyle = (card as any).getElevationStyle();
      expect(Object.keys(elevationStyle).length).toBe(0);
    });
  });

  describe('Padding', () => {
    it('should use default padding', () => {
      const card = new Card({});
      expect(card.viewModel.padding).toBe(Spacing.base);
    });

    it('should accept custom padding', () => {
      const customPadding = 24;
      const card = new Card({ padding: customPadding });
      expect(card.viewModel.padding).toBe(customPadding);
    });

    it('should handle zero padding', () => {
      const card = new Card({ padding: 0 });
      expect(card.viewModel.padding).toBe(0);
    });

    it('should handle large padding values', () => {
      const largePadding = 100;
      const card = new Card({ padding: largePadding });
      expect(card.viewModel.padding).toBe(largePadding);
    });

    it('should apply padding to card style', () => {
      const padding = 16;
      const card = new Card({ padding });
      const shadowStyle = (card as any).getElevationStyle();

      const cardStyle = (card as any).getCardStyle(
        Colors.surface,
        BorderRadius.md,
        padding,
        false,
        shadowStyle
      );

      expect(cardStyle.style.padding).toBe(padding);
    });
  });

  describe('Background Color', () => {
    it('should use default background color', () => {
      const card = new Card({});
      expect(card.viewModel.backgroundColor).toBe(Colors.surface);
    });

    it('should accept custom background color', () => {
      const customColor = '#FF5733';
      const card = new Card({ backgroundColor: customColor });
      expect(card.viewModel.backgroundColor).toBe(customColor);
    });

    it('should handle all theme colors', () => {
      const colors = [
        Colors.primary,
        Colors.secondary,
        Colors.background,
        Colors.surface,
      ];

      colors.forEach((color) => {
        const card = new Card({ backgroundColor: color });
        expect(card.viewModel.backgroundColor).toBe(color);
      });
    });

    it('should apply background color to card style', () => {
      const backgroundColor = Colors.primary;
      const card = new Card({ backgroundColor });
      const shadowStyle = (card as any).getElevationStyle();

      const cardStyle = (card as any).getCardStyle(
        backgroundColor,
        BorderRadius.md,
        Spacing.base,
        false,
        shadowStyle
      );

      expect(cardStyle.style.backgroundColor).toBe(backgroundColor);
    });

    it('should fallback to surface color when undefined', () => {
      const card = new Card({ backgroundColor: undefined });
      const shadowStyle = (card as any).getElevationStyle();

      const cardStyle = (card as any).getCardStyle(
        undefined,
        BorderRadius.md,
        Spacing.base,
        false,
        shadowStyle
      );

      expect(cardStyle.style.backgroundColor).toBe(Colors.surface);
    });
  });

  describe('Border Radius', () => {
    it('should use default border radius', () => {
      const card = new Card({});
      expect(card.viewModel.borderRadius).toBe(BorderRadius.md);
    });

    it('should accept custom border radius', () => {
      const customRadius = 16;
      const card = new Card({ borderRadius: customRadius });
      expect(card.viewModel.borderRadius).toBe(customRadius);
    });

    it('should handle zero border radius', () => {
      const card = new Card({ borderRadius: 0 });
      expect(card.viewModel.borderRadius).toBe(0);
    });

    it('should handle large border radius values', () => {
      const largeRadius = 50;
      const card = new Card({ borderRadius: largeRadius });
      expect(card.viewModel.borderRadius).toBe(largeRadius);
    });

    it('should apply border radius to card style', () => {
      const borderRadius = 12;
      const card = new Card({ borderRadius });
      const shadowStyle = (card as any).getElevationStyle();

      const cardStyle = (card as any).getCardStyle(
        Colors.surface,
        borderRadius,
        Spacing.base,
        false,
        shadowStyle
      );

      expect(cardStyle.style.borderRadius).toBe(borderRadius);
    });

    it('should fallback to md border radius when undefined', () => {
      const card = new Card({ borderRadius: undefined });
      const shadowStyle = (card as any).getElevationStyle();

      const cardStyle = (card as any).getCardStyle(
        Colors.surface,
        undefined,
        Spacing.base,
        false,
        shadowStyle
      );

      expect(cardStyle.style.borderRadius).toBe(BorderRadius.md);
    });
  });

  describe('Bordered', () => {
    it('should not be bordered by default', () => {
      const card = new Card({});
      expect(card.viewModel.bordered).toBe(false);
    });

    it('should accept bordered prop', () => {
      const card = new Card({ bordered: true });
      expect(card.viewModel.bordered).toBe(true);
    });

    it('should apply border when bordered is true', () => {
      const card = new Card({ bordered: true });
      const shadowStyle = (card as any).getElevationStyle();

      const cardStyle = (card as any).getCardStyle(
        Colors.surface,
        BorderRadius.md,
        Spacing.base,
        true,
        shadowStyle
      );

      expect(cardStyle.style.borderWidth).toBe(1);
      expect(cardStyle.style.borderColor).toBe(Colors.border);
    });

    it('should not apply border when bordered is false', () => {
      const card = new Card({ bordered: false });
      const shadowStyle = (card as any).getElevationStyle();

      const cardStyle = (card as any).getCardStyle(
        Colors.surface,
        BorderRadius.md,
        Spacing.base,
        false,
        shadowStyle
      );

      expect(cardStyle.style.borderWidth).toBeUndefined();
      expect(cardStyle.style.borderColor).toBeUndefined();
    });
  });

  describe('Children', () => {
    it('should accept children prop', () => {
      const children = { type: 'text', content: 'Card content' };
      const card = new Card({ children });
      expect(card.viewModel.children).toBe(children);
    });

    it('should handle multiple children types', () => {
      const childrenTypes = [
        'string content',
        { type: 'view' },
        [{ type: 'text' }, { type: 'button' }],
        null,
        undefined,
      ];

      childrenTypes.forEach((children) => {
        const card = new Card({ children });
        expect(card.viewModel.children).toBe(children);
      });
    });

    it('should handle complex nested children', () => {
      const children = {
        type: 'view',
        children: [
          { type: 'text', content: 'Title' },
          { type: 'text', content: 'Description' },
        ],
      };

      const card = new Card({ children });
      expect(card.viewModel.children).toBe(children);
    });
  });

  describe('Tap Handler', () => {
    it('should accept onTap handler', () => {
      const onTap = jest.fn();
      const card = new Card({ onTap });
      expect(card.viewModel.onTap).toBe(onTap);
    });

    it('should call onTap when tapped', () => {
      const onTap = jest.fn();
      const card = new Card({ onTap });

      (card as any).handleTap();
      expect(onTap).toHaveBeenCalledTimes(1);
    });

    it('should not throw when onTap is undefined', () => {
      const card = new Card({});
      expect(() => (card as any).handleTap()).not.toThrow();
    });

    it('should call onTap multiple times if tapped multiple times', () => {
      const onTap = jest.fn();
      const card = new Card({ onTap });

      (card as any).handleTap();
      (card as any).handleTap();
      (card as any).handleTap();

      expect(onTap).toHaveBeenCalledTimes(3);
    });

    it('should work without onTap handler', () => {
      const card = new Card({});
      expect(card.viewModel.onTap).toBeUndefined();
    });
  });

  describe('Custom Styles', () => {
    it('should accept custom style prop', () => {
      const customStyle = { marginTop: 10, marginBottom: 20 };
      const card = new Card({ style: customStyle });
      expect(card.viewModel.style).toEqual(customStyle);
    });

    it('should apply custom styles to card', () => {
      const customStyle = { marginTop: 10, opacity: 0.8 };
      const card = new Card({ style: customStyle });
      const shadowStyle = (card as any).getElevationStyle();

      const cardStyle = (card as any).getCardStyle(
        Colors.surface,
        BorderRadius.md,
        Spacing.base,
        false,
        shadowStyle,
        customStyle
      );

      expect(cardStyle.style.marginTop).toBe(10);
      expect(cardStyle.style.opacity).toBe(0.8);
    });

    it('should work without custom styles', () => {
      const card = new Card({});
      expect(card.viewModel.style).toBeUndefined();
    });

    it('should merge custom styles with default styles', () => {
      const customStyle = { marginLeft: 15 };
      const card = new Card({ style: customStyle });
      const shadowStyle = (card as any).getElevationStyle();

      const cardStyle = (card as any).getCardStyle(
        Colors.surface,
        BorderRadius.md,
        Spacing.base,
        false,
        shadowStyle,
        customStyle
      );

      // Should have both default and custom styles
      expect(cardStyle.style.width).toBe('100%'); // default
      expect(cardStyle.style.marginLeft).toBe(15); // custom
    });
  });

  describe('Style Composition', () => {
    it('should generate card style correctly', () => {
      const card = new Card({
        elevation: 'sm',
        padding: 16,
        backgroundColor: Colors.surface,
        borderRadius: 8,
      });

      const shadowStyle = (card as any).getElevationStyle();
      const cardStyle = (card as any).getCardStyle(
        Colors.surface,
        8,
        16,
        false,
        shadowStyle
      );

      expect(cardStyle).toBeDefined();
      expect(cardStyle.style).toBeDefined();
      expect(cardStyle.style.backgroundColor).toBe(Colors.surface);
      expect(cardStyle.style.borderRadius).toBe(8);
      expect(cardStyle.style.padding).toBe(16);
      expect(cardStyle.style.width).toBe('100%');
    });

    it('should merge elevation styles', () => {
      const card = new Card({ elevation: 'lg' });
      const shadowStyle = (card as any).getElevationStyle();

      expect(shadowStyle).toEqual(Shadows.lg);
    });

    it('should combine all style properties', () => {
      const card = new Card({
        elevation: 'md',
        padding: 20,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        bordered: true,
        style: { marginTop: 10 },
      });

      const shadowStyle = (card as any).getElevationStyle();
      const cardStyle = (card as any).getCardStyle(
        Colors.primary,
        12,
        20,
        true,
        shadowStyle,
        { marginTop: 10 }
      );

      expect(cardStyle.style.backgroundColor).toBe(Colors.primary);
      expect(cardStyle.style.borderRadius).toBe(12);
      expect(cardStyle.style.padding).toBe(20);
      expect(cardStyle.style.borderWidth).toBe(1);
      expect(cardStyle.style.borderColor).toBe(Colors.border);
      expect(cardStyle.style.marginTop).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all props as undefined', () => {
      const card = new Card({
        children: undefined,
        elevation: undefined,
        padding: undefined,
        backgroundColor: undefined,
        borderRadius: undefined,
        bordered: undefined,
        onTap: undefined,
        style: undefined,
      });

      // Should use defaults
      expect(card.viewModel.elevation).toBe('sm');
      expect(card.viewModel.padding).toBe(Spacing.base);
      expect(card.viewModel.backgroundColor).toBe(Colors.surface);
      expect(card.viewModel.borderRadius).toBe(BorderRadius.md);
      expect(card.viewModel.bordered).toBe(false);
    });

    it('should handle empty object as props', () => {
      const card = new Card({});
      expect(card).toBeInstanceOf(Card);
      expect(() => card.onRender()).not.toThrow();
    });

    it('should preserve all props when creating instance', () => {
      const props: CardProps = {
        children: { type: 'view' },
        elevation: 'lg',
        padding: 24,
        backgroundColor: Colors.error,
        borderRadius: 16,
        bordered: true,
        onTap: jest.fn(),
        style: { opacity: 0.9 },
      };

      const card = new Card(props);

      expect(card.viewModel.children).toBe(props.children);
      expect(card.viewModel.elevation).toBe(props.elevation);
      expect(card.viewModel.padding).toBe(props.padding);
      expect(card.viewModel.backgroundColor).toBe(props.backgroundColor);
      expect(card.viewModel.borderRadius).toBe(props.borderRadius);
      expect(card.viewModel.bordered).toBe(props.bordered);
      expect(card.viewModel.onTap).toBe(props.onTap);
      expect(card.viewModel.style).toBe(props.style);
    });

    it('should handle negative padding values', () => {
      const card = new Card({ padding: -10 });
      expect(card.viewModel.padding).toBe(-10);
    });

    it('should handle negative border radius values', () => {
      const card = new Card({ borderRadius: -5 });
      expect(card.viewModel.borderRadius).toBe(-5);
    });
  });

  describe('Rendering', () => {
    it('should have onRender method', () => {
      const card = new Card({});
      expect(typeof card.onRender).toBe('function');
    });

    // Note: Skipping actual render tests as JSX requires createElement in test environment
    // The component logic is fully tested through unit tests above

    it('should handle children properly', () => {
      const card = new Card({
        children: { type: 'text', content: 'Test content' },
      });
      expect(card.viewModel.children).toBeDefined();
    });

    it('should handle missing children', () => {
      const card = new Card({});
      expect(card.viewModel.children).toBeUndefined();
    });

    it('should handle onTap handler', () => {
      const card = new Card({ onTap: jest.fn() });
      expect(card.viewModel.onTap).toBeDefined();
    });

    it('should handle missing onTap handler', () => {
      const card = new Card({});
      expect(card.viewModel.onTap).toBeUndefined();
    });

    it('should handle all combinations of props without errors', () => {
      const elevations: CardElevation[] = ['none', 'sm', 'md', 'lg'];
      const bordered = [true, false];

      elevations.forEach((elevation) => {
        bordered.forEach((isBordered) => {
          const card = new Card({
            elevation,
            bordered: isBordered,
            padding: 16,
            backgroundColor: Colors.surface,
          });

          // Verify component is created correctly
          expect(card).toBeInstanceOf(Card);
          expect(card.viewModel.elevation).toBe(elevation);
          expect(card.viewModel.bordered).toBe(isBordered);
        });
      });
    });
  });

  describe('Interactive Cards', () => {
    it('should be interactive when onTap is provided', () => {
      const onTap = jest.fn();
      const card = new Card({ onTap });
      expect(card.viewModel.onTap).toBeDefined();
    });

    it('should not be interactive when onTap is not provided', () => {
      const card = new Card({});
      expect(card.viewModel.onTap).toBeUndefined();
    });

    it('should handle rapid taps', () => {
      const onTap = jest.fn();
      const card = new Card({ onTap });

      for (let i = 0; i < 10; i++) {
        (card as any).handleTap();
      }

      expect(onTap).toHaveBeenCalledTimes(10);
    });
  });
});
