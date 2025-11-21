# Settings Module - Usage Examples

This document provides practical examples for using the Settings module in the Valdi AI application.

## Basic Setup

### 1. Navigate to Settings Screen

```tsx
import { SettingsScreen } from '@settings';
import { NavigationController } from '@valdi/valdi_navigation';

// In your navigation setup
const navigateToSettings = () => {
  navigationController.push(SettingsScreen, {
    navigationController,
  });
};
```

## API Key Management

### 2. Store an API Key

```typescript
import { getApiKeyStore } from '@settings';

const store = getApiKeyStore();

// Store OpenAI key
try {
  await store.setApiKey('openai', 'sk-proj-abc123...');
  console.log('API key saved successfully');
} catch (error) {
  console.error('Invalid API key format:', error);
}
```

### 3. Retrieve an API Key

```typescript
import { getApiKeyStore } from '@settings';

const store = getApiKeyStore();

// Get OpenAI key
const openAiKey = await store.getApiKey('openai');

if (openAiKey) {
  // Use the key
  console.log('Key found:', store.getMaskedKey(openAiKey));
} else {
  console.log('No API key stored for OpenAI');
}
```

### 4. Validate API Key Format

```typescript
import { getApiKeyStore } from '@settings';

const store = getApiKeyStore();

// Validate before storing
const userInputKey = 'sk-proj-abc123...';
const isValid = store.validateKey('openai', userInputKey);

if (isValid) {
  await store.setApiKey('openai', userInputKey);
} else {
  alert('Invalid API key format');
}
```

### 5. Clear API Keys

```typescript
import { getApiKeyStore } from '@settings';

const store = getApiKeyStore();

// Clear a specific provider's key
await store.clearApiKey('openai');

// Clear all keys
await store.clearAllKeys();
```

## Integration with AI SDK

### 6. Use API Keys in Chat

```typescript
import { getApiKeyStore } from '@settings';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function sendMessage(prompt: string) {
  const store = getApiKeyStore();

  // Get the stored API key
  const apiKey = await store.getApiKey('openai');

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Use with AI SDK
  const response = await generateText({
    model: openai('gpt-4-turbo-preview'),
    apiKey: apiKey,
    prompt: prompt,
  });

  return response.text;
}
```

### 7. Multi-Provider Support

```typescript
import { getApiKeyStore, AIProvider } from '@settings';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

async function sendMessageWithProvider(
  prompt: string,
  provider: AIProvider,
  model: string
) {
  const store = getApiKeyStore();
  const apiKey = await store.getApiKey(provider);

  if (!apiKey) {
    throw new Error(`${provider} API key not configured`);
  }

  let modelProvider;
  switch (provider) {
    case 'openai':
      modelProvider = openai(model);
      break;
    case 'anthropic':
      modelProvider = anthropic(model);
      break;
    case 'google':
      modelProvider = google(model);
      break;
  }

  const response = await generateText({
    model: modelProvider,
    apiKey: apiKey,
    prompt: prompt,
  });

  return response.text;
}

// Usage
const response = await sendMessageWithProvider(
  'Hello!',
  'anthropic',
  'claude-3-opus-20240229'
);
```

## Custom Components Usage

### 8. Using TextInput Component

```tsx
import { TextInput } from '@settings';
import { useState } from 'react';

function MyForm() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  return (
    <view>
      <TextInput
        value={apiKey}
        placeholder="Enter your API key"
        secureTextEntry={!showKey}
        onChangeText={setApiKey}
      />

      <button onClick={() => setShowKey(!showKey)}>
        {showKey ? 'Hide' : 'Show'} Key
      </button>
    </view>
  );
}
```

### 9. Using Switch Component

```tsx
import { Switch } from '@settings';
import { useState } from 'react';

function PreferencesSection() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <view>
      <view style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <label>Dark Mode</label>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </view>

      <view style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <label>Notifications</label>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
        />
      </view>
    </view>
  );
}
```

### 10. Using Dropdown Component

```tsx
import { Dropdown } from '@settings';
import { useState } from 'react';

function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  const models = [
    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
    { label: 'GPT-4', value: 'gpt-4' },
    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  ];

  return (
    <view>
      <label>Select Model</label>
      <Dropdown
        options={models}
        selectedValue={selectedModel}
        onValueChange={setSelectedModel}
      />
    </view>
  );
}
```

