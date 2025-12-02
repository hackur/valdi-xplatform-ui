# Custom Provider Integration Guide

This guide covers how to integrate custom AI providers with the Valdi AI UI application. You can connect to any OpenAI-compatible API, including local LLM servers, alternative AI providers, and enterprise solutions.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Supported Provider Types](#supported-provider-types)
3. [LM Studio Setup (Primary Focus)](#lm-studio-setup-primary-focus)
4. [Ollama Setup](#ollama-setup)
5. [Generic OpenAI-Compatible API](#generic-openai-compatible-api)
6. [Configuration Reference](#configuration-reference)
7. [Provider Testing](#provider-testing)
8. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Quick Start

Here's the fastest way to get a custom provider working:

### 1. Start Your Provider

Choose your provider and follow the setup instructions below:

- **Local LLM**: [LM Studio](#lm-studio-setup-primary-focus) or [Ollama](#ollama-setup)
- **Cloud Provider**: Follow their setup docs, get your API endpoint and key
- **Custom OpenAI Clone**: Use any endpoint implementing OpenAI's API

### 2. Add Provider in App

1. Open the app and navigate to **Settings** > **Add Custom Provider**
2. Fill in the form:
   - **Provider Name**: Friendly name (e.g., "My LM Studio")
   - **Base URL**: Your API endpoint (e.g., `http://localhost:1234/v1`)
   - **Model ID**: The model identifier (e.g., `mistral-7b-instruct`)
   - **API Key**: Leave blank for local providers, add if required
3. Click **Test Connection** to verify
4. Click **Add Provider** to save

### 3. Use Your Provider

1. Navigate to **Chat**
2. In the top-right, select your custom provider from the model dropdown
3. Start chatting!

---

## Supported Provider Types

The Valdi AI UI supports the following provider types:

| Provider | Type | URL Pattern | Requires API Key | Notes |
|----------|------|-------------|------------------|-------|
| **LM Studio** | Custom (OpenAI-compatible) | `http://localhost:1234/v1` | No | Local, free, runs on CPU/GPU |
| **Ollama** | Custom (OpenAI-compatible) | `http://localhost:11434/v1` | No | Local, optimized for speed |
| **Azure OpenAI** | Custom (OpenAI-compatible) | `https://<name>.openai.azure.com/v1` | Yes | Enterprise Azure integration |
| **OpenRouter** | Custom (OpenAI-compatible) | `https://openrouter.ai/api/v1` | Yes | Unified API for multiple models |
| **Groq** | Custom (OpenAI-compatible) | `https://api.groq.com/openai/v1` | Yes | Ultra-fast inference |
| **Any OpenAI Clone** | Custom (OpenAI-compatible) | Your endpoint `/v1` | Varies | SelfhostedAI, LocalAI, vLLM, etc. |

---

## LM Studio Setup (Primary Focus)

LM Studio is a user-friendly desktop application for running local language models. It's perfect for development, testing, and privacy-conscious use cases.

### Prerequisites

- macOS, Linux, or Windows
- 8GB RAM minimum (16GB+ recommended)
- 10-20GB disk space for models
- GPU recommended (NVIDIA/AMD/Metal) but CPU works too

### Installation

1. **Download LM Studio**
   - Visit https://lmstudio.ai/
   - Download for your OS
   - Install following the installer prompts

2. **First Launch**
   - Open LM Studio
   - Accept any initialization prompts
   - Wait for the initial setup to complete

### Loading a Model

1. **Navigate to Model Library**
   - Click the **Home** tab (house icon) at bottom-left
   - You'll see the Model Library

2. **Search for a Model**
   - Common recommended models:
     - `Mistral 7B Instruct` - Good balance of quality and speed
     - `Llama 2 7B Chat` - Familiar, well-tested
     - `Neural Chat 7B` - Optimized for conversation
     - `Orca Mini 3B` - Lightweight, good for testing

3. **Download the Model**
   - Click the model name
   - Click the download button (down arrow icon)
   - Wait for download to complete (this can take 5-30 minutes)
   - Model will appear in your Downloads section

### Starting the Local Server

1. **Open Developer Tab**
   - Click the **Developer** tab (code icon) at bottom-left
   - You'll see the Local Server section

2. **Load a Model**
   - Scroll up to see "Select a model to load"
   - Click the dropdown and select your downloaded model
   - Click **Load Model** button
   - Wait for "Model loaded successfully" message
   - This typically takes 10-60 seconds

3. **Start Server**
   - Once the model is loaded, click **Start Server**
   - You should see: `Server is listening on http://localhost:1234`
   - The server will remain running while LM Studio is open

### Configuration in Valdi AI UI

1. **Add Custom Provider**
   - Open Valdi AI UI Settings
   - Tap **Add Custom Provider**

2. **Fill in Details**
   - **Provider Name**: `LM Studio` (or custom name)
   - **Base URL**: `http://localhost:1234/v1`
   - **API Key**: Leave empty
   - **Model ID**: Use the exact model name (e.g., `mistral-7b-instruct`)
     - Check the Developer tab in LM Studio to confirm the exact model ID

3. **Test Connection**
   - Tap **Test Connection**
   - Should see green checkmark with response time
   - If fails, verify:
     - LM Studio server is running (check Developer tab)
     - Model is loaded (green checkmark on model)
     - URL is correct: `http://localhost:1234/v1`

4. **Save Provider**
   - Tap **Add Provider**
   - Provider is now available in chat model selector

### Testing with Scripts

The project includes a comprehensive test script for LM Studio:

```bash
# Basic test (requires server running)
./scripts/test-lm-studio.sh

# Verbose output (shows all API responses)
VERBOSE=1 ./scripts/test-lm-studio.sh

# Test against different server URL
LM_STUDIO_URL=http://192.168.1.100:1234 ./scripts/test-lm-studio.sh
```

**Test Coverage:**
- Health check (server is responding)
- Models endpoint (can list available models)
- Chat completions (basic generation)
- Streaming support (real-time response)
- System prompt support
- Temperature parameter handling
- Error handling and edge cases

Example successful test output:
```
╔════════════════════════════════════════════════════════════╗
║              LM Studio API Test Suite                      ║
╚════════════════════════════════════════════════════════════╝

ℹ Server URL: http://localhost:1234
ℹ Timeout: 10s

✓ LM Studio server is running

Test 1: /v1/models Endpoint
→ Fetching available models
✓ Received models list response
ℹ Total models available: 1
ℹ First model: mistral-7b-instruct

... [more tests] ...

╔════════════════════════════════════════════════════════════╗
║                    ALL TESTS PASSED!                       ║
╚════════════════════════════════════════════════════════════╝

Tests Run:    7
Tests Passed: 7
Tests Failed: 0
```

### Using with Dev Script

The `dev.sh` script includes a shortcut for LM Studio testing:

```bash
# Test LM Studio integration
./dev.sh test:lm

# Run all validations and test LM Studio
./dev.sh check
```

### Troubleshooting LM Studio Connection

**Issue: "Connection refused" or "Unable to connect"**
- Verify LM Studio is running and Developer server is started
- Check no other app is using port 1234
- Try accessing `http://localhost:1234` in your browser
- On mobile/emulator, use your computer's IP: `http://192.168.x.x:1234`

**Issue: "Model not found" error**
- Check exact model ID in Developer tab
- Model IDs are case-sensitive
- Model must be fully loaded (green checkmark) before using

**Issue: Slow responses**
- Models run slower on CPU; GPU acceleration recommended
- Reduce max output tokens to get faster responses
- Check computer isn't under heavy load

**Issue: "Maximum context length exceeded"**
- Lower the `maxContextTokens` setting
- Shorten conversation history
- Or use a larger model variant

---

## Ollama Setup

Ollama is another popular option for running local models, known for speed and ease of use.

### Installation

1. **Download Ollama**
   - Visit https://ollama.ai/
   - Download for your OS
   - Install following the installer

2. **Verify Installation**
   ```bash
   ollama --version
   ```

### Running Ollama

1. **Start Ollama Service**
   - macOS/Linux: `ollama serve` in terminal
   - Windows: Ollama runs as background service automatically
   - You'll see: `Listening on 127.0.0.1:11434`

2. **Pull a Model** (in new terminal)
   ```bash
   # Quick model for testing
   ollama pull mistral

   # Or other popular options
   ollama pull llama2
   ollama pull neural-chat
   ```

### Configuration in Valdi AI UI

1. **Add Custom Provider**
   - Open Settings
   - Tap **Add Custom Provider**

2. **Fill in Details**
   - **Provider Name**: `Ollama`
   - **Base URL**: `http://localhost:11434/v1`
   - **API Key**: Leave empty
   - **Model ID**: `mistral` (or whichever you pulled)

3. **Test & Save**
   - Test connection
   - Save provider

### Differences from LM Studio

| Aspect | LM Studio | Ollama |
|--------|-----------|--------|
| **UI** | GUI interface | CLI only |
| **Setup** | Simpler for beginners | More command-line oriented |
| **Performance** | Generally faster | Optimized for speed |
| **Model Management** | Download in UI | Pull via CLI |
| **Port** | 1234 | 11434 |
| **Best For** | User-friendly, learning | Production, automation |

---

## Generic OpenAI-Compatible API

Any endpoint that implements OpenAI's API specification works. Here are examples:

### Azure OpenAI

```
Provider Name: Azure GPT-4
Base URL: https://<your-resource>.openai.azure.com/v1
API Key: <your-azure-api-key>
Model ID: <your-deployment-name>
```

**Notes:**
- Create resource in Azure Portal
- Deploy a model (e.g., GPT-4)
- Get API key from Keys section
- Use deployment name as Model ID
- Azure requires API key

### OpenRouter

```
Provider Name: OpenRouter
Base URL: https://openrouter.ai/api/v1
API Key: <your-openrouter-key>
Model ID: openai/gpt-3.5-turbo
```

**Notes:**
- Sign up at https://openrouter.ai/
- Get API key from dashboard
- See all available models in documentation
- Supports multiple model families

### Groq (Ultra-Fast Inference)

```
Provider Name: Groq
Base URL: https://api.groq.com/openai/v1
API Key: <your-groq-api-key>
Model ID: mixtral-8x7b-32768
```

**Notes:**
- Sign up at https://console.groq.com/
- Known for extremely fast inference
- Good for production use cases
- API key required

### LocalAI / vLLM / Self-Hosted

```
Provider Name: Local vLLM
Base URL: http://your-server:8000/v1
API Key: (optional)
Model ID: auto
```

**Notes:**
- Any server running vLLM, LocalAI, or similar
- Can be on local network or remote server
- Some require bearer token in API Key field
- Verify `/v1/models` endpoint responds

---

## Configuration Reference

This section explains all configuration options for custom providers.

### Required Fields

#### Provider Name
- **Field**: `name`
- **Type**: String
- **Example**: "My LM Studio", "Azure GPT-4"
- **Validation**: Cannot be empty
- **Notes**: User-facing identifier, can be anything

#### Base URL
- **Field**: `baseUrl`
- **Type**: URL string
- **Example**: `http://localhost:1234/v1`
- **Validation**:
  - Must be valid URL format
  - Should include `/v1` path for OpenAI API
  - HTTP allowed for localhost only (warning for remote)
- **Notes**: Everything before `/models` endpoint

#### Model ID
- **Field**: `modelId`
- **Type**: String
- **Example**: `mistral-7b-instruct`, `gpt-4`
- **Validation**: Cannot be empty
- **Notes**: Exact identifier expected by provider's API

### Optional Fields

#### API Key
- **Field**: `apiKey`
- **Type**: String
- **Example**: `sk-...` or `Bearer token`
- **Default**: None (empty)
- **Validation**: No special validation
- **Notes**:
  - Leave empty for local providers (LM Studio, Ollama)
  - Required for cloud providers
  - Will be sent as `Authorization: Bearer <apiKey>` header
  - Never stored in plain text in production

#### Model Display Name
- **Field**: `modelName`
- **Type**: String
- **Example**: "Mistral 7B", "GPT-4 Turbo"
- **Default**: Uses modelId
- **Notes**: Friendly name shown in UI

#### Default Temperature
- **Field**: `defaultTemperature`
- **Type**: Number
- **Range**: 0.0 to 2.0
- **Default**: 0.7
- **Validation**: Must be between 0 and 2
- **Notes**:
  - 0 = deterministic (always same answer)
  - 0.5-1.0 = balanced (recommended)
  - 1.5-2.0 = very creative/random

#### Max Output Tokens
- **Field**: `maxOutputTokens`
- **Type**: Integer
- **Example**: 4096, 8192
- **Default**: 4096
- **Validation**: Must be > 0
- **Notes**: Maximum response length. Check model's max tokens.

#### Max Context Tokens (Context Window)
- **Field**: `maxContextTokens`
- **Type**: Integer
- **Example**: 8192, 128000
- **Default**: 8192
- **Validation**: Must be > 0
- **Notes**: Maximum conversation length model can handle

#### Supports Streaming
- **Field**: `supportsStreaming`
- **Type**: Boolean
- **Default**: true
- **Notes**: Enable for real-time response streaming

#### Supports Function Calling
- **Field**: `supportsFunctionCalling`
- **Type**: Boolean
- **Default**: false
- **Notes**: Enable if provider supports tool/function calling

#### Custom Headers
- **Field**: `headers`
- **Type**: Object (key-value pairs)
- **Example**: `{"X-Custom-Header": "value"}`
- **Notes**: Advanced feature for custom API requirements

### Configuration JSON Example

```json
{
  "id": "custom_provider_1234567890",
  "type": "custom-openai-compatible",
  "name": "My LM Studio",
  "baseUrl": "http://localhost:1234/v1",
  "apiKey": null,
  "modelId": "mistral-7b-instruct",
  "modelName": "Mistral 7B Instruct",
  "defaultTemperature": 0.7,
  "maxOutputTokens": 4096,
  "maxContextTokens": 8192,
  "supportsStreaming": true,
  "supportsFunctionCalling": false,
  "headers": null,
  "isEnabled": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Provider Testing

### Testing via App UI

1. **Add Provider Form**
   - Fill in all required fields
   - Click **Test Connection** button
   - Shows response time and any errors
   - Green checkmark = connected successfully

2. **Manual Test in Chat**
   - Open chat
   - Select your custom provider from dropdown
   - Send a test message
   - Verify response comes back

### Testing via CLI Scripts

**Test LM Studio specifically:**
```bash
./scripts/test-lm-studio.sh

# With verbose output
VERBOSE=1 ./scripts/test-lm-studio.sh

# Against different URL
LM_STUDIO_URL=http://192.168.1.100:1234 ./scripts/test-lm-studio.sh
```

**Test via dev.sh:**
```bash
./dev.sh test:lm
```

### Manual Testing with curl

Test any OpenAI-compatible endpoint:

```bash
# 1. Check if server is running
curl http://localhost:1234/v1/models

# 2. Get list of available models
curl -X GET http://localhost:1234/v1/models \
  -H "Content-Type: application/json"

# 3. Basic completion request
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-7b-instruct",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7,
    "max_tokens": 100
  }'

# 4. Test streaming
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-7b-instruct",
    "messages": [{"role": "user", "content": "Count to 5"}],
    "stream": true,
    "max_tokens": 50
  }'

# 5. Test with API key (if required)
curl -X GET http://api.example.com/v1/models \
  -H "Authorization: Bearer sk-your-api-key-here"
```

### Testing Checklist

Before using a provider in production, verify:

- [ ] **Connectivity**: Server responds to health check
- [ ] **Models Endpoint**: `/v1/models` returns list
- [ ] **Basic Completion**: Can send simple request and get response
- [ ] **Streaming**: Streaming works if enabled
- [ ] **System Prompts**: System role in messages is respected
- [ ] **Response Time**: Acceptable latency for your use case
- [ ] **Error Handling**: Invalid requests return proper errors
- [ ] **Max Tokens**: Model respects maxOutputTokens setting
- [ ] **Temperature**: Model uses temperature parameter correctly
- [ ] **Context Window**: Model handles conversation history properly

---

## Common Issues & Troubleshooting

### Connection Issues

#### "Connection refused" or "Cannot connect"

**Symptoms:**
- Error when testing provider
- Test button shows error immediately
- Chat won't send messages

**Solutions:**
1. **Verify server is running**
   - LM Studio: Check Developer tab shows "Server listening..."
   - Ollama: Terminal shows listening on port
   - Remote: Can you ping/curl the server manually?

2. **Check port number**
   - LM Studio: Usually 1234 (not 1235)
   - Ollama: Usually 11434
   - Custom: Verify in provider documentation

3. **Check URL format**
   - Include `/v1` in base URL
   - Example: `http://localhost:1234/v1`
   - Not: `http://localhost:1234/` or `http://localhost:1234`

4. **On mobile/emulator**
   - Use computer's IP instead of localhost
   - Find IP: `ipconfig getifaddr en0` (macOS) or `ipconfig` (Windows)
   - Example: `http://192.168.1.100:1234/v1`

5. **Check firewall**
   - Local network access might be blocked
   - macOS: System Preferences > Security & Privacy > Firewall
   - Windows: Windows Defender Firewall > Allow app through firewall

#### Test script times out

**Symptoms:**
- `./scripts/test-lm-studio.sh` hangs
- No response for 10+ seconds

**Solutions:**
```bash
# Increase timeout (default 10s)
TIMEOUT=30 ./scripts/test-lm-studio.sh

# Or test manually with curl
curl --max-time 30 http://localhost:1234/v1/models
```

### Model-Related Issues

#### "Model not found" error

**Symptoms:**
- API returns 404 or "Model X not found"
- Test connection works but chat fails

**Solutions:**
1. **Verify model ID spelling**
   - Model IDs are case-sensitive
   - Example: `mistral-7b-instruct` not `Mistral-7B-Instruct`

2. **Check model is loaded**
   - LM Studio: Model has green checkmark in Developer tab
   - Ollama: Run `ollama list` to see loaded models
   - Check model name matches exactly

3. **Reload model if needed**
   - Stop server
   - Reload model (should take a few seconds)
   - Restart server
   - Try again

#### "Invalid model ID" in request body

**Symptoms:**
- Provider returns validation error
- Chat request is rejected

**Solutions:**
- Use the exact model identifier from `/v1/models` response
- Don't use display name, use ID field
- Check no extra spaces in model ID

### Performance Issues

#### Slow response times

**Symptoms:**
- Responses take 10-30+ seconds
- Typing response is very slow
- Chat freezes while generating

**Possible causes and solutions:**

1. **Running on CPU (not GPU)**
   - GPU acceleration significantly improves speed
   - LM Studio: Check if GPU is recognized (Developer tab)
   - Consider smaller model (3B or 7B instead of 13B+)

2. **Model too large for your hardware**
   - 13B+ models need 24GB+ RAM or GPU
   - Try quantized versions (Q4, Q5) vs full precision
   - Switch to smaller model (7B or 3B)

3. **Network latency (for remote servers)**
   - Use local provider if possible
   - Check connection quality with ping
   - Remote providers add network overhead

4. **System under load**
   - Close other apps
   - Check System Monitor/Task Manager
   - LLMs need most system resources

5. **Settings too high**
   - Lower `maxOutputTokens` for faster responses
   - Reduce `maxContextTokens` to shorter history
   - Increase `temperature` sometimes helps (paradoxically)

### Token Limit Issues

#### "Maximum context length exceeded"

**Symptoms:**
- Long conversations suddenly fail
- Error mentions tokens or context window

**Solutions:**
1. **Reduce max context tokens setting**
   - Conversation history counts against limit
   - Lower `maxContextTokens` value in provider config
   - Example: Change from 8192 to 4096

2. **Start new conversation**
   - Context includes full history
   - Too many messages exceed window
   - Begin new chat to reset

3. **Use larger model**
   - Larger models have bigger context windows
   - Mistral 7B: 32k tokens
   - Llama 2 7B: 4k tokens
   - Check model specs before use

#### "Max tokens exceeded" for response

**Symptoms:**
- Response gets cut off
- "Maximum tokens reached" message

**Solutions:**
- Lower `maxOutputTokens` in settings (currently causes issue)
- Or increase it if model supports more
- Ask model for shorter response explicitly

### Streaming Issues

#### Streaming not working

**Symptoms:**
- Chat shows no streaming animation
- Full response appears all at once
- Or: "Streaming not supported"

**Solutions:**
1. **Verify streaming is enabled**
   - Check `supportsStreaming` is true in provider config
   - Test with: `"stream": true` in curl request

2. **Check provider supports streaming**
   - Not all OpenAI-compatible APIs support streaming
   - Test manually: See curl example in testing section
   - If manual test fails, provider doesn't support it

3. **Upgrade provider/model**
   - Older versions might not support streaming
   - Update LM Studio or Ollama to latest
   - Try different model that supports streaming

### Authentication Issues

#### "Invalid API key" or "Unauthorized"

**Symptoms:**
- Test connection fails with auth error
- Chat returns 401 Unauthorized

**Solutions:**
1. **Verify API key format**
   - Some use full format: `sk-abc123...`
   - Others use bearer token: `abc123...`
   - Check provider documentation

2. **Check API key validity**
   - API key might be expired or revoked
   - Generate new key from provider dashboard
   - Paste exactly (no extra spaces)

3. **Verify header format**
   - App sends: `Authorization: Bearer <key>`
   - Some providers need different format
   - Use `headers` field for custom headers

#### CORS errors (browser/app)

**Symptoms:**
- Network tab shows CORS errors
- "Origin not allowed" message

**Solutions:**
1. **For local LM Studio/Ollama**
   - CORS shouldn't occur on localhost
   - Check exact URL format
   - Clear browser cache and retry

2. **For cloud providers**
   - Usually handle CORS correctly
   - Check they support your origin
   - Try from different domain/app

3. **Workaround for stubborn CORS**
   - Use provider's official client
   - Or set up proxy server if needed
   - Report issue to provider

### Advanced Troubleshooting

#### Verbose logging

Enable detailed output for debugging:

```bash
# Test script verbose mode
VERBOSE=1 ./scripts/test-lm-studio.sh

# Check app logs for detailed errors
# Look in browser console or app debug panel
```

#### Network debugging

Test at network level:

```bash
# Is service running?
curl -v http://localhost:1234/v1/health

# Can you get models?
curl -v http://localhost:1234/v1/models

# Full request/response
curl -v -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral","messages":[{"role":"user","content":"hi"}]}'

# Watch raw traffic (macOS/Linux)
tcpdump -i lo0 -A 'tcp port 1234'
```

#### Provider-specific support

| Provider | Support | Docs |
|----------|---------|------|
| LM Studio | https://lmstudio.ai/support | https://lmstudio.ai/docs |
| Ollama | GitHub Issues | https://github.com/ollama/ollama |
| Azure | Microsoft Support | https://learn.microsoft.com/en-us/azure/ai-services/openai/ |
| OpenRouter | Email Support | https://openrouter.ai/docs |
| Groq | Discord Community | https://console.groq.com |

---

## FAQ

### Can I use multiple custom providers at once?

Yes! Add multiple providers in Settings. The chat model selector shows all available providers. Switch between them per conversation.

### How is my API key stored?

API keys are stored locally in app storage. They're encrypted when possible and never transmitted except to the configured provider endpoint.

### Can I switch providers mid-conversation?

Yes, but the new provider will start a fresh conversation. Previous messages won't be sent to the new provider.

### What if my provider API changes?

The app follows OpenAI's API spec. If provider changes their API, you may need to:
1. Update the base URL if endpoint changes
2. Update model ID if naming changes
3. Test connection to verify compatibility

### Can I run multiple models on one provider?

Yes, add the same provider twice with different model IDs:
1. Create provider "LM Studio - Mistral"
2. Create provider "LM Studio - Llama"
3. Both point to same base URL, different model IDs

### How do I backup my providers?

Providers are stored in app storage. To backup:
1. Export providers (if feature available)
2. Or manually note provider details
3. Settings > Custom Providers > [provider] > Copy details

### Is there a way to test without the app?

Yes! Use the test script:
```bash
./scripts/test-lm-studio.sh
```

Or use curl commands from the testing section.

### Can I share provider configurations?

Provider configurations can be exported as JSON and imported on another device. See CustomProviderStore export/import functionality.

### What ports do providers use?

- LM Studio: 1234
- Ollama: 11434
- Others: Check provider documentation

Can you run multiple on same machine? Yes, if using different ports.

---

## Next Steps

Once you have a custom provider working:

1. **Explore Chat Features**
   - Try different prompts
   - Test streaming responses
   - Use system prompts for behavior control

2. **Optimize Performance**
   - Adjust temperature for creative vs. deterministic
   - Find right token limits for your use case
   - Enable GPU acceleration if available

3. **Integrate with Workflows**
   - Use custom providers in agent workflows
   - Combine multiple providers in applications
   - Build tool-calling chains

4. **Scale Your Setup**
   - Run local providers on dedicated machine
   - Set up cloud provider backup
   - Monitor and log provider usage

---

## Additional Resources

- **OpenAI API Spec**: https://platform.openai.com/docs/api-reference
- **LM Studio**: https://lmstudio.ai/
- **Ollama**: https://ollama.ai/
- **Valdi Framework**: See docs/VALDI_API.md
- **Chat Integration**: See modules/chat_core/README.md

---

## Getting Help

If you encounter issues:

1. Check [Common Issues](#common-issues--troubleshooting) section
2. Run test script with verbose: `VERBOSE=1 ./scripts/test-lm-studio.sh`
3. Test manually with curl to isolate issue
4. Check provider's own documentation
5. Review app logs for error details
