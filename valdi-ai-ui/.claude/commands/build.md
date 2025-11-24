# Build the Valdi AI UI Application

Run a full Bazel build of the Valdi AI UI application.

```bash
bazel build //:valdi_ai_ui
```

If successful, you should see a message indicating the build completed successfully.

For a complete build of all targets:

```bash
bazel build //...
```

To clean before building:

```bash
bazel clean && bazel build //:valdi_ai_ui
```
