# ONE Platform Release Documentation

Complete release documentation is maintained in `.claude/commands/release.md`.

## Quick Release Guide

### Release Types

- `patch` - Bug fixes (3.6.6 → 3.6.7)
- `minor` - New features (3.6.6 → 3.7.0)
- `major` - Breaking changes (3.6.6 → 4.0.0)

### Execute Release

```bash
# Run pre-deployment checks
./scripts/pre-deployment-check.sh

# Execute release
./scripts/release.sh [patch|minor|major]

# Or use slash command
/release [patch|minor|major]
```

### Release Process

1. Pre-deployment validation
2. Version bump and file sync (518+ files)
3. Git commit and push to GitHub
4. npm publish
5. Web build and Cloudflare deployment
6. Verification and reporting

### Repositories

- **CLI**: https://github.com/one-ie/cli
- **Web**: https://github.com/one-ie/web
- **Assembly**: https://github.com/one-ie/one
- **Backend**: https://github.com/one-ie/backend
- **Ontology**: https://github.com/one-ie/ontology

### Live URLs

- **npm**: https://www.npmjs.com/package/oneie
- **Web**: https://web.one.ie
- **Docs**: https://one.ie

## Prerequisites

- npm authentication (`npm whoami`)
- GitHub access configured
- Cloudflare credentials (for automated deployment):
  - `CLOUDFLARE_GLOBAL_API_KEY` in `.env`
  - `CLOUDFLARE_ACCOUNT_ID` in `.env`
  - `CLOUDFLARE_EMAIL` in `.env`

## Post-Release

1. Test installation: `npx oneie@latest --version`
2. Verify web deployment
3. Create GitHub releases (manual)
4. Monitor for errors

---

**For detailed documentation, see:** `.claude/commands/release.md`
