# Workspace Guidance

Seed files live in:

```text
sandbox/workspace/
```

They are copied into the sandbox at:

```text
/workspace
```

Use this area for:

- starter documents;
- sample input files;
- empty directories the agent should write into;
- templates used by extension tools.

Avoid using it for:

- secrets;
- private customer data;
- large build artifacts;
- files that should be generated at runtime.

Recommended output area:

```text
/workspace/outputs
```

When artifact publishing is available, publish important generated files instead of assuming `/workspace` contents are user-visible.
