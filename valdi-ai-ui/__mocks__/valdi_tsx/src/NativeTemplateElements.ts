/**
 * Mock Native Template Elements for testing
 * Valdi JSX elements that compile to native views
 */

export interface ViewProps {
  children?: any;
  style?: any;
  backgroundColor?: string;
  padding?: number;
  margin?: number;
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  flex?: number;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  onTap?: () => void;
  [key: string]: any;
}

export interface LabelProps {
  value?: string;
  style?: any;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  numberOfLines?: number;
  [key: string]: any;
}

export interface ImageProps {
  source?: string;
  style?: any;
  width?: number;
  height?: number;
  resizeMode?: string;
  [key: string]: any;
}

export interface ScrollViewProps extends ViewProps {
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}

export interface TextInputProps {
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  style?: any;
  multiline?: boolean;
  numberOfLines?: number;
  [key: string]: any;
}

export interface ButtonProps {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  [key: string]: any;
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

export class TextInput {
  props: TextInputProps;
  constructor(props: TextInputProps) {
    this.props = props;
  }
}

export class Button {
  props: ButtonProps;
  constructor(props: ButtonProps) {
    this.props = props;
  }
}
