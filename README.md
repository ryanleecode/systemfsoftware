# SystemF Software

A TypeScript monorepo for SystemF software packages, built with [Nx](https://nx.dev).

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build packages
pnpm exec nx run-many -t build

# Preview next release
pnpm run release:dry-run
```

## 📦 Packages

- **`@systemfsoftware/node`** - Node.js library package

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development guidelines, including:

- Development setup and workflow
- Conventional commit standards
- Release process with Nx Release
- Testing guidelines
- Code style requirements

## 🔧 Development

### Running Tasks

```bash
# Run affected tests only (fast)
pnpm exec nx affected -t test

# Build specific project
pnpm exec nx build node

# View project graph
pnpm exec nx graph
```

### Creating Commits

```bash
# Interactive conventional commit helper
pnpm run commit
```

## 📋 Release Management

This monorepo uses **Nx Release** for independent package versioning:

- ✅ Automatic version bumps from conventional commits
- ✅ Generated changelogs from commit history
- ✅ Independent package versioning
- ✅ GitHub releases with NPM publishing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed release process.

## 🏗️ Architecture

- **Nx Monorepo** - Task orchestration and caching
- **TypeScript** - Type-safe development
- **Vitest** - Fast unit testing
- **pnpm** - Efficient package management
- **Conventional Commits** - Automated versioning
- **GitHub Actions** - CI/CD pipeline

## 📚 Learn More

- [Nx Documentation](https://nx.dev)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

Built with ❤️ using Nx
