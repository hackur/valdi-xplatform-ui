# Forms & Validation Demo - Implementation Plan

## Overview
Demonstrate Valdi's form input capabilities using TextField and TextView components. Show input validation, different content types, keyboard management, form state handling, and building complete multi-field forms.

## Valdi Capabilities Identified

### TextField (Single-line input)
```typescript
interface TextField {
  value?: string;
  placeholder?: string;

  // Content type affects keyboard and validation
  contentType?: TextFieldContentType;
  // 'default' | 'phoneNumber' | 'email' | 'password' | 'url' | 'number'

  // Return key configuration
  returnKeyText?: TextFieldReturnKeyText;
  // 'done' | 'go' | 'join' | 'next' | 'search'

  // Validation and change callbacks
  onWillChange?: (event: EditTextEvent) => EditTextEvent | undefined;
  onChange?: (event: EditTextEvent) => void;
  onEditBegin?: (event: EditTextBeginEvent) => void;
  onEditEnd?: (event: EditTextEndEvent) => void;
  onReturn?: (event: EditTextEvent) => void;

  // Appearance
  font?: Font;
  color?: Color;
  textAlign?: TextAlign;  // 'left' | 'center' | 'right'

  // Behavior
  editable?: boolean;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;  // For passwords
}

interface EditTextEvent {
  value: string;
  cursorPosition?: number;
}

interface EditTextBeginEvent {
  value: string;
}

interface EditTextEndEvent {
  value: string;
  reason: 'return' | 'lostFocus';
}
```

### TextView (Multi-line input)
```typescript
interface TextView extends CommonEditTextInterface {
  value?: string;
  placeholder?: string;

  // Similar callbacks to TextField
  onWillChange?: (event: EditTextEvent) => EditTextEvent | undefined;
  onChange?: (event: EditTextEvent) => void;
  onEditBegin?: (event: EditTextBeginEvent) => void;
  onEditEnd?: (event: EditTextEndEvent) => void;

  // Multi-line specific
  scrollEnabled?: boolean;

  // Appearance
  font?: Font;
  color?: Color;
  textAlign?: TextAlign;
}
```

## Implementation Sections

### 1. Basic Text Input & Content Types (2 hours)

**Features to demonstrate:**
- Plain text input (default)
- Email input with keyboard
- Phone number input
- Password (secure entry)
- URL input
- Number input
- Multi-line text (TextView)

**Example structure:**
```typescript
interface BasicInputState {
  name: string;
  email: string;
  phone: string;
  password: string;
  website: string;
  age: string;
  bio: string;
}

<DemoSection title="Content Types">
  <Card>
    <layout>
      {/* Plain text */}
      <label value="Name" font={Fonts.label} />
      <textfield
        value={this.state.name}
        placeholder="Enter your name"
        contentType="default"
        onChange={(e) => this.setState({ name: e.value })}
        style={styles.input}
      />

      {/* Email */}
      <label value="Email" font={Fonts.label} />
      <textfield
        value={this.state.email}
        placeholder="email@example.com"
        contentType="email"
        autoCapitalize="none"
        autoCorrect={false}
        onChange={(e) => this.setState({ email: e.value })}
        style={styles.input}
      />

      {/* Phone */}
      <label value="Phone" font={Fonts.label} />
      <textfield
        value={this.state.phone}
        placeholder="(555) 123-4567"
        contentType="phoneNumber"
        onChange={(e) => this.setState({ phone: e.value })}
        style={styles.input}
      />

      {/* Password */}
      <label value="Password" font={Fonts.label} />
      <textfield
        value={this.state.password}
        placeholder="Enter password"
        contentType="password"
        secureTextEntry={true}
        onChange={(e) => this.setState({ password: e.value })}
        style={styles.input}
      />

      {/* URL */}
      <label value="Website" font={Fonts.label} />
      <textfield
        value={this.state.website}
        placeholder="https://example.com"
        contentType="url"
        autoCapitalize="none"
        onChange={(e) => this.setState({ website: e.value })}
        style={styles.input}
      />

      {/* Number */}
      <label value="Age" font={Fonts.label} />
      <textfield
        value={this.state.age}
        placeholder="25"
        contentType="number"
        onChange={(e) => this.setState({ age: e.value })}
        style={styles.input}
      />

      {/* Multi-line */}
      <label value="Bio" font={Fonts.label} />
      <textview
        value={this.state.bio}
        placeholder="Tell us about yourself..."
        onChange={(e) => this.setState({ bio: e.value })}
        style={styles.textarea}
      />
    </layout>
  </Card>
</DemoSection>
```

### 2. Input Validation (2.5 hours)

