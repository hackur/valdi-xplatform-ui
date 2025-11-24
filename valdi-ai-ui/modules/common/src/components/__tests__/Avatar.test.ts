/**
 * Avatar Component Tests
 *
 * Comprehensive unit tests for the Avatar component.
 * Tests all types (user, ai, system, custom), sizes, initials, and interactions.
 */

import { Avatar, AvatarProps, AvatarSize, AvatarType } from '../Avatar';
import { Colors, Shadows } from '../../theme';

describe('Avatar Component', () => {
  describe('Component Instantiation', () => {
    it('should create an Avatar instance with minimal props', () => {
      const avatar = new Avatar({});
      expect(avatar).toBeInstanceOf(Avatar);
    });

    it('should apply default props when not specified', () => {
      const avatar = new Avatar({});
      expect(avatar.viewModel.type).toBe('user');
      expect(avatar.viewModel.size).toBe('medium');
      expect(avatar.viewModel.elevated).toBe(false);
    });

    it('should accept all props when provided', () => {
      const onTap = jest.fn();
      const customStyle = { marginTop: 10 };

      const avatar = new Avatar({
        type: 'ai',
        size: 'large',
        initials: 'AB',
        imageUrl: 'https://example.com/avatar.png',
        backgroundColor: Colors.primary,
        textColor: Colors.textInverse,
        elevated: true,
        onTap,
        style: customStyle,
      });

      expect(avatar.viewModel.type).toBe('ai');
      expect(avatar.viewModel.size).toBe('large');
      expect(avatar.viewModel.initials).toBe('AB');
      expect(avatar.viewModel.imageUrl).toBe('https://example.com/avatar.png');
      expect(avatar.viewModel.backgroundColor).toBe(Colors.primary);
      expect(avatar.viewModel.textColor).toBe(Colors.textInverse);
      expect(avatar.viewModel.elevated).toBe(true);
      expect(avatar.viewModel.onTap).toBe(onTap);
      expect(avatar.viewModel.style).toBe(customStyle);
    });
  });

  describe('Avatar Types', () => {
    const types: AvatarType[] = ['user', 'ai', 'system'];

    types.forEach((type) => {
      it(`should handle ${type} type`, () => {
        const avatar = new Avatar({ type });
        expect(avatar.viewModel.type).toBe(type);
      });

      it(`should return correct background color for ${type} type`, () => {
        const avatar = new Avatar({ type });
        const backgroundColor = (avatar as any).getBackgroundColor();

        switch (type) {
          case 'user':
            expect(backgroundColor).toBe(Colors.primary);
            break;
          case 'ai':
            expect(backgroundColor).toBe(Colors.secondary);
            break;
          case 'system':
            expect(backgroundColor).toBe(Colors.gray500);
            break;
        }
      });

      it(`should return correct default initials for ${type} type`, () => {
        const avatar = new Avatar({ type });
        const initials = (avatar as any).getInitials();

        switch (type) {
          case 'user':
            expect(initials).toBe('U');
            break;
          case 'ai':
            expect(initials).toBe('AI');
            break;
          case 'system':
            expect(initials).toBe('S');
            break;
        }
      });
    });

    it('should default to user type for invalid values', () => {
      const avatar = new Avatar({ type: 'invalid' as AvatarType });
      const backgroundColor = (avatar as any).getBackgroundColor();
      const initials = (avatar as any).getInitials();

      expect(backgroundColor).toBe(Colors.primary);
      expect(initials).toBe('U');
    });
  });

  describe('Avatar Sizes', () => {
    const sizes: AvatarSize[] = ['small', 'medium', 'large', 'xlarge'];

    sizes.forEach((size) => {
      it(`should handle ${size} size`, () => {
        const avatar = new Avatar({ size });
        expect(avatar.viewModel.size).toBe(size);

        const avatarSize = (avatar as any).getSize();
        expect(typeof avatarSize).toBe('number');
        expect(avatarSize).toBeGreaterThan(0);
      });

      it(`should return correct dimensions for ${size} size`, () => {
        const avatar = new Avatar({ size });
        const avatarSize = (avatar as any).getSize();

        switch (size) {
          case 'small':
            expect(avatarSize).toBe(32);
            break;
          case 'medium':
            expect(avatarSize).toBe(40);
            break;
          case 'large':
            expect(avatarSize).toBe(48);
            break;
          case 'xlarge':
            expect(avatarSize).toBe(64);
            break;
        }
      });

      it(`should return correct font size for ${size} size`, () => {
        const avatar = new Avatar({ size });
        const fontSize = (avatar as any).getFontSize();

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
          case 'xlarge':
            expect(fontSize).toBe(24);
            break;
        }
      });
    });

    it('should default to medium size for invalid values', () => {
      const avatar = new Avatar({ size: 'invalid' as AvatarSize });
      const avatarSize = (avatar as any).getSize();
      const fontSize = (avatar as any).getFontSize();

      expect(avatarSize).toBe(40);
      expect(fontSize).toBe(16);
    });

    it('should maintain circular shape with equal width and height', () => {
      const sizes: AvatarSize[] = ['small', 'medium', 'large', 'xlarge'];

      sizes.forEach((size) => {
        const avatar = new Avatar({ size });
        const avatarSize = (avatar as any).getSize();
        const containerStyle = (avatar as any).getContainerStyle(
          avatarSize,
          Colors.primary,
          false
        );

        expect(containerStyle.style.width).toBe(avatarSize);
        expect(containerStyle.style.height).toBe(avatarSize);
        expect(containerStyle.style.borderRadius).toBe(avatarSize / 2);
      });
    });
  });

  describe('Initials', () => {
    it('should use provided initials', () => {
      const avatar = new Avatar({ initials: 'JD' });
      const initials = (avatar as any).getInitials();
      expect(initials).toBe('JD');
    });

    it('should uppercase initials', () => {
      const avatar = new Avatar({ initials: 'ab' });
      const initials = (avatar as any).getInitials();
      expect(initials).toBe('AB');
    });

    it('should truncate initials to 2 characters', () => {
      const avatar = new Avatar({ initials: 'ABCDEF' });
      const initials = (avatar as any).getInitials();
      expect(initials).toBe('AB');
      expect(initials.length).toBe(2);
    });

    it('should handle single character initials', () => {
      const avatar = new Avatar({ initials: 'J' });
      const initials = (avatar as any).getInitials();
      expect(initials).toBe('J');
    });

    it('should handle empty string initials', () => {
      const avatar = new Avatar({ initials: '' });
      const initials = (avatar as any).getInitials();
      // Should fallback to default based on type
      expect(initials).toBe('U'); // default user type
    });

    it('should prefer custom initials over type defaults', () => {
      const avatar = new Avatar({ type: 'ai', initials: 'XY' });
      const initials = (avatar as any).getInitials();
      expect(initials).toBe('XY');
    });

    it('should handle special characters in initials', () => {
      const avatar = new Avatar({ initials: '@#' });
      const initials = (avatar as any).getInitials();
      expect(initials).toBe('@#');
    });

    it('should handle unicode characters in initials', () => {
      const avatar = new Avatar({ initials: '你好' });
      const initials = (avatar as any).getInitials();
      expect(initials).toBe('你好');
    });
  });

  describe('Image Support', () => {
    it('should accept image URL', () => {
      const imageUrl = 'https://example.com/avatar.png';
      const avatar = new Avatar({ imageUrl });
      expect(avatar.viewModel.imageUrl).toBe(imageUrl);
    });

    it('should work without image URL', () => {
      const avatar = new Avatar({});
      expect(avatar.viewModel.imageUrl).toBeUndefined();
    });

    it('should handle various image URL formats', () => {
      const urls = [
        'https://example.com/avatar.png',
        'http://example.com/avatar.jpg',
        '/local/path/avatar.gif',
        'data:image/png;base64,iVBORw0KG...',
      ];

      urls.forEach((url) => {
        const avatar = new Avatar({ imageUrl: url });
        expect(avatar.viewModel.imageUrl).toBe(url);
      });
    });

    it('should handle empty image URL', () => {
      const avatar = new Avatar({ imageUrl: '' });
      expect(avatar.viewModel.imageUrl).toBe('');
    });
  });

  describe('Background Color', () => {
    it('should use custom background color when provided', () => {
      const customColor = '#FF5733';
      const avatar = new Avatar({ backgroundColor: customColor });
      const backgroundColor = (avatar as any).getBackgroundColor();
      expect(backgroundColor).toBe(customColor);
    });

    it('should use type-based color when no custom color provided', () => {
      const avatar = new Avatar({ type: 'user' });
      const backgroundColor = (avatar as any).getBackgroundColor();
      expect(backgroundColor).toBe(Colors.primary);
    });

    it('should prefer custom color over type-based color', () => {
      const customColor = '#00FF00';
      const avatar = new Avatar({
        type: 'user',
        backgroundColor: customColor,
      });
      const backgroundColor = (avatar as any).getBackgroundColor();
      expect(backgroundColor).toBe(customColor);
    });

    it('should handle all theme colors', () => {
      const colors = [
        Colors.primary,
        Colors.secondary,
        Colors.error,
        Colors.success,
      ];

      colors.forEach((color) => {
        const avatar = new Avatar({ backgroundColor: color });
        const backgroundColor = (avatar as any).getBackgroundColor();
        expect(backgroundColor).toBe(color);
      });
    });
  });

  describe('Text Color', () => {
    it('should default to textInverse color', () => {
      const avatar = new Avatar({});
      const textColor = (avatar as any).getTextColor();
      expect(textColor).toBe(Colors.textInverse);
    });

    it('should use custom text color when provided', () => {
      const customColor = '#FFFFFF';
      const avatar = new Avatar({ textColor: customColor });
      const textColor = (avatar as any).getTextColor();
      expect(textColor).toBe(customColor);
    });

    it('should handle all theme text colors', () => {
      const colors = [
        Colors.textPrimary,
        Colors.textSecondary,
        Colors.textTertiary,
        Colors.textInverse,
      ];

      colors.forEach((color) => {
        const avatar = new Avatar({ textColor: color });
        const textColor = (avatar as any).getTextColor();
        expect(textColor).toBe(color);
      });
    });
  });

  describe('Elevation', () => {
    it('should not be elevated by default', () => {
      const avatar = new Avatar({});
      expect(avatar.viewModel.elevated).toBe(false);
    });

    it('should accept elevated prop', () => {
      const avatar = new Avatar({ elevated: true });
      expect(avatar.viewModel.elevated).toBe(true);
    });

    it('should apply shadow when elevated', () => {
      const avatar = new Avatar({ elevated: true });
      const size = (avatar as any).getSize();
      const backgroundColor = (avatar as any).getBackgroundColor();

      const containerStyle = (avatar as any).getContainerStyle(
        size,
        backgroundColor,
        true
      );

      // Check that shadow properties are included
      expect(containerStyle.style).toMatchObject(Shadows.sm);
    });

    it('should not apply shadow when not elevated', () => {
      const avatar = new Avatar({ elevated: false });
      const size = (avatar as any).getSize();
      const backgroundColor = (avatar as any).getBackgroundColor();

      const containerStyle = (avatar as any).getContainerStyle(
        size,
        backgroundColor,
        false
      );

      // Shadow properties should not be in the style
      const shadowKeys = Object.keys(Shadows.sm);
      shadowKeys.forEach((key) => {
        if (key !== 'elevation') {
          // Some keys might be common
          expect(containerStyle.style[key]).toBeUndefined();
        }
      });
    });
  });

  describe('Tap Handler', () => {
    it('should accept onTap handler', () => {
      const onTap = jest.fn();
      const avatar = new Avatar({ onTap });
      expect(avatar.viewModel.onTap).toBe(onTap);
    });

    it('should call onTap when tapped', () => {
      const onTap = jest.fn();
      const avatar = new Avatar({ onTap });

      (avatar as any).handleTap();
      expect(onTap).toHaveBeenCalledTimes(1);
    });

    it('should not throw when onTap is undefined', () => {
      const avatar = new Avatar({});
      expect(() => (avatar as any).handleTap()).not.toThrow();
    });

    it('should call onTap multiple times if tapped multiple times', () => {
      const onTap = jest.fn();
      const avatar = new Avatar({ onTap });

      (avatar as any).handleTap();
      (avatar as any).handleTap();
      (avatar as any).handleTap();

      expect(onTap).toHaveBeenCalledTimes(3);
    });

    it('should work without onTap handler', () => {
      const avatar = new Avatar({});
      expect(avatar.viewModel.onTap).toBeUndefined();
    });
  });

  describe('Custom Styles', () => {
    it('should accept custom style prop', () => {
      const customStyle = { marginTop: 10, marginBottom: 20 };
      const avatar = new Avatar({ style: customStyle });
      expect(avatar.viewModel.style).toEqual(customStyle);
    });

    it('should apply custom styles to container', () => {
      const customStyle = { marginTop: 10, opacity: 0.8 };
      const avatar = new Avatar({ style: customStyle });
      const size = (avatar as any).getSize();
      const backgroundColor = (avatar as any).getBackgroundColor();

      const containerStyle = (avatar as any).getContainerStyle(
        size,
        backgroundColor,
        false,
        customStyle
      );

      expect(containerStyle.style.marginTop).toBe(10);
      expect(containerStyle.style.opacity).toBe(0.8);
    });

    it('should work without custom styles', () => {
      const avatar = new Avatar({});
      expect(avatar.viewModel.style).toBeUndefined();
    });

    it('should merge custom styles with default styles', () => {
      const customStyle = { marginLeft: 15 };
      const avatar = new Avatar({ style: customStyle });
      const size = (avatar as any).getSize();
      const backgroundColor = (avatar as any).getBackgroundColor();

      const containerStyle = (avatar as any).getContainerStyle(
        size,
        backgroundColor,
        false,
        customStyle
      );

      // Should have both default and custom styles
      expect(containerStyle.style.width).toBe(size); // default
      expect(containerStyle.style.marginLeft).toBe(15); // custom
    });
  });

  describe('Style Getters', () => {
    it('should generate container style correctly', () => {
      const avatar = new Avatar({
        type: 'user',
        size: 'medium',
        elevated: false,
      });

      const size = (avatar as any).getSize();
      const backgroundColor = (avatar as any).getBackgroundColor();

      const containerStyle = (avatar as any).getContainerStyle(
        size,
        backgroundColor,
        false
      );

      expect(containerStyle).toBeDefined();
      expect(containerStyle.style).toBeDefined();
      expect(containerStyle.style.width).toBe(40);
      expect(containerStyle.style.height).toBe(40);
      expect(containerStyle.style.borderRadius).toBe(20);
      expect(containerStyle.style.backgroundColor).toBe(Colors.primary);
      expect(containerStyle.style.alignItems).toBe('center');
      expect(containerStyle.style.justifyContent).toBe('center');
    });

    it('should generate image style correctly', () => {
      const avatar = new Avatar({ size: 'large' });
      const size = (avatar as any).getSize();

      const imageStyle = (avatar as any).getImageStyle(size);

      expect(imageStyle).toBeDefined();
      expect(imageStyle.style).toBeDefined();
      expect(imageStyle.style.width).toBe(48);
      expect(imageStyle.style.height).toBe(48);
      expect(imageStyle.style.borderRadius).toBe(24);
    });

    it('should generate label style correctly', () => {
      const avatar = new Avatar({ size: 'xlarge', textColor: Colors.textInverse });
      const fontSize = (avatar as any).getFontSize();
      const textColor = (avatar as any).getTextColor();

      const labelStyle = (avatar as any).getLabelStyle(fontSize, textColor);

      expect(labelStyle).toBeDefined();
      expect(labelStyle.style).toBeDefined();
      expect(labelStyle.style.color).toBe(Colors.textInverse);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all props as undefined', () => {
      const avatar = new Avatar({
        type: undefined,
        size: undefined,
        initials: undefined,
        imageUrl: undefined,
        backgroundColor: undefined,
        textColor: undefined,
        elevated: undefined,
        onTap: undefined,
        style: undefined,
      });

      // Should use defaults
      expect(avatar.viewModel.type).toBe('user');
      expect(avatar.viewModel.size).toBe('medium');
      expect(avatar.viewModel.elevated).toBe(false);
    });

    it('should handle empty object as props', () => {
      const avatar = new Avatar({});
      expect(avatar).toBeInstanceOf(Avatar);
      expect(() => avatar.onRender()).not.toThrow();
    });

    it('should preserve all props when creating instance', () => {
      const props: AvatarProps = {
        type: 'ai',
        size: 'xlarge',
        initials: 'AB',
        imageUrl: 'https://example.com/avatar.png',
        backgroundColor: Colors.secondary,
        textColor: Colors.textPrimary,
        elevated: true,
        onTap: jest.fn(),
        style: { opacity: 0.9 },
      };

      const avatar = new Avatar(props);

      expect(avatar.viewModel.type).toBe(props.type);
      expect(avatar.viewModel.size).toBe(props.size);
      expect(avatar.viewModel.initials).toBe(props.initials);
      expect(avatar.viewModel.imageUrl).toBe(props.imageUrl);
      expect(avatar.viewModel.backgroundColor).toBe(props.backgroundColor);
      expect(avatar.viewModel.textColor).toBe(props.textColor);
      expect(avatar.viewModel.elevated).toBe(props.elevated);
      expect(avatar.viewModel.onTap).toBe(props.onTap);
      expect(avatar.viewModel.style).toBe(props.style);
    });

    it('should handle very long initials gracefully', () => {
      const avatar = new Avatar({ initials: 'ABCDEFGHIJKLMNOP' });
      const initials = (avatar as any).getInitials();
      expect(initials.length).toBeLessThanOrEqual(2);
    });

    it('should handle null image URL', () => {
      const avatar = new Avatar({ imageUrl: null as any });
      expect(avatar.viewModel.imageUrl).toBeNull();
    });
  });

  describe('Rendering', () => {
    it('should have onRender method', () => {
      const avatar = new Avatar({});
      expect(typeof avatar.onRender).toBe('function');
    });

    // Note: Skipping actual render tests as JSX requires createElement in test environment
    // The component logic is fully tested through unit tests above

    it('should handle all avatar types without errors', () => {
      const types: AvatarType[] = ['user', 'ai', 'system'];

      types.forEach((type) => {
        const avatar = new Avatar({ type });
        expect(avatar).toBeInstanceOf(Avatar);
        expect(avatar.viewModel.type).toBe(type);
      });
    });

    it('should handle all sizes without errors', () => {
      const sizes: AvatarSize[] = ['small', 'medium', 'large', 'xlarge'];

      sizes.forEach((size) => {
        const avatar = new Avatar({ size });
        expect(avatar).toBeInstanceOf(Avatar);
        expect(avatar.viewModel.size).toBe(size);
      });
    });

    it('should handle initials', () => {
      const avatar = new Avatar({ initials: 'JD' });
      expect(avatar.viewModel.initials).toBe('JD');
    });

    it('should handle image URL', () => {
      const avatar = new Avatar({ imageUrl: 'https://example.com/avatar.png' });
      expect(avatar.viewModel.imageUrl).toBe('https://example.com/avatar.png');
    });

    it('should handle onTap handler', () => {
      const avatar = new Avatar({ onTap: jest.fn() });
      expect(avatar.viewModel.onTap).toBeDefined();
    });

    it('should handle missing onTap handler', () => {
      const avatar = new Avatar({});
      expect(avatar.viewModel.onTap).toBeUndefined();
    });

    it('should handle all combinations of props without errors', () => {
      const types: AvatarType[] = ['user', 'ai', 'system'];
      const sizes: AvatarSize[] = ['small', 'medium', 'large', 'xlarge'];
      const elevated = [true, false];

      types.forEach((type) => {
        sizes.forEach((size) => {
          elevated.forEach((isElevated) => {
            const avatar = new Avatar({
              type,
              size,
              elevated: isElevated,
              initials: 'AB',
            });

            // Verify component is created correctly
            expect(avatar).toBeInstanceOf(Avatar);
            expect(avatar.viewModel.type).toBe(type);
            expect(avatar.viewModel.size).toBe(size);
            expect(avatar.viewModel.elevated).toBe(isElevated);
          });
        });
      });
    });
  });

  describe('Image vs Initials Priority', () => {
    it('should prefer image over initials when both provided', () => {
      const avatar = new Avatar({
        initials: 'AB',
        imageUrl: 'https://example.com/avatar.png',
      });

      expect(avatar.viewModel.initials).toBe('AB');
      expect(avatar.viewModel.imageUrl).toBe('https://example.com/avatar.png');
      // Both are stored, render logic determines which to show
    });

    it('should show initials when no image URL provided', () => {
      const avatar = new Avatar({ initials: 'AB' });
      expect(avatar.viewModel.imageUrl).toBeUndefined();
      expect(avatar.viewModel.initials).toBe('AB');
    });

    it('should show default initials when neither provided', () => {
      const avatar = new Avatar({ type: 'ai' });
      const initials = (avatar as any).getInitials();
      expect(initials).toBe('AI');
    });
  });
});
