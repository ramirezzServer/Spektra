# Release Process

This process keeps releases manual and auditable. Do not rewrite Git history and do not create tags until CI is green.

## 1. Prepare A Release Branch

```bash
git switch main
git pull --ff-only
git switch -c release/v0.1.0
```

Update release notes, documentation, and any version metadata that belongs to the release. Keep unrelated product work out of the release branch.

## 2. Run Required Checks

Use GitHub Actions as the source of truth. Before requesting review, run the relevant local checks from [CONTRIBUTING.md](../CONTRIBUTING.md) and complete [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

Run the manual Smoke workflow when a production-like Docker smoke check is needed.

## 3. Open And Merge The PR

Open a PR from `release/v0.1.0` into `main`. Use squash merge unless maintainers intentionally need to preserve multiple commits.

After merge, update local `main`:

```bash
git switch main
git pull --ff-only
```

## 4. Create The Release Tag

Create the tag manually after the release commit is on `main`:

```bash
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```

Do not create this tag from an unmerged feature branch.

## 5. Publish Notes

Use `CHANGELOG.md` as the release note source. Include:

- Notable features and fixes.
- Security and deployment notes.
- Migration or environment changes.
- Known limitations.

## 6. Rollback Guidance

If a release needs rollback, revert the release PR or deploy the previous known-good tag. Do not force-push `main` or move published tags unless maintainers explicitly decide to replace a broken unpublished tag.