**Features:**
- Real-time validation (onChange)
- Pre-validation (onWillChange - reject invalid input)
- Format validation (email, phone, URL)
- Length constraints
- Custom validation rules
- Error message display
- Success indicators

**State management:**
```typescript
interface ValidationState {
  email: string;
  emailError?: string;
  emailValid: boolean;

  phone: string;
  phoneError?: string;

  username: string;
  usernameError?: string;
}

// Email validation
private validateEmail(email: string): { valid: boolean, error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

private handleEmailChange(value: string) {
  const validation = this.validateEmail(value);

  this.setState({
    email: value,
    emailValid: validation.valid,
    emailError: validation.error,
  });
}

// Pre-validation with onWillChange
private handlePhoneWillChange(event: EditTextEvent): EditTextEvent | undefined {
  // Only allow digits, spaces, dashes, parentheses
  const sanitized = event.value.replace(/[^0-9\s\-\(\)]/g, '');

  if (sanitized !== event.value) {
    // Return modified event to replace invalid characters
    return { ...event, value: sanitized };
  }

  // Return undefined to accept change as-is
  return undefined;
}

// Username validation
private validateUsername(username: string): { valid: boolean, error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { valid: false, error: 'Username must be at most 20 characters' };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { valid: true };
}
```

**UI structure:**
```typescript
<DemoSection title="Input Validation">
  <Card>
    <layout>
      {/* Email with validation */}
      <label value="Email" font={Fonts.label} />
      <textfield
        value={this.state.email}
        placeholder="email@example.com"
        contentType="email"
        autoCapitalize="none"
        onChange={(e) => this.handleEmailChange(e.value)}
        style={{
          ...styles.input,
          borderColor: this.state.emailError ? Colors.error :
                      this.state.emailValid ? Colors.success : Colors.border
        }}
      />
      {this.state.emailError && (
        <label
          value={this.state.emailError}
          font={Fonts.caption}
          color={Colors.error}
        />
      )}
      {this.state.emailValid && (
        <label
          value="✓ Valid email"
          font={Fonts.caption}
          color={Colors.success}
        />
      )}

      {/* Phone with pre-validation */}
      <label value="Phone Number" font={Fonts.label} />
      <textfield
        value={this.state.phone}
        placeholder="(555) 123-4567"
        contentType="phoneNumber"
        onWillChange={(e) => this.handlePhoneWillChange(e)}
        onChange={(e) => this.setState({ phone: e.value })}
        style={styles.input}
      />
      <label
        value="Only digits and phone formatting allowed"
        font={Fonts.caption}
        color={Colors.textSecondary}
      />

      {/* Username with multiple rules */}
      <label value="Username" font={Fonts.label} />
      <textfield
        value={this.state.username}
        placeholder="john_doe123"
        maxLength={20}
        autoCapitalize="none"
        onChange={(e) => {
          const validation = this.validateUsername(e.value);
          this.setState({
            username: e.value,
            usernameError: validation.error,
          });
        }}
        style={{
          ...styles.input,
          borderColor: this.state.usernameError ? Colors.error : Colors.border
        }}
      />
      {this.state.usernameError && (
        <label
          value={this.state.usernameError}
          font={Fonts.caption}
          color={Colors.error}
        />
      )}
      <label
        value={`${this.state.username.length}/20 characters`}
        font={Fonts.caption}
        color={Colors.textSecondary}
      />
    </layout>
  </Card>
</DemoSection>
```

### 3. Keyboard Management & Return Key (1.5 hours)

**Features:**
- Different return key types (done, go, next, search)
- Return key actions
- Focus management (moving between fields)
- onEditBegin/onEditEnd callbacks
- Keyboard dismiss

**State management:**
```typescript
interface KeyboardState {
  field1: string;
  field2: string;
  field3: string;
  searchQuery: string;
  currentFocus?: 'field1' | 'field2' | 'field3' | 'search';
}

private handleReturn(fieldName: string) {
  // Move focus to next field or submit
  const focusOrder: Array<keyof KeyboardState> = ['field1', 'field2', 'field3'];
  const currentIndex = focusOrder.indexOf(fieldName as any);

  if (currentIndex < focusOrder.length - 1) {
    const nextField = focusOrder[currentIndex + 1];
    this.setState({ currentFocus: nextField });
  } else {
    // Last field - submit form
    this.submitForm();
  }
}

private handleSearch(query: string) {
  console.log(`Searching for: ${query}`);
  // Perform search
}
```

