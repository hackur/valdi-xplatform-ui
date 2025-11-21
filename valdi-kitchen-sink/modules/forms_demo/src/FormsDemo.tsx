/**
 * FormsDemo Component
 * Demonstrates TextField and TextView with validation, keyboard management, and complete form examples
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { NavigationController } from 'valdi_navigation/src/NavigationRoot';
import { NavigationPageComponent } from 'valdi_navigation/src/NavigationPageComponent';
import { NavigationPage } from 'valdi_navigation/src/decorators';
import { View, Label, Layout, ScrollView, TextField, TextView } from 'valdi_tsx/src/NativeTemplateElements';

import {
  Colors,
  Fonts,
  FontSizes,
  Spacing,
  BorderRadius,
  Header,
  DemoSection,
  Card,
  Button,
  CodeBlock,
} from '../../common/src/index';

export interface FormsDemoViewModel {
  navigationController: NavigationController;
}

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
  validationEmail: string;
  validationEmailError?: string;
  validationEmailValid: boolean;

  validationPhone: string;
  validationPhoneError?: string;

  username: string;
  usernameError?: string;

  // Keyboard management
  firstName: string;
  lastName: string;
  userEmail: string;
  searchQuery: string;
  currentFocus?: string;

  // Complete form
  formFirstName: string;
  formLastName: string;
  formEmail: string;
  formPhone: string;
  formPassword: string;
  formConfirmPassword: string;
  formComments: string;

  formErrors: { [key: string]: string };
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError?: string;
}

@NavigationPage(module)
export class FormsDemo extends StatefulComponent<FormsDemoViewModel, FormsDemoState> {
  state: FormsDemoState = {
    // Basic inputs
    name: '',
    email: '',
    phone: '',
    password: '',
    website: '',
    age: '',
    bio: '',

    // Validation examples
    validationEmail: '',
    validationEmailValid: false,

    validationPhone: '',

    username: '',

    // Keyboard management
    firstName: '',
    lastName: '',
    userEmail: '',
    searchQuery: '',

    // Complete form
    formFirstName: '',
    formLastName: '',
    formEmail: '',
    formPhone: '',
    formPassword: '',
    formConfirmPassword: '',
    formComments: '',

    formErrors: {},
    isSubmitting: false,
    submitSuccess: false,
  };

  onRender() {
    <view style={styles.page}>
      {/* Header */}
      <Header
        title="Forms & Validation"
        showBack={true}
        onBack={() => this.viewModel.navigationController.pop()}
      />

      {/* Content */}
      <scroll style={styles.scroll}>
        <layout style={styles.content}>
          {/* Basic Input & Content Types */}
          <DemoSection
            title="Content Types"
            description="Different input types display appropriate keyboards and behaviors"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Plain text */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Name (default)"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.name}
                    placeholder="Enter your name"
                    placeholderColor={Colors.textTertiary}
                    contentType="default"
                    onChange={(e) => this.setState({ name: e.text })}
                  />
                </layout>

                {/* Email */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Email"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.email}
                    placeholder="email@example.com"
                    placeholderColor={Colors.textTertiary}
                    contentType="email"
                    autocapitalization="none"
                    onChange={(e) => this.setState({ email: e.text })}
                  />
                </layout>

                {/* Phone */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Phone Number"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.phone}
                    placeholder="(555) 123-4567"
                    placeholderColor={Colors.textTertiary}
                    contentType="phoneNumber"
                    onChange={(e) => this.setState({ phone: e.text })}
                  />
                </layout>

                {/* Password */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Password"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.password}
                    placeholder="Enter password"
                    placeholderColor={Colors.textTertiary}
                    contentType="password"
                    onChange={(e) => this.setState({ password: e.text })}
                  />
                </layout>

                {/* URL */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Website"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.website}
                    placeholder="https://example.com"
                    placeholderColor={Colors.textTertiary}
                    contentType="url"
                    autocapitalization="none"
                    onChange={(e) => this.setState({ website: e.text })}
                  />
                </layout>

                {/* Number */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Age"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.age}
                    placeholder="25"
                    placeholderColor={Colors.textTertiary}
                    contentType="number"
                    onChange={(e) => this.setState({ age: e.text })}
                  />
                </layout>

                {/* Multi-line */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Bio (multi-line)"
                    marginBottom={Spacing.xs}
                  />
                  <textview
                    style={styles.textarea}
                    value={this.state.bio}
                    placeholder="Tell us about yourself..."
                    placeholderColor={Colors.textTertiary}
                    returnType="linereturn"
                    onChange={(e) => this.setState({ bio: e.text })}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Input Validation */}
          <DemoSection
            title="Input Validation"
            description="Real-time validation with error messages and success indicators"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Email with validation */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Email Address"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={this.getValidationInputStyle('validationEmail')}
                    value={this.state.validationEmail}
                    placeholder="email@example.com"
                    placeholderColor={Colors.textTertiary}
                    contentType="email"
                    autocapitalization="none"
                    onChange={(e) => this.handleEmailValidation(e.text)}
                  />
                  {this.state.validationEmailError && (
                    <label
                      font={Fonts.caption}
                      color={Colors.error}
                      value={this.state.validationEmailError}
                      marginTop={Spacing.xs}
                    />
                  )}
                  {this.state.validationEmailValid && !this.state.validationEmailError && (
                    <label
                      font={Fonts.caption}
                      color={Colors.success}
                      value="✓ Valid email address"
                      marginTop={Spacing.xs}
                    />
                  )}
                </layout>

                {/* Phone with pre-validation (onWillChange simulation) */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Phone Number (auto-formatted)"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={this.getValidationInputStyle('validationPhone')}
                    value={this.state.validationPhone}
                    placeholder="(555) 123-4567"
                    placeholderColor={Colors.textTertiary}
                    contentType="phoneNumber"
                    onChange={(e) => this.handlePhoneChange(e.text)}
                  />
                  {this.state.validationPhoneError && (
                    <label
                      font={Fonts.caption}
                      color={Colors.error}
                      value={this.state.validationPhoneError}
                      marginTop={Spacing.xs}
                    />
                  )}
                  <label
                    font={Fonts.caption}
                    color={Colors.textSecondary}
                    value="Phone number will be auto-formatted"
                    marginTop={Spacing.xs}
                  />
                </layout>

                {/* Username with multiple rules */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Username"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={this.getValidationInputStyle('username')}
                    value={this.state.username}
                    placeholder="john_doe123"
                    placeholderColor={Colors.textTertiary}
                    characterLimit={20}
                    autocapitalization="none"
                    onChange={(e) => this.handleUsernameChange(e.text)}
                  />
                  {this.state.usernameError && (
                    <label
                      font={Fonts.caption}
                      color={Colors.error}
                      value={this.state.usernameError}
                      marginTop={Spacing.xs}
                    />
                  )}
                  <label
                    font={Fonts.caption}
                    color={Colors.textSecondary}
                    value={`${this.state.username.length}/20 characters`}
                    marginTop={Spacing.xs}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Keyboard Management */}
          <DemoSection
            title="Keyboard Management"
            description="Different return key types and focus management between fields"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* First Name - Next */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="First Name (Return: Next)"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.firstName}
                    placeholder="John"
                    placeholderColor={Colors.textTertiary}
                    returnType="next"
                    onChange={(e) => this.setState({ firstName: e.text })}
                    onEditBegin={() => this.setState({ currentFocus: 'First Name' })}
                    onReturn={() => this.handleReturnKey('firstName')}
                  />
                </layout>

                {/* Last Name - Next */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Last Name (Return: Next)"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.lastName}
                    placeholder="Doe"
                    placeholderColor={Colors.textTertiary}
                    returnType="next"
                    onChange={(e) => this.setState({ lastName: e.text })}
                    onEditBegin={() => this.setState({ currentFocus: 'Last Name' })}
                    onReturn={() => this.handleReturnKey('lastName')}
                  />
                </layout>

                {/* Email - Done */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Email (Return: Done)"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.userEmail}
                    placeholder="john@example.com"
                    placeholderColor={Colors.textTertiary}
                    contentType="email"
                    returnType="done"
                    autocapitalization="none"
                    onChange={(e) => this.setState({ userEmail: e.text })}
                    onEditBegin={() => this.setState({ currentFocus: 'Email' })}
                    onReturn={() => this.handleReturnKey('userEmail')}
                  />
                </layout>

                {/* Search - Search */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Search (Return: Search)"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.searchQuery}
                    placeholder="Search..."
                    placeholderColor={Colors.textTertiary}
                    returnType="search"
                    onChange={(e) => this.setState({ searchQuery: e.text })}
                    onEditBegin={() => this.setState({ currentFocus: 'Search' })}
                    onReturn={() => this.handleSearch()}
                  />
                </layout>

                {this.state.currentFocus && (
                  <view
                    backgroundColor={Colors.gray100}
                    borderRadius={BorderRadius.sm}
                    padding={Spacing.sm}
                    width="100%"
                  >
                    <label
                      font={Fonts.caption}
                      color={Colors.textSecondary}
                      value={`Currently editing: ${this.state.currentFocus}`}
                    />
                  </view>
                )}
              </layout>
            </Card>
          </DemoSection>

          {/* Complete Registration Form */}
          <DemoSection
            title="Complete Registration Form"
            description="Multi-field form with validation, submission, and error handling"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* First Name */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="First Name *"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={this.getFormInputStyle('formFirstName')}
                    value={this.state.formFirstName}
                    placeholder="John"
                    placeholderColor={Colors.textTertiary}
                    returnType="next"
                    onChange={(e) => this.setState({ formFirstName: e.text })}
                  />
                  {this.state.formErrors.formFirstName && (
                    <label
                      font={Fonts.caption}
                      color={Colors.error}
                      value={this.state.formErrors.formFirstName}
                      marginTop={Spacing.xs}
                    />
                  )}
                </layout>

                {/* Last Name */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Last Name *"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={this.getFormInputStyle('formLastName')}
                    value={this.state.formLastName}
                    placeholder="Doe"
                    placeholderColor={Colors.textTertiary}
                    returnType="next"
                    onChange={(e) => this.setState({ formLastName: e.text })}
                  />
                  {this.state.formErrors.formLastName && (
                    <label
                      font={Fonts.caption}
                      color={Colors.error}
                      value={this.state.formErrors.formLastName}
                      marginTop={Spacing.xs}
                    />
                  )}
                </layout>

                {/* Email */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Email *"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={this.getFormInputStyle('formEmail')}
                    value={this.state.formEmail}
                    placeholder="john@example.com"
                    placeholderColor={Colors.textTertiary}
                    contentType="email"
                    autocapitalization="none"
                    returnType="next"
                    onChange={(e) => this.setState({ formEmail: e.text })}
                  />
                  {this.state.formErrors.formEmail && (
                    <label
                      font={Fonts.caption}
                      color={Colors.error}
                      value={this.state.formErrors.formEmail}
                      marginTop={Spacing.xs}
                    />
                  )}
                </layout>

                {/* Phone (optional) */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Phone (optional)"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={styles.input}
                    value={this.state.formPhone}
                    placeholder="(555) 123-4567"
                    placeholderColor={Colors.textTertiary}
                    contentType="phoneNumber"
                    returnType="next"
                    onChange={(e) => this.setState({ formPhone: e.text })}
                  />
                </layout>

                {/* Password */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Password *"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={this.getFormInputStyle('formPassword')}
                    value={this.state.formPassword}
                    placeholder="Minimum 8 characters"
                    placeholderColor={Colors.textTertiary}
                    contentType="password"
                    returnType="next"
                    onChange={(e) => this.setState({ formPassword: e.text })}
                  />
                  {this.state.formErrors.formPassword && (
                    <label
                      font={Fonts.caption}
                      color={Colors.error}
                      value={this.state.formErrors.formPassword}
                      marginTop={Spacing.xs}
                    />
                  )}
                </layout>

                {/* Confirm Password */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Confirm Password *"
                    marginBottom={Spacing.xs}
                  />
                  <textfield
                    style={this.getFormInputStyle('formConfirmPassword')}
                    value={this.state.formConfirmPassword}
                    placeholder="Re-enter password"
                    placeholderColor={Colors.textTertiary}
                    contentType="password"
                    returnType="next"
                    onChange={(e) => this.setState({ formConfirmPassword: e.text })}
                  />
                  {this.state.formErrors.formConfirmPassword && (
                    <label
                      font={Fonts.caption}
                      color={Colors.error}
                      value={this.state.formErrors.formConfirmPassword}
                      marginTop={Spacing.xs}
                    />
                  )}
                </layout>

                {/* Comments */}
                <layout width="100%">
                  <label
                    font={Fonts.labelSmall}
                    color={Colors.textSecondary}
                    value="Comments (optional)"
                    marginBottom={Spacing.xs}
                  />
                  <textview
                    style={styles.textarea}
                    value={this.state.formComments}
                    placeholder="Any additional comments..."
                    placeholderColor={Colors.textTertiary}
                    returnType="linereturn"
                    onChange={(e) => this.setState({ formComments: e.text })}
                  />
                </layout>

                {/* Submit Error */}
                {this.state.submitError && (
                  <view
                    backgroundColor={Colors.error + '20'}
                    borderRadius={BorderRadius.sm}
                    padding={Spacing.md}
                    width="100%"
                  >
                    <label
                      font={Fonts.body}
                      color={Colors.error}
                      value={this.state.submitError}
                      numberOfLines={0}
                    />
                  </view>
                )}

                {/* Submit Success */}
                {this.state.submitSuccess && (
                  <view
                    backgroundColor={Colors.success + '20'}
                    borderRadius={BorderRadius.sm}
                    padding={Spacing.md}
                    width="100%"
                  >
                    <label
                      font={Fonts.body}
                      color={Colors.success}
                      value="✓ Registration successful!"
                    />
                  </view>
                )}

                {/* Submit Button */}
                <Button
                  title={this.state.isSubmitting ? 'Submitting...' : 'Register'}
                  variant="primary"
                  disabled={this.state.isSubmitting}
                  fullWidth={true}
                  onTap={() => this.submitForm()}
                />

                {/* Reset Button */}
                <Button
                  title="Reset Form"
                  variant="outline"
                  fullWidth={true}
                  onTap={() => this.resetForm()}
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Code Example */}
          <DemoSection title="Code Example">
            <CodeBlock
              language="tsx"
              code={`// Email validation with TextField
const [email, setEmail] = useState('');
const [error, setError] = useState('');

const validateEmail = (value: string) => {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!regex.test(value)) {
    setError('Invalid email format');
  } else {
    setError('');
  }
};

<textfield
  value={email}
  placeholder="email@example.com"
  contentType="email"
  onChange={(e) => {
    setEmail(e.text);
    validateEmail(e.text);
  }}
/>

// Multi-line TextArea
<textview
  placeholder="Comments..."
  returnType="linereturn"
  onChange={(e) => setComments(e.text)}
/>`}
            />
          </DemoSection>
        </layout>
      </scroll>
    </view>;
  }

  // Validation Methods

  private validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email) {
      return { valid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
  }

  private handleEmailValidation(value: string) {
    const validation = this.validateEmail(value);

    this.setState({
      validationEmail: value,
      validationEmailValid: validation.valid,
      validationEmailError: validation.error,
    });
  }

  private formatPhoneNumber(value: string): string {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Format based on length
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  }

  private handlePhoneChange(value: string) {
    const formatted = this.formatPhoneNumber(value);
    const digits = value.replace(/\D/g, '');

    let error: string | undefined;
    if (digits.length > 0 && digits.length !== 10) {
      error = 'Phone must be 10 digits';
    }

    this.setState({
      validationPhone: formatted,
      validationPhoneError: error,
    });
  }

  private validateUsername(username: string): { valid: boolean; error?: string } {
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
      return { valid: false, error: 'Only letters, numbers, and underscores allowed' };
    }

    return { valid: true };
  }

  private handleUsernameChange(value: string) {
    const validation = this.validateUsername(value);

    this.setState({
      username: value,
      usernameError: validation.error,
    });
  }

  // Keyboard Management Methods

  private handleReturnKey(fieldName: string) {
    // This demonstrates return key behavior
    // In a real implementation, you might want to focus the next field
    console.log(`Return pressed on ${fieldName}`);
  }

  private handleSearch() {
    console.log(`Searching for: ${this.state.searchQuery}`);
    // Perform search
  }

  // Form Submission Methods

  private validateForm(): { valid: boolean; errors: { [key: string]: string } } {
    const errors: { [key: string]: string } = {};

    if (!this.state.formFirstName.trim()) {
      errors.formFirstName = 'First name is required';
    }

    if (!this.state.formLastName.trim()) {
      errors.formLastName = 'Last name is required';
    }

    const emailValidation = this.validateEmail(this.state.formEmail);
    if (!emailValidation.valid && emailValidation.error) {
      errors.formEmail = emailValidation.error;
    }

    if (!this.state.formPassword) {
      errors.formPassword = 'Password is required';
    } else if (this.state.formPassword.length < 8) {
      errors.formPassword = 'Password must be at least 8 characters';
    }

    if (this.state.formPassword !== this.state.formConfirmPassword) {
      errors.formConfirmPassword = 'Passwords do not match';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private async submitForm() {
    const validation = this.validateForm();

    if (!validation.valid) {
      this.setState({ formErrors: validation.errors });
      return;
    }

    this.setState({ isSubmitting: true, submitError: undefined, formErrors: {} });

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
      formFirstName: '',
      formLastName: '',
      formEmail: '',
      formPhone: '',
      formPassword: '',
      formConfirmPassword: '',
      formComments: '',
      formErrors: {},
      submitSuccess: false,
      submitError: undefined,
    });
  }

  // Style Helper Methods

  private getValidationInputStyle(field: string): Style<TextField> {
    let borderColor = Colors.border;

    if (field === 'validationEmail') {
      if (this.state.validationEmailError) {
        borderColor = Colors.error;
      } else if (this.state.validationEmailValid) {
        borderColor = Colors.success;
      }
    } else if (field === 'validationPhone') {
      if (this.state.validationPhoneError) {
        borderColor = Colors.error;
      }
    } else if (field === 'username') {
      if (this.state.usernameError) {
        borderColor = Colors.error;
      }
    }

    return new Style<TextField>({
      width: '100%',
      height: 44,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: BorderRadius.sm,
      paddingLeft: Spacing.md,
      paddingRight: Spacing.md,
      font: Fonts.body,
      color: Colors.textPrimary,
    });
  }

  private getFormInputStyle(field: string): Style<TextField> {
    const hasError = this.state.formErrors[field];
    const borderColor = hasError ? Colors.error : Colors.border;

    return new Style<TextField>({
      width: '100%',
      height: 44,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: BorderRadius.sm,
      paddingLeft: Spacing.md,
      paddingRight: Spacing.md,
      font: Fonts.body,
      color: Colors.textPrimary,
    });
  }
}

const styles = {
  page: new Style<View>({
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  }),

  scroll: new Style<ScrollView>({
    width: '100%',
    flex: 1,
  }),

  content: new Style<Layout>({
    width: '100%',
    padding: Spacing.base,
  }),

  input: new Style<TextField>({
    width: '100%',
    height: 44,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,
    font: Fonts.body,
    color: Colors.textPrimary,
  }),

  textarea: new Style<TextView>({
    width: '100%',
    height: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    font: Fonts.body,
    color: Colors.textPrimary,
    textGravity: 'top',
  }),
};
