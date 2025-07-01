# Contributing to SystemF Software

Welcome! This guide will help you contribute to th### CI/CD Pipeline

- **Pull Requests**: Runs affected type checking, linting, formatting, tests, and builds in parallel
- **Master Branch**: Full CI with caching and distributed execution
- **Docker Tests**: Separate step for integration tests requiring Docker
- **Releases**: Manual triggers via GitHub Actionsonorepo effectively.

## 🚀 Development Setup

### Prerequisites

- Node.js (LTS version)
- pnpm (latest)
- Git

### Getting Started

```bash
# Clone the repository
git clone <your-repo-url>
cd systemfsoftware

# Install dependencies
pnpm install

# Run tests to verify setup
pnpm test
```

## 📝 Making Changes

### 1. **Use Conventional Commits**

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning and changelog generation.

```bash
# Features (minor version bump)
git commit -m "feat(node): add new authentication method"

# Bug fixes (patch version bump)  
git commit -m "fix(node): resolve memory leak in connection pool"

# Breaking changes (major version bump)
git commit -m "feat(node)!: redesign API interface"
# or with detailed breaking change
git commit -m "feat(node): redesign API interface

BREAKING CHANGE: The API has been completely redesigned"

# Other types: docs, style, refactor, test, chore
git commit -m "docs(readme): update installation instructions"
```

### 2. **Commit Helper** (Recommended)

Use the interactive commit helper for guided conventional commits:

```bash
pnpm run commit
# or directly
./scripts/commit.sh
```

### 3. **Testing Your Changes**

```bash
# Run tests for affected projects only
pnpm exec nx affected -t test

# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Build affected projects
pnpm exec nx affected -t build
```

### 4. **Code Formatting**

This project uses [dprint](https://dprint.dev/) for consistent code formatting:

```bash
# Format all files
pnpm run format

# Check formatting without making changes
pnpm run format:check

# Format only affected projects
pnpm run format:affected

# Check formatting for affected projects only
pnpm run format:check:affected
```

## 🔄 Development Workflow

### Branch Strategy

- **`master`** - Main branch, protected
- **`feature/*`** - Feature branches
- **`fix/*`** - Bug fix branches
- **`release/*`** - Release preparation branches (created by automation)

### Pull Request Process

1. **Create a feature branch** from `master`
2. **Make your changes** using conventional commits
3. **Push and create a PR** to `master`
4. **CI will run** tests for affected projects only
5. **Review and merge** once approved

### CI/CD Pipeline

- **Pull Requests**: Runs affected tests, builds, and type checking
- **Master Branch**: Full CI with caching and distributed execution
- **Releases**: Manual triggers via GitHub Actions

## 🚀 Release Process

### Automated Releases

This monorepo uses **Nx Release** for independent package versioning:

- ✅ **Independent versioning** - Each package has its own version
- ✅ **Automatic version bumps** from conventional commits
- ✅ **Generated changelogs** from commit history
- ✅ **GitHub releases** with release notes
- ✅ **NPM publishing** with provenance

### Release Types

| Commit Type                    | Version Bump | Example           |
| ------------------------------ | ------------ | ----------------- |
| `fix:`                         | Patch        | `1.0.0` → `1.0.1` |
| `feat:`                        | Minor        | `1.0.0` → `1.1.0` |
| `feat!:` or `BREAKING CHANGE:` | Major        | `1.0.0` → `2.0.0` |

### Creating a Release

#### Option 1: Release PR (Recommended)

1. Go to **Actions** → **"Release PR"** → **Run workflow**
2. Choose version type (`auto` recommended)
3. Review the generated PR with version bumps
4. Merge the PR
5. Run the **"Release"** workflow to publish

#### Option 2: Direct Release

1. Go to **Actions** → **"Release"** → **Run workflow**
2. Choose version type and whether to dry-run
3. Packages will be automatically published

#### Option 3: Local Release (Maintainers)

```bash
# Preview what would be released
pnpm run release:dry-run

# Create version bump and changelog
pnpm run release:version

# Publish to npm
pnpm run release:publish
```

## 🏗️ Monorepo Structure

```
├── packages/
│   └── node/           # Node.js library package
├── scripts/            # Development scripts
├── .github/
│   └── workflows/      # CI/CD workflows
└── nx.json            # Nx workspace configuration
```

### Adding New Packages

Use Nx generators to create new packages:

```bash
# See available generators
pnpm exec nx g --help

# Example: Create a new library
pnpm exec nx g @nx/js:library my-new-lib --directory=packages/my-new-lib
```

## 🧪 Testing Guidelines

### Unit Tests

- Write tests for all new features
- Maintain or improve test coverage
- Use descriptive test names

### Integration Tests

- Docker-based tests run in separate CI workflow
- Use testcontainers for external dependencies

### Running Tests

```bash
# Affected tests only (fast)
pnpm exec nx affected -t test

# All tests
pnpm test

# With coverage
pnpm test:coverage

# Watch mode for development
pnpm exec nx test <project-name> --watch
```

## 🔧 Development Tools

### Available Scripts

```bash
pnpm test                    # Run all tests
pnpm test:coverage           # Run tests with coverage
pnpm run format              # Format all files with dprint
pnpm run format:check        # Check formatting without changes
pnpm run format:affected     # Format affected projects only
pnpm run commit              # Interactive conventional commit
pnpm run release:dry-run     # Preview next release
```

### Nx Commands

```bash
# See project graph
pnpm exec nx graph

# Run specific project task
pnpm exec nx build node

# See what's affected
pnpm exec nx affected:graph
```

## 📋 Code Style

This project uses [dprint](https://dprint.dev/) for automatic code formatting. The configuration is in `dprint.json`.

### Formatting Rules

- **Line width**: 120 characters
- **TypeScript**: ASI (no semicolons), single quotes, trailing commas on multiline
- **JSON/YAML/Markdown**: Consistent formatting
- **Automatic formatting**: Run `pnpm run format` before committing

### TypeScript

- Use strict TypeScript configuration
- Follow existing code patterns
- Export types and interfaces appropriately

### Imports

- Use absolute imports when possible
- Group imports: external, internal, relative
- Sort imports alphabetically within groups

### Documentation

- Update README files when adding features
- Document public APIs with JSDoc
- Include examples for complex functionality

## 🤝 Getting Help

- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check existing docs first

## 📚 Additional Resources

- [Nx Documentation](https://nx.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Thank you for contributing! 🎉
