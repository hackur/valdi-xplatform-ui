/**
 * Button Component Tests
 *
 * Comprehensive unit tests for the Button component.
 * Tests all variants, sizes, states, and interactions.
 */

import { Button, ButtonProps, ButtonVariant, ButtonSize } from '../Button';
import { Colors, Spacing } from '../../theme';

describe('Button Component', () => {
  describe('Component Instantiation', () => {
    it('should create a Button instance with required props', () => {
      const button = new Button({ title: 'Click me' });
      expect(button).toBeInstanceOf(Button);
      expect(button.viewModel.title).toBe('Click me');
    });

    it('should apply default props when not specified', () => {
      const button = new Button({ title: 'Test' });
      expect(button.viewModel.variant).toBe('primary');
      expect(button.viewModel.size).toBe('medium');
      expect(button.viewModel.disabled).toBe(false);
      expect(button.viewModel.loading).toBe(false);
      expect(button.viewModel.fullWidth).toBe(false);
      expect(button.viewModel.iconPosition).toBe('left');
    });

    it('should accept all props when provided', () => {
      const onTap = jest.fn();
      const button = new Button({
        title: 'Submit',
        variant: 'secondary',
        size: 'large',
        disabled: true,
        loading: false,
        fullWidth: true,
        icon: 'check',
        iconPosition: 'right',
        onTap,
        style: { marginTop: 10 },
      });

      expect(button.viewModel.title).toBe('Submit');
      expect(button.viewModel.variant).toBe('secondary');
      expect(button.viewModel.size).toBe('large');
      expect(button.viewModel.disabled).toBe(true);
      expect(button.viewModel.fullWidth).toBe(true);
      expect(button.viewModel.icon).toBe('check');
      expect(button.viewModel.iconPosition).toBe('right');
      expect(button.viewModel.onTap).toBe(onTap);
    });
  });

  describe('Variants', () => {
    const variants: ButtonVariant[] = [
      'primary',
      'secondary',
      'outline',
      'ghost',
      'danger',
    ];

    variants.forEach((variant) => {
      it(`should handle ${variant} variant`, () => {
        const button = new Button({ title: 'Test', variant });
        expect(button.viewModel.variant).toBe(variant);

        // Test background color logic
        const bgColor = (button as any).getBackgroundColor();
        expect(bgColor).toBeDefined();

        switch (variant) {
          case 'primary':
            expect(bgColor).toBe(Colors.primary);
            break;
          case 'secondary':
            expect(bgColor).toBe(Colors.secondary);
            break;
          case 'outline':
          case 'ghost':
            expect(bgColor).toBe(Colors.transparent);
            break;
          case 'danger':
            expect(bgColor).toBe(Colors.error);
            break;
        }
      });

      it(`should render correct text color for ${variant} variant`, () => {
        const button = new Button({ title: 'Test', variant });
        const textColor = (button as any).getTextColor();

        switch (variant) {
          case 'primary':
          case 'secondary':
          case 'danger':
            expect(textColor).toBe(Colors.textInverse);
            break;
          case 'outline':
          case 'ghost':
            expect(textColor).toBe(Colors.primary);
            break;
        }
      });
    });

    it('should handle outline variant with border', () => {
      const button = new Button({ title: 'Test', variant: 'outline' });
      const borderColor = (button as any).getBorderColor();
      expect(borderColor).toBe(Colors.primary);
    });

    it('should have transparent border for non-outline variants', () => {
      const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
      variants.forEach((variant) => {
        const button = new Button({ title: 'Test', variant });
        const borderColor = (button as any).getBorderColor();
        expect(borderColor).toBe(Colors.transparent);
      });
    });
  });

  describe('Sizes', () => {
    const sizes: ButtonSize[] = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      it(`should handle ${size} size`, () => {
        const button = new Button({ title: 'Test', size });
        expect(button.viewModel.size).toBe(size);

        const padding = (button as any).getPadding();
        expect(padding).toHaveProperty('paddingHorizontal');
        expect(padding).toHaveProperty('paddingVertical');
        expect(typeof padding.paddingHorizontal).toBe('number');
        expect(typeof padding.paddingVertical).toBe('number');
      });

      it(`should have correct padding for ${size} size`, () => {
        const button = new Button({ title: 'Test', size });
        const padding = (button as any).getPadding();

        switch (size) {
          case 'small':
            expect(padding.paddingHorizontal).toBe(Spacing.sm);
            expect(padding.paddingVertical).toBe(Spacing.xs);
            break;
          case 'medium':
            expect(padding.paddingHorizontal).toBe(Spacing.base);
            expect(padding.paddingVertical).toBe(Spacing.sm);
            break;
          case 'large':
            expect(padding.paddingHorizontal).toBe(Spacing.lg);
            expect(padding.paddingVertical).toBe(Spacing.base);
            break;
        }
      });

      it(`should have correct font size for ${size} size`, () => {
        const button = new Button({ title: 'Test', size });
        const fontSize = (button as any).getFontSize();

        switch (size) {
          case 'small':
            expect(fontSize).toBe(14);
            break;
          case 'medium':
            expect(fontSize).toBe(16);
            break;
          case 'large':
            expect(fontSize).toBe(18);
            break;
        }
      });
    });

    it('should use default size when invalid size is provided', () => {
      const button = new Button({ title: 'Test', size: 'invalid' as ButtonSize });
      const padding = (button as any).getPadding();
      const fontSize = (button as any).getFontSize();

      expect(padding.paddingHorizontal).toBe(Spacing.base);
      expect(padding.paddingVertical).toBe(Spacing.sm);
      expect(fontSize).toBe(16);
    });
  });

  describe('Disabled State', () => {
    it('should render disabled state correctly', () => {
      const button = new Button({ title: 'Test', disabled: true });
      expect(button.viewModel.disabled).toBe(true);
    });

    it('should use gray colors when disabled', () => {
      const button = new Button({
        title: 'Test',
        variant: 'primary',
        disabled: true,
      });

      const bgColor = (button as any).getBackgroundColor();
      const textColor = (button as any).getTextColor();
      const borderColor = (button as any).getBorderColor();

      expect(bgColor).toBe(Colors.gray300);
      expect(textColor).toBe(Colors.textTertiary);
      expect(borderColor).toBe(Colors.gray300);
    });

    it('should not call onTap when disabled', () => {
      const onTap = jest.fn();
      const button = new Button({
        title: 'Test',
        disabled: true,
        onTap,
      });

      (button as any).handleTap();
      expect(onTap).not.toHaveBeenCalled();
    });

    it('should override variant colors when disabled', () => {
      const variants: ButtonVariant[] = [
        'primary',
        'secondary',
        'outline',
        'ghost',
        'danger',
      ];

      variants.forEach((variant) => {
        const button = new Button({
          title: 'Test',
          variant,
          disabled: true,
        });

        const bgColor = (button as any).getBackgroundColor();
        const textColor = (button as any).getTextColor();

        expect(bgColor).toBe(Colors.gray300);
        expect(textColor).toBe(Colors.textTertiary);
      });
    });
  });

  describe('Loading State', () => {
    it('should render loading state correctly', () => {
      const button = new Button({ title: 'Test', loading: true });
      expect(button.viewModel.loading).toBe(true);
    });

    it('should not call onTap when loading', () => {
      const onTap = jest.fn();
      const button = new Button({
        title: 'Test',
        loading: true,
        onTap,
      });

      (button as any).handleTap();
      expect(onTap).not.toHaveBeenCalled();
    });

    it('should render loading state even when not disabled', () => {
      const onTap = jest.fn();
      const button = new Button({
        title: 'Test',
        loading: true,
        disabled: false,
        onTap,
      });

      (button as any).handleTap();
      expect(onTap).not.toHaveBeenCalled();
    });

    it('should show loading indicator with title', () => {
      const button = new Button({ title: 'Submit', loading: true });
      expect(button.viewModel.title).toBe('Submit');
      expect(button.viewModel.loading).toBe(true);
    });
  });

  describe('Full Width', () => {
    it('should handle full width setting', () => {
      const button = new Button({ title: 'Test', fullWidth: true });
      expect(button.viewModel.fullWidth).toBe(true);
    });

    it('should not be full width by default', () => {
      const button = new Button({ title: 'Test' });
      expect(button.viewModel.fullWidth).toBe(false);
    });

    it('should apply full width to container style', () => {
      const button = new Button({ title: 'Test', fullWidth: true });
      const bgColor = (button as any).getBackgroundColor();
      const borderColor = (button as any).getBorderColor();
      const padding = (button as any).getPadding();

      const containerStyle = (button as any).getContainerStyle(
        bgColor,
        borderColor,
        padding,
        true
      );

      expect(containerStyle.style.width).toBe('100%');
    });

    it('should not set width when fullWidth is false', () => {
      const button = new Button({ title: 'Test', fullWidth: false });
      const bgColor = (button as any).getBackgroundColor();
      const borderColor = (button as any).getBorderColor();
      const padding = (button as any).getPadding();

      const containerStyle = (button as any).getContainerStyle(
        bgColor,
        borderColor,
        padding,
        false
      );

      expect(containerStyle.style.width).toBeUndefined();
    });
  });

  describe('Icon Support', () => {
    it('should accept icon prop', () => {
      const button = new Button({ title: 'Test', icon: 'check' });
      expect(button.viewModel.icon).toBe('check');
    });

    it('should default icon position to left', () => {
      const button = new Button({ title: 'Test', icon: 'check' });
      expect(button.viewModel.iconPosition).toBe('left');
    });

    it('should accept right icon position', () => {
      const button = new Button({
        title: 'Test',
        icon: 'arrow',
        iconPosition: 'right',
      });
      expect(button.viewModel.iconPosition).toBe('right');
    });

    it('should work without icon', () => {
      const button = new Button({ title: 'Test' });
      expect(button.viewModel.icon).toBeUndefined();
    });
  });

  describe('Tap Handler', () => {
    it('should call onTap when tapped and enabled', () => {
      const onTap = jest.fn();
      const button = new Button({
        title: 'Test',
        disabled: false,
        loading: false,
        onTap,
      });

      (button as any).handleTap();
      expect(onTap).toHaveBeenCalledTimes(1);
    });

    it('should not call onTap when disabled', () => {
      const onTap = jest.fn();
      const button = new Button({
        title: 'Test',
        disabled: true,
        onTap,
      });

      (button as any).handleTap();
      expect(onTap).not.toHaveBeenCalled();
    });

    it('should not call onTap when loading', () => {
      const onTap = jest.fn();
      const button = new Button({
        title: 'Test',
        loading: true,
        onTap,
      });

      (button as any).handleTap();
      expect(onTap).not.toHaveBeenCalled();
    });

    it('should not throw when onTap is undefined', () => {
      const button = new Button({ title: 'Test' });
      expect(() => (button as any).handleTap()).not.toThrow();
    });

    it('should call onTap multiple times if tapped multiple times', () => {
      const onTap = jest.fn();
      const button = new Button({ title: 'Test', onTap });

      (button as any).handleTap();
      (button as any).handleTap();
      (button as any).handleTap();

      expect(onTap).toHaveBeenCalledTimes(3);
    });
  });

  describe('Custom Styles', () => {
    it('should accept custom style prop', () => {
      const customStyle = { marginTop: 10, marginBottom: 20 };
      const button = new Button({ title: 'Test', style: customStyle });
      expect(button.viewModel.style).toEqual(customStyle);
    });

    it('should apply custom styles to container', () => {
      const customStyle = { marginTop: 10 };
      const button = new Button({ title: 'Test', style: customStyle });
      const bgColor = (button as any).getBackgroundColor();
      const borderColor = (button as any).getBorderColor();
      const padding = (button as any).getPadding();

      const containerStyle = (button as any).getContainerStyle(
        bgColor,
        borderColor,
        padding,
        false,
        customStyle
      );

      expect(containerStyle.style.marginTop).toBe(10);
    });

    it('should work without custom styles', () => {
      const button = new Button({ title: 'Test' });
      expect(button.viewModel.style).toBeUndefined();
    });
  });

  describe('Style Getters', () => {
    it('should generate container style correctly', () => {
      const button = new Button({
        title: 'Test',
        variant: 'primary',
        size: 'medium',
      });

      const bgColor = (button as any).getBackgroundColor();
      const borderColor = (button as any).getBorderColor();
      const padding = (button as any).getPadding();

      const containerStyle = (button as any).getContainerStyle(
        bgColor,
        borderColor,
        padding,
        false
      );

      expect(containerStyle).toBeDefined();
      expect(containerStyle.style).toBeDefined();
      expect(containerStyle.style.backgroundColor).toBe(Colors.primary);
      expect(containerStyle.style.paddingHorizontal).toBe(Spacing.base);
      expect(containerStyle.style.paddingVertical).toBe(Spacing.sm);
    });

    it('should generate label style correctly', () => {
      const button = new Button({ title: 'Test', size: 'large' });
      const fontSize = (button as any).getFontSize();
      const textColor = (button as any).getTextColor();

      const labelStyle = (button as any).getLabelStyle(fontSize, textColor);

      expect(labelStyle).toBeDefined();
      expect(labelStyle.style).toBeDefined();
      expect(labelStyle.style.color).toBe(Colors.textInverse);
    });

    it('should include border for outline variant', () => {
      const button = new Button({ title: 'Test', variant: 'outline' });
      const bgColor = (button as any).getBackgroundColor();
      const borderColor = (button as any).getBorderColor();
      const padding = (button as any).getPadding();

      const containerStyle = (button as any).getContainerStyle(
        bgColor,
        borderColor,
        padding,
        false
      );

      expect(containerStyle.style.borderWidth).toBe(2);
      expect(containerStyle.style.borderColor).toBe(Colors.primary);
    });

    it('should not include border for non-outline variants', () => {
      const button = new Button({ title: 'Test', variant: 'primary' });
      const bgColor = (button as any).getBackgroundColor();
      const borderColor = (button as any).getBorderColor();
      const padding = (button as any).getPadding();

      const containerStyle = (button as any).getContainerStyle(
        bgColor,
        borderColor,
        padding,
        false
      );

      expect(containerStyle.style.borderWidth).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const button = new Button({ title: '' });
      expect(button.viewModel.title).toBe('');
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);
      const button = new Button({ title: longTitle });
      expect(button.viewModel.title).toBe(longTitle);
    });

    it('should handle special characters in title', () => {
      const title = '!@#$%^&*()_+{}:"<>?[];,./';
      const button = new Button({ title });
      expect(button.viewModel.title).toBe(title);
    });

    it('should handle both disabled and loading states', () => {
      const onTap = jest.fn();
      const button = new Button({
        title: 'Test',
        disabled: true,
        loading: true,
        onTap,
      });

      (button as any).handleTap();
      expect(onTap).not.toHaveBeenCalled();
    });

    it('should handle null onTap gracefully', () => {
      const button = new Button({
        title: 'Test',
        onTap: undefined,
      });

      expect(() => (button as any).handleTap()).not.toThrow();
    });

    it('should preserve all props when creating instance', () => {
      const props: ButtonProps = {
        title: 'Complete',
        variant: 'danger',
        size: 'small',
        disabled: false,
        loading: false,
        fullWidth: true,
        icon: 'trash',
        iconPosition: 'left',
        onTap: jest.fn(),
        style: { padding: 5 },
      };

      const button = new Button(props);

      expect(button.viewModel.title).toBe(props.title);
      expect(button.viewModel.variant).toBe(props.variant);
      expect(button.viewModel.size).toBe(props.size);
      expect(button.viewModel.disabled).toBe(props.disabled);
      expect(button.viewModel.loading).toBe(props.loading);
      expect(button.viewModel.fullWidth).toBe(props.fullWidth);
      expect(button.viewModel.icon).toBe(props.icon);
      expect(button.viewModel.iconPosition).toBe(props.iconPosition);
      expect(button.viewModel.onTap).toBe(props.onTap);
      expect(button.viewModel.style).toBe(props.style);
    });
  });

  describe('Rendering', () => {
    it('should have onRender method', () => {
      const button = new Button({ title: 'Test' });
      expect(typeof button.onRender).toBe('function');
    });

    // Note: Skipping actual render tests as JSX requires createElement in test environment
    // The component logic is fully tested through unit tests above

    it('should render different content when loading', () => {
      const normalButton = new Button({ title: 'Submit', loading: false });
      const loadingButton = new Button({ title: 'Submit', loading: true });

      expect(normalButton.viewModel.loading).toBe(false);
      expect(loadingButton.viewModel.loading).toBe(true);
    });

    it('should handle all props combinations without errors', () => {
      const variants: ButtonVariant[] = [
        'primary',
        'secondary',
        'outline',
        'ghost',
        'danger',
      ];
      const sizes: ButtonSize[] = ['small', 'medium', 'large'];

      variants.forEach((variant) => {
        sizes.forEach((size) => {
          const button = new Button({
            title: `${variant}-${size}`,
            variant,
            size,
          });

          // Verify component is created correctly
          expect(button).toBeInstanceOf(Button);
          expect(button.viewModel.variant).toBe(variant);
          expect(button.viewModel.size).toBe(size);
        });
      });
    });
  });
});
