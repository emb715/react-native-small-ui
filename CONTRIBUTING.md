# Contributing

Contributions are welcome, no matter how large or small.

Please follow the [Code of Conduct](./CODE_OF_CONDUCT.md) in all interactions with the project.

## Development workflow

The library lives in the root directory. To get started:

```sh
yarn install
```

Run the full local CI check before and after your changes:

```sh
yarn preflight
```

This runs: typecheck → lint → tests → bundle isolation check → library build → bundle size check.

> The pre-push hook runs `prepare`, `size`, and `bundle:check` automatically when you `git push` — so a clean push means the build is verified.

### Working with AI agents

This repo ships an [Intent skill](skills/react-native-small-ui/SKILL.md) that teaches agents the correct API patterns (module-scope rule, variant config shape, entry point imports). Load it before working on the library:

```sh
npx @tanstack/intent load react-native-small-ui
```

The skill is validated against source on every CI run. If you change the public API, update `skills/react-native-small-ui/SKILL.md` and the ref files in `skills/react-native-small-ui/refs/`.

### Commit message convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en) specification. Commit messages drive automatic version bumping and changelog generation via Release Please.

| Prefix | When to use |
|--------|-------------|
| `feat:` | New feature (bumps minor version) |
| `fix:` | Bug fix (bumps patch version) |
| `refactor:` | Code refactor with no behavior change |
| `docs:` | Documentation only |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, dependencies, config |
| `feat!:` or `BREAKING CHANGE:` | Breaking change (bumps major version) |

Pre-commit hooks verify your commit message matches this format.

### Releases

This project uses [Release Please](https://github.com/googleapis/release-please) for automated release management.

**How it works:**
1. Merge commits to `main` using conventional commit messages
2. Release Please automatically opens a release PR with a bumped version and generated changelog
3. Review and merge the release PR when ready
4. After the release PR merges, a GitHub Release and git tag are created automatically
5. Publish to npm manually from your local machine:

```sh
# After the release tag is created on main, pull it and publish
git pull
npm publish
```

npm publish is intentionally manual — no npm token is stored in CI.

### Sending a pull request

- Fork the repository and create a feature branch
- Make your changes with tests
- Run `yarn preflight` — all checks must pass
- Open a PR against `main`
- CI runs lint, typecheck, tests, and build automatically
