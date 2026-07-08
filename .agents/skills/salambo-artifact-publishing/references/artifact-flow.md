# Artifact Flow

```text
Agent code
  creates /workspace/outputs/report.pdf
    ↓
Hosted extension tool or platform executable
  reads SALAMBO_ARTIFACT_UPLOAD_URL and SALAMBO_ARTIFACT_TOKEN
    ↓
Salambo web app
  validates token, run, account, path, and size
    ↓
Salambo-owned object storage
  stores file bytes
    ↓
Salambo database
  writes session_artifacts and artifact lifecycle events
    ↓
Run UI and API
  show and download the artifact
```

## Important rule

The sandbox receives only a run-scoped upload URL and token. It never receives Backblaze, S3, or object-storage credentials.
