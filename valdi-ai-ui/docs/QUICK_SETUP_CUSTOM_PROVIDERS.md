# Custom Provider Quick Setup Guide

TL;DR - Get a custom provider working in 5 minutes.

## Fastest Path: LM Studio

### 1. Install & Load (2 min)
```bash
# Download from https://lmstudio.ai/

# In LM Studio:
# 1. Click Home > search "mistral" > download
# 2. Click Developer > select model > Load Model
# 3. Click Start Server > wait for "listening on localhost:1234"
```

### 2. Test It Works (30 sec)
```bash
./scripts/test-lm-studio.sh
```

### 3. Add to App (2 min)
1. Settings > Add Custom Provider
2. Fill in:
   - Provider Name: `LM Studio`
   - Base URL: `http://localhost:1234/v1`
   - Model ID: `mistral-7b-instruct`
   - API Key: (leave empty)
3. Click Test Connection > Save

### 4. Use It
Chat > Select your provider > Start chatting

---

## Alternative: Ollama

### 1. Install & Start (2 min)
```bash
# Download from https://ollama.ai/
ollama serve &  # Start server

# In another terminal
ollama pull mistral  # Download model
```

### 2. Add to App
- Provider Name: `Ollama`
- Base URL: `http://localhost:11434/v1`
- Model ID: `mistral`

### 3. Test & Use
Test connection > Save > Chat

---

## Alternative: Cloud Provider

### Example: OpenRouter

1. Sign up: https://openrouter.ai/
2. Get API key from dashboard
3. Add Provider:
   - Name: `OpenRouter`
   - Base URL: `https://openrouter.ai/api/v1`
   - Model ID: `openai/gpt-3.5-turbo`
   - API Key: `sk-...` (your OpenRouter key)
4. Test & use

---

## Common Model IDs

| Provider | Model | ID |
|----------|-------|-----|
| LM Studio | Mistral 7B | `mistral-7b-instruct` |
| LM Studio | Llama 2 | `llama-2-7b-chat` |
| Ollama | Mistral | `mistral` |
| Ollama | Llama 2 | `llama2` |
| OpenRouter | GPT-3.5 | `openai/gpt-3.5-turbo` |
| OpenRouter | Claude | `anthropic/claude-2` |
| Groq | Mixtral | `mixtral-8x7b-32768` |

---

## Testing Commands

```bash
# Full test suite
./scripts/test-lm-studio.sh

# Verbose output
VERBOSE=1 ./scripts/test-lm-studio.sh

# Quick connectivity check
curl http://localhost:1234/v1/models

# Test specific endpoint
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral-7b-instruct","messages":[{"role":"user","content":"hi"}]}'

# Test streaming
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral-7b-instruct","messages":[{"role":"user","content":"count to 3"}],"stream":true}'
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Check server running: LM Studio Developer tab shows listening |
| "Model not found" | Verify model ID matches (case-sensitive): check `/v1/models` |
| "Timeout" | Increase timeout: `TIMEOUT=30 ./scripts/test-lm-studio.sh` |
| Slow responses | Enable GPU acceleration or use smaller model |
| Mobile can't connect | Use IP address instead: `http://192.168.1.x:1234/v1` |
| "Authorization failed" | Check API key is correct (for cloud providers) |

---

## Configuration Fields

Required:
- `name`: Provider display name
- `baseUrl`: API endpoint (e.g., `http://localhost:1234/v1`)
- `modelId`: Model identifier (e.g., `mistral-7b-instruct`)

Optional:
- `apiKey`: For cloud providers (leave empty for local)
- `modelName`: Friendly display name
- `defaultTemperature`: 0-2 (0=deterministic, 1=balanced, 2=creative)
- `maxOutputTokens`: Max response length (default 4096)
- `maxContextTokens`: Max conversation length (default 8192)
- `supportsStreaming`: true/false (default true)
- `supportsFunctionCalling`: true/false (default false)

---

## Tips

- **Local providers** (LM Studio, Ollama): No API key needed, runs on your computer
- **Cloud providers** (OpenAI, Claude, etc.): Require API key, bills usage
- **Streaming**: Shows text as it generates (faster feel)
- **Temperature**: Lower = more focused, Higher = more creative
- **Context window**: Larger = longer conversations before hitting limit

---

## Resources

- Full guide: `docs/CUSTOM_PROVIDERS.md`
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.ai/
- Test script: `./scripts/test-lm-studio.sh`
- Dev script: `./dev.sh test:lm`