**UI structure:**
```typescript
<DemoSection title="Keyboard Management">
  <Card>
    <layout>
      {/* Field with "Next" return key */}
      <label value="First Name" font={Fonts.label} />
      <textfield
        value={this.state.field1}
        placeholder="John"
        returnKeyText="next"
        onReturn={() => this.handleReturn('field1')}
        onChange={(e) => this.setState({ field1: e.value })}
        onEditBegin={() => this.setState({ currentFocus: 'field1' })}
        style={styles.input}
      />

      {/* Field with "Next" return key */}
      <label value="Last Name" font={Fonts.label} />
      <textfield
        value={this.state.field2}
        placeholder="Doe"
        returnKeyText="next"
        onReturn={() => this.handleReturn('field2')}
        onChange={(e) => this.setState({ field2: e.value })}
        onEditBegin={() => this.setState({ currentFocus: 'field2' })}
        style={styles.input}
      />

      {/* Field with "Done" return key */}
      <label value="Email" font={Fonts.label} />
      <textfield
        value={this.state.field3}
        placeholder="john@example.com"
        contentType="email"
        returnKeyText="done"
        onReturn={() => this.handleReturn('field3')}
        onChange={(e) => this.setState({ field3: e.value })}
        onEditBegin={() => this.setState({ currentFocus: 'field3' })}
        style={styles.input}
      />

      {/* Search field with "Search" return key */}
      <label value="Search" font={Fonts.label} />
      <textfield
        value={this.state.searchQuery}
        placeholder="Search..."
        returnKeyText="search"
        onReturn={(e) => this.handleSearch(e.value)}
        onChange={(e) => this.setState({ searchQuery: e.value })}
        style={styles.input}
      />

      {this.state.currentFocus && (
        <label
          value={`Currently editing: ${this.state.currentFocus}`}
          font={Fonts.caption}
          color={Colors.textSecondary}
        />
      )}
    </layout>
  </Card>
</DemoSection>
```

### 4. Complete Form Example (2 hours)

**Features:**
- Multi-field form
- Combined validation
- Form submission
- Loading/submitting state
- Success/error feedback
- Form reset
- Required fields indicators

**State management:**
```typescript
interface FormState {
  // Form values
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;

  // Validation errors
  errors: {
    [key: string]: string | undefined;
  };

  // Form status
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError?: string;
}

private validateForm(): { valid: boolean, errors: { [key: string]: string } } {
  const errors: { [key: string]: string } = {};

  if (!this.state.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!this.state.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!this.state.email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(this.state.email)) {
    errors.email = 'Invalid email format';
  }

  if (!this.state.password) {
    errors.password = 'Password is required';
  } else if (this.state.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (this.state.password !== this.state.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!this.state.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

private async submitForm() {
  const validation = this.validateForm();

  if (!validation.valid) {
    this.setState({ errors: validation.errors });
    return;
  }

  this.setState({ isSubmitting: true, submitError: undefined });

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.setState({
      isSubmitting: false,
      submitSuccess: true,
    });

    // Reset form after success
    setTimeout(() => {
      this.resetForm();
    }, 2000);
  } catch (error) {
    this.setState({
      isSubmitting: false,
      submitError: 'Failed to submit form. Please try again.',
    });
  }
}

private resetForm() {
  this.setState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    errors: {},
    submitSuccess: false,
    submitError: undefined,
  });
}
```

