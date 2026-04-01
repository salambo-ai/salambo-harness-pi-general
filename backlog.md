# Backlog

## Pi Template Hardening

This template already preserves the Salambo contract, but it still needs a few follow-up improvements before it feels fully polished as a standalone pi template.

### Highest Priority

- persist the pi session registry across process restarts instead of keeping it in memory only
- tighten the `PI_HOME` auth/bootstrap story for Docker and local development
- add an explicit resume-focused integration test against the pi runner adapter

### Nice To Have

- document recommended `settings.json` variants for different models/providers
- add a Docker smoke test that boots the image and checks `/health`
- add release automation/docs polish for the new image name

### Working Principle

For this template, improvements should optimize for:

- contract safety
- deterministic tests
- clear customization points
- pi-native ergonomics without changing Salambo-facing behavior
