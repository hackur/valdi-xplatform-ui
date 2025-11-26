/**
 * Mock Native Template Elements for testing
 * Valdi JSX elements that compile to native views
 *
 * These types accurately reflect the real Valdi API to catch errors at compile time.
 */

/**
 * EditTextEvent is passed to TextField onChange handler
 */
export interface EditTextEvent {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * View props matching the real Valdi API
 * Note: Does NOT support paddingHorizontal, paddingVertical, flex, borderBottomWidth, borderTopWidth
 */
export interface ViewProps {
  children?: any;
  style?: any;
  backgroundColor?: string;
  // Padding - individual sides only
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  // Margin
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  // Flex layout
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flexGrow?: number;
  flexShrink?: number;
  // Dimensions
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  // Border
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  // Events
  onTap?: () => void;
}

/**
 * Label props matching the real Valdi API
 * Note: Does NOT support fontSize, fontWeight, fontFamily separately
 * Uses font string like "FontName-Weight Size" instead
 */
export interface LabelProps {
  value?: string;
  style?: any;
  // Font is a string like "System-Bold 16" or "Helvetica-Regular 14"
  font?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  numberOfLines?: number;
}

/**
 * Image props
 */
export interface ImageProps {
  source?: string;
  style?: any;
  width?: number;
  height?: number;
  resizeMode?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * ScrollView props (rendered as <scroll> in JSX)
 */
export interface ScrollViewProps extends ViewProps {
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}

/**
 * TextField props matching the real Valdi API
 * Note: Does NOT support disabled, multiline, onValueChange
 * Uses contentType, onChange (with EditTextEvent), and editable instead
 */
export interface TextFieldProps {
  value?: string;
  placeholder?: string;
  // onChange receives EditTextEvent, not just string
  onChange?: (event: EditTextEvent) => void;
  style?: any;
  // Content type for keyboard and autocomplete behavior
  contentType?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  // editable instead of disabled
  editable?: boolean;
  numberOfLines?: number;
}

/**
 * Button props
 */
export interface ButtonProps {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

// Mock element classes
export class View {
  props: ViewProps;
  constructor(props: ViewProps) {
    this.props = props;
  }
}

export class Label {
  props: LabelProps;
  constructor(props: LabelProps) {
    this.props = props;
  }
}

export class Image {
  props: ImageProps;
  constructor(props: ImageProps) {
    this.props = props;
  }
}

export class ScrollView {
  props: ScrollViewProps;
  constructor(props: ScrollViewProps) {
    this.props = props;
  }
}

export class TextField {
  props: TextFieldProps;
  constructor(props: TextFieldProps) {
    this.props = props;
  }
}

export class Button {
  props: ButtonProps;
  constructor(props: ButtonProps) {
    this.props = props;
  }
}
