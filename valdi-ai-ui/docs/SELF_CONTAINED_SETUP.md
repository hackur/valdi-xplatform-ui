# Making Valdi AI UI Fully Self-Contained

**Status:** Ready to implement 🚀
**Recommended Approach:** Git Submodule

---

## 🎯 Problem

Currently depends on: `../Valdi` (external directory)
**Goal:** Make 100% self-contained - clone anywhere and build!

---

## ✅ RECOMMENDED SOLUTION: Git Submodule

### Quick Setup (5 minutes)

```bash
# 1. Add Valdi as submodule
mkdir -p vendor
git submodule add https://github.com/Snapchat/Valdi.git vendor/valdi
git submodule update --init --recursive

# 2. Update MODULE.bazel
# Change path from "../Valdi" to "vendor/valdi"

# 3. Test
bazel build //:valdi_ai_ui
npm run build:ios
```

### MODULE.bazel Configuration

```python
module(name = "valdi_ai_ui", version = "1.0.0")

bazel_dep(name = "valdi", version = "1.0.0")

# Self-contained: Valdi is in vendor/ subdirectory
local_path_override(
    module_name = "valdi",
    path = "vendor/valdi",  # ✅ Self-contained!
)
```

### Clone Instructions (For Others)

```bash
git clone <your-repo>
cd valdi-ai-ui
git submodule update --init --recursive  # Get Valdi
npm install
npm run build:ios  # Works!
```

---

## 📋 Step-by-Step Implementation

Execute these commands now:

\`\`\`bash
cd /Users/sarda/valdi-xplatform-ui/valdi-ai-ui

# Create vendor directory
mkdir -p vendor

# Add Valdi submodule
git submodule add https://github.com/Snapchat/Valdi.git vendor/valdi

# Initialize it
git submodule update --init --recursive

# Done! ✅
\`\`\`

---

## 🔄 Alternative: Simple Copy

Don't want submodules? Just copy Valdi:

```bash
cp -r ../Valdi vendor/valdi
rm -rf vendor/valdi/.git  # Remove git history
```

Then use same MODULE.bazel config above.

---

Ready to make it self-contained?
