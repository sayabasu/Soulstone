# Branch Protection

Configure branch protection rules in GitHub so that the following status checks from `.github/workflows/ci.yml` must pass before merging into `main`:

- `CI / Lint`
- `CI / Type Check`
- `CI / Unit Tests`
- `CI / Build`
- `CI / Security Scans`

Enable pull request review requirements and include administrators so the protections apply consistently across contributors.
