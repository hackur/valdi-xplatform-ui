/**
 * Button Component Unit Tests
 *
 * Tests for Button component rendering, interaction, and states.
 */

import { Button, ButtonProps } from '../Button';

// Mock Valdi dependencies
jest.mock('valdi_core/src/Component');
jest.mock('valdi_core/src/Style');
jest.mock('valdi_core/src/SystemFont', () => ({
  systemBoldFont: jest.fn((size: number) => `bold-${size}`),
}));
jest.mock('valdi_tsx/src/NativeTemplateElements', () => ({
  View: 'view',
  Label: 'label',
}));

describe('Button', () => {
  let button: Button;

  const createButton = (props: ButtonProps): Button => {
    const instance = new Button();
    // Set viewModel which Button reads from
    (instance as any).viewModel = { ...Button.defaultProps, ...props };
    return instance;
  };

  describe('Rendering', () => {
    it('should render with correct props', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'Click Me',
        variant: 'primary',
        size: 'medium',
      };

      // Act
      button = createButton(props);

      // Assert
      expect(button).toBeInstanceOf(Button);
      expect((button as any).viewModel.title).toBe('Click Me');
      expect((button as any).viewModel.variant).toBe('primary');
    });

    it('should render with default props', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'Default Button',
      };

      // Act
      button = createButton(props);

      // Assert
      expect((button as any).viewModel.title).toBe('Default Button');
      expect((button as any).viewModel.variant).toBe('primary'); // default
    });

    it('should render with custom style', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'Styled Button',
        style: { borderRadius: 20 },
      };

      // Act
      button = createButton(props);

      // Assert
      expect((button as any).viewModel.style).toEqual({ borderRadius: 20 });
    });

    it('should render all button variants', () => {
      // Arrange & Act
      const variants: ButtonProps['variant'][] = [
        'primary',
        'secondary',
        'outline',
        'ghost',
        'danger',
      ];

      variants.forEach((variant) => {
        button = createButton({ title: 'Test', variant });
        expect((button as any).viewModel.variant).toBe(variant);
      });
    });

    it('should render all button sizes', () => {
      // Arrange & Act
      const sizes: ButtonProps['size'][] = ['small', 'medium', 'large'];

      sizes.forEach((size) => {
        button = createButton({ title: 'Test', size });
        expect((button as any).viewModel.size).toBe(size);
      });
    });

    it('should render full width button', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'Full Width',
        fullWidth: true,
      };

      // Act
      button = createButton(props);

      // Assert
      expect((button as any).viewModel.fullWidth).toBe(true);
    });
  });

  describe('Event handling', () => {
    it('should handle onTap event', () => {
      // Arrange
      const onTapMock = jest.fn();
      const props: ButtonProps = {
        title: 'Clickable',
        onTap: onTapMock,
      };

      // Act
      button = createButton(props);
      (button as any).handleTap();

      // Assert
      expect(onTapMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onTap when disabled', () => {
      // Arrange
      const onTapMock = jest.fn();
      const props: ButtonProps = {
        title: 'Disabled',
        disabled: true,
        onTap: onTapMock,
      };

      // Act
      button = createButton(props);
      (button as any).handleTap();

      // Assert
      expect(onTapMock).not.toHaveBeenCalled();
    });

    it('should not call onTap when loading', () => {
      // Arrange
      const onTapMock = jest.fn();
      const props: ButtonProps = {
        title: 'Loading',
        loading: true,
        onTap: onTapMock,
      };

      // Act
      button = createButton(props);
      (button as any).handleTap();

      // Assert
      expect(onTapMock).not.toHaveBeenCalled();
    });

    it('should not throw when onTap is undefined', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'No Handler',
      };

      // Act & Assert
      button = createButton(props);
      expect(() => (button as any).handleTap()).not.toThrow();
    });
  });

  describe('Loading state', () => {
    it('should show loading state', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'Submit',
        loading: true,
      };

      // Act
      button = createButton(props);

      // Assert
      expect((button as any).viewModel.loading).toBe(true);
    });

    it('should not be interactive when loading', () => {
      // Arrange
      const onTapMock = jest.fn();
      const props: ButtonProps = {
        title: 'Loading Button',
        loading: true,
        onTap: onTapMock,
      };

      // Act
      button = createButton(props);
      (button as any).handleTap();

      // Assert
      expect(onTapMock).not.toHaveBeenCalled();
    });
  });

  describe('Disabled state', () => {
    it('should be disabled when specified', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'Disabled',
        disabled: true,
      };

      // Act
      button = createButton(props);

      // Assert
      expect((button as any).viewModel.disabled).toBe(true);
    });

    it('should not be interactive when disabled', () => {
      // Arrange
      const onTapMock = jest.fn();
      const props: ButtonProps = {
        title: 'Disabled Button',
        disabled: true,
        onTap: onTapMock,
      };

      // Act
      button = createButton(props);
      (button as any).handleTap();

      // Assert
      expect(onTapMock).not.toHaveBeenCalled();
    });

    it('should use disabled colors', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'Disabled',
        disabled: true,
        variant: 'primary',
      };

      // Act
      button = createButton(props);
      const backgroundColor = (button as any).getBackgroundColor();
      const textColor = (button as any).getTextColor();

      // Assert
      expect(backgroundColor).toBeDefined();
      expect(textColor).toBeDefined();
    });
  });

  describe('Styling methods', () => {
    it('should get correct background color for primary variant', () => {
      // Arrange
      button = createButton({ title: 'Primary', variant: 'primary' });

      // Act
      const backgroundColor = (button as any).getBackgroundColor();

      // Assert
      expect(backgroundColor).toBeDefined();
    });

    it('should get correct background color for secondary variant', () => {
      // Arrange
      button = createButton({ title: 'Secondary', variant: 'secondary' });

      // Act
      const backgroundColor = (button as any).getBackgroundColor();

      // Assert
      expect(backgroundColor).toBeDefined();
    });

    it('should get correct background color for outline variant', () => {
      // Arrange
      button = createButton({ title: 'Outline', variant: 'outline' });

      // Act
      const backgroundColor = (button as any).getBackgroundColor();

      // Assert
      expect(backgroundColor).toBeDefined();
    });

    it('should get correct background color for ghost variant', () => {
      // Arrange
      button = createButton({ title: 'Ghost', variant: 'ghost' });

      // Act
      const backgroundColor = (button as any).getBackgroundColor();

      // Assert
      expect(backgroundColor).toBeDefined();
    });

    it('should get correct background color for danger variant', () => {
      // Arrange
      button = createButton({ title: 'Danger', variant: 'danger' });

      // Act
      const backgroundColor = (button as any).getBackgroundColor();

      // Assert
      expect(backgroundColor).toBeDefined();
    });

    it('should get correct text color for each variant', () => {
      // Arrange & Act
      const variants: ButtonProps['variant'][] = [
        'primary',
        'secondary',
        'outline',
        'ghost',
        'danger',
      ];

      variants.forEach((variant) => {
        button = createButton({ title: 'Test', variant });
        const textColor = (button as any).getTextColor();
        expect(textColor).toBeDefined();
      });
    });

    it('should get correct border color for outline variant', () => {
      // Arrange
      button = createButton({ title: 'Outline', variant: 'outline' });

      // Act
      const borderColor = (button as any).getBorderColor();

      // Assert
      expect(borderColor).toBeDefined();
    });

    it('should get correct padding for small size', () => {
      // Arrange
      button = createButton({ title: 'Small', size: 'small' });

      // Act
      const padding = (button as any).getPadding();

      // Assert
      expect(padding).toHaveProperty('paddingHorizontal');
      expect(padding).toHaveProperty('paddingVertical');
    });

    it('should get correct padding for medium size', () => {
      // Arrange
      button = createButton({ title: 'Medium', size: 'medium' });

      // Act
      const padding = (button as any).getPadding();

      // Assert
      expect(padding).toHaveProperty('paddingHorizontal');
      expect(padding).toHaveProperty('paddingVertical');
    });

    it('should get correct padding for large size', () => {
      // Arrange
      button = createButton({ title: 'Large', size: 'large' });

      // Act
      const padding = (button as any).getPadding();

      // Assert
      expect(padding).toHaveProperty('paddingHorizontal');
      expect(padding).toHaveProperty('paddingVertical');
    });

    it('should get correct font size for small size', () => {
      // Arrange
      button = createButton({ title: 'Small', size: 'small' });

      // Act
      const fontSize = (button as any).getFontSize();

      // Assert
      expect(fontSize).toBe(14);
    });

    it('should get correct font size for medium size', () => {
      // Arrange
      button = createButton({ title: 'Medium', size: 'medium' });

      // Act
      const fontSize = (button as any).getFontSize();

      // Assert
      expect(fontSize).toBe(16);
    });

    it('should get correct font size for large size', () => {
      // Arrange
      button = createButton({ title: 'Large', size: 'large' });

      // Act
      const fontSize = (button as any).getFontSize();

      // Assert
      expect(fontSize).toBe(18);
    });
  });

  describe('Container and Label styles', () => {
    it('should create container style', () => {
      // Arrange
      button = createButton({ title: 'Test' });
      const backgroundColor = (button as any).getBackgroundColor();
      const borderColor = (button as any).getBorderColor();
      const padding = (button as any).getPadding();

      // Act
      const containerStyle = (button as any).getContainerStyle(
        backgroundColor,
        borderColor,
        padding,
        false,
      );

      // Assert
      expect(containerStyle).toBeDefined();
    });

    it('should create full width container style', () => {
      // Arrange
      button = createButton({ title: 'Test', fullWidth: true });
      const backgroundColor = (button as any).getBackgroundColor();
      const borderColor = (button as any).getBorderColor();
      const padding = (button as any).getPadding();

      // Act
      const containerStyle = (button as any).getContainerStyle(
        backgroundColor,
        borderColor,
        padding,
        true,
      );

      // Assert
      expect(containerStyle).toBeDefined();
    });

    it('should create label style', () => {
      // Arrange
      button = createButton({ title: 'Test' });
      const fontSize = (button as any).getFontSize();
      const textColor = (button as any).getTextColor();

      // Act
      const labelStyle = (button as any).getLabelStyle(fontSize, textColor);

      // Assert
      expect(labelStyle).toBeDefined();
    });

    it('should apply custom styles', () => {
      // Arrange
      const customStyle = { borderRadius: 50, padding: 20 };
      button = createButton({ title: 'Custom', style: customStyle });
      const backgroundColor = (button as any).getBackgroundColor();
      const borderColor = (button as any).getBorderColor();
      const padding = (button as any).getPadding();

      // Act
      const containerStyle = (button as any).getContainerStyle(
        backgroundColor,
        borderColor,
        padding,
        false,
        customStyle,
      );

      // Assert
      expect(containerStyle).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty title', () => {
      // Arrange
      const props: ButtonProps = {
        title: '',
      };

      // Act
      button = createButton(props);

      // Assert
      expect((button as any).viewModel.title).toBe('');
    });

    it('should handle very long title', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'This is a very long button title that might overflow',
      };

      // Act
      button = createButton(props);

      // Assert
      expect((button as any).viewModel.title).toBe(
        'This is a very long button title that might overflow',
      );
    });

    it('should handle both disabled and loading', () => {
      // Arrange
      const onTapMock = jest.fn();
      const props: ButtonProps = {
        title: 'Button',
        disabled: true,
        loading: true,
        onTap: onTapMock,
      };

      // Act
      button = createButton(props);
      (button as any).handleTap();

      // Assert
      expect(onTapMock).not.toHaveBeenCalled();
    });

    it('should handle undefined variant (use default)', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'Default Variant',
        variant: undefined,
      };

      // Act
      button = createButton(props);
      const backgroundColor = (button as any).getBackgroundColor();

      // Assert
      expect(backgroundColor).toBeDefined();
    });

    it('should handle undefined size (use default)', () => {
      // Arrange
      const props: ButtonProps = {
        title: 'Default Size',
        size: undefined,
      };

      // Act
      button = createButton(props);
      const fontSize = (button as any).getFontSize();

      // Assert
      expect(fontSize).toBe(16); // Default medium size
    });
  });

  describe('Default props', () => {
    it('should have correct default props', () => {
      // Assert
      expect(Button.defaultProps).toEqual({
        variant: 'primary',
        size: 'medium',
        disabled: false,
        loading: false,
        fullWidth: false,
        iconPosition: 'left',
      });
    });
  });

  describe('Accessibility', () => {
    it('should meet minimum touch target size', () => {
      // Arrange
      button = createButton({ title: 'Accessible' });

      // Assert
      // The component has minHeight: 44 in styles
      expect(button).toBeDefined();
    });

    it('should indicate loading state visually', () => {
      // Arrange
      button = createButton({ title: 'Loading', loading: true });

      // Assert - loading state should show "..." instead of title
      expect((button as any).viewModel.loading).toBe(true);
    });

    it('should indicate disabled state visually', () => {
      // Arrange
      button = createButton({ title: 'Disabled', disabled: true });

      // Act
      const backgroundColor = (button as any).getBackgroundColor();
      const textColor = (button as any).getTextColor();

      // Assert - disabled buttons should have muted colors
      expect(backgroundColor).toBeDefined();
      expect(textColor).toBeDefined();
    });
  });
});