**UI structure:**
```typescript
<DemoSection title="Complete Registration Form">
  <Card>
    <scroll style={styles.formScroll}>
      <layout style={styles.form}>
        {/* Form fields */}
        <label value="First Name *" font={Fonts.label} />
        <textfield
          value={this.state.firstName}
          placeholder="John"
          returnKeyText="next"
          onChange={(e) => this.setState({ firstName: e.value })}
          style={this.getInputStyle('firstName')}
        />
        {this.state.errors.firstName && (
          <label value={this.state.errors.firstName} font={Fonts.caption} color={Colors.error} />
        )}

        <label value="Last Name *" font={Fonts.label} />
        <textfield
          value={this.state.lastName}
          placeholder="Doe"
          returnKeyText="next"
          onChange={(e) => this.setState({ lastName: e.value })}
          style={this.getInputStyle('lastName')}
        />
        {this.state.errors.lastName && (
          <label value={this.state.errors.lastName} font={Fonts.caption} color={Colors.error} />
        )}

        <label value="Email *" font={Fonts.label} />
        <textfield
          value={this.state.email}
          placeholder="john@example.com"
          contentType="email"
          autoCapitalize="none"
          returnKeyText="next"
          onChange={(e) => this.setState({ email: e.value })}
          style={this.getInputStyle('email')}
        />
        {this.state.errors.email && (
          <label value={this.state.errors.email} font={Fonts.caption} color={Colors.error} />
        )}

        <label value="Phone" font={Fonts.label} />
        <textfield
          value={this.state.phone}
          placeholder="(555) 123-4567"
          contentType="phoneNumber"
          returnKeyText="next"
          onChange={(e) => this.setState({ phone: e.value })}
          style={styles.input}
        />

        <label value="Password *" font={Fonts.label} />
        <textfield
          value={this.state.password}
          placeholder="Minimum 8 characters"
          contentType="password"
          secureTextEntry={true}
          returnKeyText="next"
          onChange={(e) => this.setState({ password: e.value })}
          style={this.getInputStyle('password')}
        />
        {this.state.errors.password && (
          <label value={this.state.errors.password} font={Fonts.caption} color={Colors.error} />
        )}

        <label value="Confirm Password *" font={Fonts.label} />
        <textfield
          value={this.state.confirmPassword}
          placeholder="Re-enter password"
          contentType="password"
          secureTextEntry={true}
          returnKeyText="done"
          onChange={(e) => this.setState({ confirmPassword: e.value })}
          style={this.getInputStyle('confirmPassword')}
        />
        {this.state.errors.confirmPassword && (
          <label value={this.state.errors.confirmPassword} font={Fonts.caption} color={Colors.error} />
        )}

        {/* Submit status */}
        {this.state.submitError && (
          <view style={styles.errorBox}>
            <label value={this.state.submitError} font={Fonts.body} color={Colors.error} />
          </view>
        )}

        {this.state.submitSuccess && (
          <view style={styles.successBox}>
            <label value="✓ Registration successful!" font={Fonts.body} color={Colors.success} />
          </view>
        )}

        {/* Submit button */}
        <Button
          title={this.state.isSubmitting ? "Submitting..." : "Register"}
          variant="primary"
          disabled={this.state.isSubmitting}
          onTap={() => this.submitForm()}
        />

        <Button
          title="Reset Form"
          variant="outline"
          onTap={() => this.resetForm()}
        />
      </layout>
    </scroll>
  </Card>
</DemoSection>
```

## State Management

```typescript
interface FormsDemoState {
  // Basic inputs
  name: string;
  email: string;
  phone: string;
  password: string;
  website: string;
  age: string;
  bio: string;

  // Validation examples
  emailValidation: { valid: boolean, error?: string };
  phoneFormatted: string;
  username: string;
  usernameError?: string;

  // Keyboard management
  field1: string;
  field2: string;
  field3: string;
  searchQuery: string;
  currentFocus?: string;

  // Complete form
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  };
  formErrors: { [key: string]: string };
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError?: string;
}
```

## Code Examples to Include

### Validation Helper
```typescript
class FormValidator {
  static email(value: string): { valid: boolean, error?: string } {
    if (!value) return { valid: false, error: 'Email is required' };
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return { valid: false, error: 'Invalid email format' };
    return { valid: true };
  }

  static phoneUS(value: string): { valid: boolean, error?: string } {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10) return { valid: false, error: 'Phone must be 10 digits' };
    return { valid: true };
  }

  static required(value: string, fieldName: string): { valid: boolean, error?: string } {
    if (!value.trim()) return { valid: false, error: `${fieldName} is required` };
    return { valid: true };
  }
}
```

### Phone Number Formatting
```typescript
private formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
}
```

## Performance Considerations

1. **Validation Throttling**: Avoid validating on every keystroke for expensive operations
2. **Error State**: Only show errors after field is touched or blur
3. **Form Submission**: Disable submit button during submission
4. **Keyboard**: Properly manage keyboard show/hide for better UX
5. **Focus Management**: Use refs if available for programmatic focus control

## Estimated Effort

- **Basic text input & content types**: 2 hours
- **Input validation**: 2.5 hours
- **Keyboard management & return key**: 1.5 hours
- **Complete form example**: 2 hours
- **Testing & polish**: 1 hour

**Total: 9 hours**

## Success Criteria

- [ ] All content types display correct keyboard
- [ ] Email validation works in real-time
- [ ] Phone number accepts only valid characters (onWillChange)
- [ ] Password field masks input
- [ ] Multi-line text input scrolls correctly
- [ ] Return key actions work (next, done, search)
- [ ] Validation errors display clearly
- [ ] Success indicators show for valid input
- [ ] Complete form validates all fields
- [ ] Form submits with loading state
- [ ] Form shows success/error feedback
- [ ] Form can be reset
- [ ] Works on both iOS and Android
- [ ] Keyboard management smooth on both platforms

## Advanced Features to Showcase

1. **Async Validation**: Check username availability with debouncing
2. **Password Strength Meter**: Visual indicator of password strength
3. **Auto-fill Support**: Detecting and handling auto-fill
4. **Custom Input Masks**: Credit card, date, currency formatting
5. **Multi-step Forms**: Wizard-style forms with progress indicator
