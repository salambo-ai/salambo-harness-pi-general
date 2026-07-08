# Artifact Security

## Do

- Publish explicit user-facing outputs only.
- Use safe logical paths such as `/summary.json`.
- Keep files within intended workspace/output locations.
- Redact secrets before publishing logs or diagnostics.
- Check file size before publishing when possible.

## Do not

- Publish `.env` files.
- Publish raw process environments.
- Publish API keys, cookies, tokens, or auth headers.
- Hardcode Salambo internal provider routes in builder code.
- Put object-storage credentials in the sandbox.