## Advanced Features

### 11. Export/Import Configuration

```typescript
import { getApiKeyStore } from '@settings';

// Export all API keys (use with caution!)
async function exportSettings() {
  const store = getApiKeyStore();
  const config = await store.exportConfig();

  // Save to file or cloud
  const json = JSON.stringify(config, null, 2);
  console.log('Exported config:', json);

  return config;
}

// Import API keys
async function importSettings(config: Record<string, string>) {
  const store = getApiKeyStore();
  await store.importConfig(config);
  console.log('Settings imported successfully');
}
```

### 12. Check if Keys are Configured

```typescript
import { getApiKeyStore } from '@settings';

async function getAvailableProviders() {
  const store = getApiKeyStore();

  const providers = ['openai', 'anthropic', 'google'] as const;
  const available = [];

  for (const provider of providers) {
    const hasKey = await store.hasApiKey(provider);
    if (hasKey) {
      available.push(provider);
    }
  }

  return available;
}

// Usage
const available = await getAvailableProviders();
console.log('Available providers:', available);
// Output: ['openai', 'anthropic']
```

### 13. Display Masked Keys in UI

```typescript
import { getApiKeyStore } from '@settings';

async function displayApiKey(provider: AIProvider) {
  const store = getApiKeyStore();
  const key = await store.getApiKey(provider);

  if (key) {
    const masked = store.getMaskedKey(key);
    console.log(`${provider} key: ${masked}`);
    // Output: "sk-p••••••••••••••••••3xyz"
  }
}
```

## Error Handling

### 14. Handling Invalid Keys

```typescript
import { getApiKeyStore } from '@settings';

async function saveApiKeyWithValidation(
  provider: AIProvider,
  key: string
) {
  const store = getApiKeyStore();

  try {
    // setApiKey validates format internally
    await store.setApiKey(provider, key);
    return { success: true, message: 'API key saved successfully' };
  } catch (error) {
    return {
      success: false,
      message: `Invalid ${provider} API key format`,
    };
  }
}

// Usage
const result = await saveApiKeyWithValidation('openai', 'invalid-key');
if (!result.success) {
  alert(result.message);
}
```

### 15. Pre-flight Validation

```typescript
import { getApiKeyStore } from '@settings';

function validateBeforeSave(provider: AIProvider, key: string) {
  const store = getApiKeyStore();

  // Check format
  if (!store.validateKey(provider, key)) {
    return {
      valid: false,
      error: 'Invalid key format',
      hint: getKeyFormatHint(provider),
    };
  }

  // Check length
  if (key.length < 20) {
    return {
      valid: false,
      error: 'Key too short',
    };
  }

  return { valid: true };
}

function getKeyFormatHint(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI keys start with "sk-"';
    case 'anthropic':
      return 'Anthropic keys start with "sk-ant-"';
    case 'google':
      return 'Google keys start with "AIza"';
  }
}
```

## Testing

### 16. Mock API Key Store for Tests

```typescript
// In your test file
class MockApiKeyStore {
  private keys = new Map<string, string>();

  async getApiKey(provider: string): Promise<string | null> {
    return this.keys.get(provider) || null;
  }

  async setApiKey(provider: string, key: string): Promise<void> {
    this.keys.set(provider, key);
  }

  async clearApiKey(provider: string): Promise<void> {
    this.keys.delete(provider);
  }

  validateKey(provider: string, key: string): boolean {
    return key.length > 10;
  }
}

// Use in tests
const mockStore = new MockApiKeyStore();
await mockStore.setApiKey('openai', 'sk-test-key');
```

## Best Practices

1. **Always validate** keys before storing them
2. **Never log** actual API key values
3. **Use masked display** when showing keys in UI
4. **Clear keys** on logout or when switching accounts
5. **Handle errors** gracefully with user-friendly messages
6. **Secure storage** - Replace localStorage in production
7. **Test all providers** to ensure compatibility
8. **Document key formats** for users
9. **Implement rate limiting** to prevent excessive validation attempts
10. **Monitor key usage** to detect potential security issues
