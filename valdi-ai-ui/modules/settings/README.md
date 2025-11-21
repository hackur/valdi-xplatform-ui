# Settings Module

The Settings module provides a comprehensive settings screen for the Valdi AI application, allowing users to configure AI providers, manage API keys, and customize app preferences.

## Features

### 1. AI Provider Selection
- Support for multiple AI providers:
  - **OpenAI** (GPT-4, GPT-3.5)
  - **Anthropic** (Claude 3 Opus, Sonnet, Haiku)
  - **Google AI** (Gemini Pro, Gemini Pro Vision)
- Visual selection with provider cards
- Active provider highlighting

### 2. API Key Management
- Secure input fields for API keys
- Show/hide toggle for sensitive data
- Format validation for each provider
- Individual key clearing
- Masked display in UI

### 3. Model Selection
- Default model configuration per provider
- Dropdown selection with latest models
- Provider-specific model lists

### 4. App Preferences
- **Dark Mode**: Toggle dark theme
- **Notifications**: Enable/disable push notifications
- **Sound Effects**: Control audio feedback

### 5. About Section
- App version information
- Description and features
- Links to GitHub, documentation, and license

## Components

### SettingsScreen
Main settings screen component with all configuration options.

**Usage:**
```tsx
import { SettingsScreen } from '@settings';

<SettingsScreen navigationController={navigationController} />
```

### ApiKeyStore
Secure storage manager for API keys.

**Features:**
- Validates API key format before storage
- Provides masked display for UI
- Supports import/export of configuration
- Singleton pattern for consistent access

**Usage:**
```typescript
import { ApiKeyStore, getApiKeyStore } from '@settings';

// Get singleton instance
const store = getApiKeyStore();

// Store API key
await store.setApiKey('openai', 'sk-...');

// Retrieve API key
const key = await store.getApiKey('openai');

// Validate key
const isValid = store.validateKey('openai', 'sk-...');

// Clear key
await store.clearApiKey('openai');
```

### UI Components

#### TextInput
Styled text input with secure entry support.

```tsx
<TextInput
  value={apiKey}
  placeholder="sk-..."
  secureTextEntry={true}
  onChangeText={(text) => setApiKey(text)}
/>
```

#### Switch
Toggle switch for boolean settings.

```tsx
<Switch
  value={darkMode}
  onValueChange={(value) => setDarkMode(value)}
/>
```

#### Dropdown
Select component for choosing from options.

```tsx
<Dropdown
  options={[
    { label: 'GPT-4', value: 'gpt-4' },
    { label: 'GPT-3.5', value: 'gpt-3.5-turbo' },
  ]}
  selectedValue={selectedModel}
  onValueChange={(value) => setSelectedModel(value)}
/>
```

## API Key Validation

The module validates API key formats for each provider:

### OpenAI
- Pattern: `sk-[a-zA-Z0-9]{48,}`
- Example: `sk-proj-abc123...`

### Anthropic
- Pattern: `sk-ant-[a-zA-Z0-9\-_]{95,}`
- Example: `sk-ant-api03-abc123...`

### Google AI
- Pattern: `AIza[a-zA-Z0-9_\-]{35}`
- Example: `AIzaSyAbc123...`

## Storage

API keys are stored securely using browser localStorage (in development). In production, this should be replaced with:
- **Mobile**: Secure keychain (iOS) or KeyStore (Android)
- **Desktop**: OS-specific credential storage
- **Web**: Encrypted storage or secure backend

## Security Considerations

1. **Never log API keys** - The module uses console.log for debugging but never logs actual key values
2. **Validate before storing** - All keys are validated against provider-specific patterns
3. **Masked display** - Keys are shown as masked in the UI
4. **Secure storage** - Replace localStorage with platform-specific secure storage in production
5. **Clear on logout** - Implement key clearing when users log out

## Integration

To integrate the Settings module into your app:

1. **Add to navigation:**
```tsx
import { SettingsScreen } from '@settings';

navigationController.push(SettingsScreen, {
  navigationController,
});
```

2. **Use API keys in chat:**
```typescript
import { getApiKeyStore } from '@settings';

const store = getApiKeyStore();
const openAiKey = await store.getApiKey('openai');

// Use key with AI SDK
const response = await generateText({
  model: openai('gpt-4'),
  apiKey: openAiKey,
  prompt: 'Hello!',
});
```

3. **Access preferences:**
```typescript
// Store preferences alongside API keys
// or use a separate PreferencesStore
```

## File Structure

```
settings/
├── BUILD.bazel              # Bazel build configuration
├── README.md                # This file
└── src/
    ├── index.ts             # Main export
    ├── SettingsScreen.tsx   # Main settings UI
    ├── ApiKeyStore.ts       # Secure key storage
    └── components/
        ├── index.ts         # Component exports
        ├── TextInput.tsx    # Text input component
        ├── Switch.tsx       # Toggle switch component
        └── Dropdown.tsx     # Select dropdown component
```

## Dependencies

- `@valdi/valdi_core` - Core Valdi framework
- `@valdi/valdi_tsx` - TSX support
- `@valdi/valdi_navigation` - Navigation utilities
- `@common` - Shared components and theme

## Future Enhancements

- [ ] Advanced model parameters (temperature, max tokens)
- [ ] API usage tracking and quotas
- [ ] Multiple API keys per provider (for rotation)
- [ ] Encrypted export/import of settings
- [ ] Cloud sync for settings across devices
- [ ] Model performance benchmarking
- [ ] Cost estimation per provider
- [ ] Custom endpoint configuration
- [ ] Proxy settings for corporate networks
- [ ] Advanced security options (2FA, biometric auth)
