# CI/CD Documentation

## Overview

This project uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The workflows automate testing, building, code quality checks, and deployment processes.

## Workflows

### 1. Test Workflow (`.github/workflows/test.yml`)

**Trigger**: Automatic on push and pull requests to `main` and `develop` branches

**Purpose**: Run comprehensive tests across multiple Node.js versions and operating systems

**Matrix Testing**:
- **Node.js versions**: 18.x, 20.x
- **Operating Systems**: Ubuntu Latest, Windows Latest
- **Total combinations**: 4 (2 Node versions × 2 OS)

**Steps**:
1. Checkout repository
2. Setup Node.js with caching
3. Install dependencies (`npm ci`)
4. **Code Quality Checks** (Ubuntu only):
   - Prettier format check
   - Solidity linting (Solhint)
   - JavaScript linting (ESLint)
5. Compile contracts
6. Run test suite
7. **Generate coverage** (Node 20.x + Ubuntu only)
8. **Upload coverage to Codecov**

### 2. Build Workflow (`.github/workflows/build.yml`)

**Trigger**: Automatic on push and pull requests to `main` and `develop` branches

**Purpose**: Compile contracts and verify build artifacts

**Steps**:
1. Checkout repository
2. Setup Node.js 20.x
3. Install dependencies
4. Compile contracts
5. Verify artifacts directory
6. Upload artifacts (Ubuntu only, 7-day retention)

### 3. Deploy Workflow (`.github/workflows/deploy.yml`)

**Trigger**: Manual workflow dispatch

**Purpose**: Deploy contracts to specified networks

**Inputs**:
- **Network**: localhost, sepolia, mainnet
- **Environment**: development, staging, production

**Steps**:
1. Checkout repository
2. Setup Node.js
3. Install dependencies
4. Compile contracts
5. Run tests (safety check)
6. Deploy to selected network
7. Verify contract (Sepolia only)
8. Upload deployment artifacts (30-day retention)

## Code Quality Checks

### Prettier Format Check

**Command**: `npm run format:check`

**Checks**:
- All JavaScript, JSON, Markdown, Solidity, and YAML files
- Ensures consistent code formatting
- Runs only on Ubuntu in test workflow

**Configuration**: `.prettierrc.json` and `.prettierignore`

### Solidity Linting (Solhint)

**Command**: `npm run lint:sol`

**Configuration**: `.solhint.json`

**Rules**:
- Extends `solhint:recommended`
- Code complexity limit: 8
- Compiler version: ^0.8.0
- Max line length: 120 characters
- Zero warnings tolerance (`--max-warnings 0`)
- Function visibility enforced (except constructors)

**Ignored**: `artifacts/`, `node_modules/`, `cache/`, `coverage/`

### JavaScript Linting (ESLint)

**Command**: `npm run lint:js`

**Configuration**: `.eslintrc.json`

**Rules**:
- Extends `eslint:recommended`
- ES6+ JavaScript standards
- Mocha test environment support

**Ignored**: `node_modules/`, `artifacts/`, `cache/`, `coverage/`

## Code Coverage

### Configuration

**File**: `.codecov.yml`

**Settings**:
- Target coverage: 80%
- Project threshold: ±2%
- Patch threshold: ±5%
- Precision: 2 decimal places

**Ignored Paths**:
- `test/**/*`
- `scripts/**/*`
- `node_modules/**/*`
- `artifacts/**/*`
- `cache/**/*`

### Codecov Integration

**Upload**: Automatic on Node 20.x + Ubuntu

**Flags**: `unittests` for contract coverage

**Token**: Stored in GitHub Secrets as `CODECOV_TOKEN`

### Local Coverage

```bash
# Generate coverage report
npm run coverage

# View HTML report
open coverage/index.html
```

## Environment Secrets

Required GitHub Secrets for deployment:

| Secret | Description | Required For |
|--------|-------------|--------------|
| `PRIVATE_KEY` | Wallet private key | Deployment |
| `SEPOLIA_RPC_URL` | Sepolia RPC endpoint | Sepolia deployment |
| `ETHERSCAN_API_KEY` | Etherscan API key | Contract verification |
| `CODECOV_TOKEN` | Codecov upload token | Coverage reporting |

### Setting Secrets

1. Go to repository **Settings**
2. Navigate to **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its value

## Running Workflows

### Automatic Triggers

Workflows run automatically on:
- Push to `main` branch
- Push to `develop` branch
- Pull requests targeting `main`
- Pull requests targeting `develop`

### Manual Deployment

1. Go to **Actions** tab
2. Select **Deploy** workflow
3. Click **Run workflow**
4. Choose:
   - Branch to deploy from
   - Target network
   - Environment
5. Click **Run workflow**

## Local Testing

### Run All Checks Locally

```bash
# Install dependencies
npm ci

# Format check
npm run format:check

# Linting
npm run lint

# Tests
npm test

# Coverage
npm run coverage
```

### Fix Formatting Issues

```bash
# Auto-fix format
npm run format

# Auto-fix linting (where possible)
npm run lint:js -- --fix
```

## Workflow Status Badges

Add to README.md:

```markdown
![Tests](https://github.com/YOUR_USERNAME/privacy-fitness-tracker/workflows/Tests/badge.svg)
![Build](https://github.com/YOUR_USERNAME/privacy-fitness-tracker/workflows/Build/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/privacy-fitness-tracker/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/privacy-fitness-tracker)
```

## Troubleshooting

### Tests Failing

**Check**:
- Node.js version compatibility
- Dependencies installed correctly
- Environment variables set (for deployment)

**Solution**:
```bash
npm ci  # Clean install
npm test  # Run locally
```

### Linting Errors

**Check**:
- Code formatting
- Linting rules compliance

**Solution**:
```bash
npm run format  # Auto-fix formatting
npm run lint  # See errors
```

### Coverage Upload Fails

**Check**:
- `CODECOV_TOKEN` secret is set
- Coverage report generated

**Solution**:
- Verify secret in repository settings
- Check coverage report exists: `coverage/lcov.info`

### Deployment Fails

**Check**:
- All required secrets are set
- Network configuration is correct
- Wallet has sufficient funds

**Solution**:
- Verify secrets in repository settings
- Check `hardhat.config.js` network settings
- Ensure testnet ETH available

## Best Practices

### Before Committing

```bash
# 1. Format code
npm run format

# 2. Run linting
npm run lint

# 3. Run tests
npm test

# 4. Check coverage
npm run coverage
```

### Pull Request Requirements

- ✅ All tests pass
- ✅ Code formatted (Prettier)
- ✅ No linting errors
- ✅ Coverage maintained/improved
- ✅ Build successful

### Branch Protection

Recommended settings for `main` branch:
- Require pull request reviews
- Require status checks to pass:
  - `test (18.x, ubuntu-latest)`
  - `test (18.x, windows-latest)`
  - `test (20.x, ubuntu-latest)`
  - `test (20.x, windows-latest)`
  - `build (ubuntu-latest)`
  - `build (windows-latest)`
- Require branches to be up to date
- Do not allow force pushes

## Continuous Deployment

### Automatic Deployment (Optional)

To enable automatic deployment on successful merge:

1. Create `.github/workflows/auto-deploy.yml`:

```yaml
name: Auto Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    if: "!contains(github.event.head_commit.message, 'skip ci')"
    uses: ./.github/workflows/deploy.yml
    with:
      network: sepolia
      environment: production
    secrets: inherit
```

2. Commit with `[skip ci]` to bypass deployment

## Monitoring

### View Workflow Runs

1. Go to **Actions** tab
2. Select workflow
3. View run details, logs, and artifacts

### Download Artifacts

1. Go to completed workflow run
2. Scroll to **Artifacts** section
3. Download:
   - Contract artifacts (build)
   - Deployment info (deploy)

## Performance

### Workflow Optimization

**Caching**:
- npm dependencies cached by Node.js action
- Speeds up subsequent runs

**Parallel Jobs**:
- Matrix builds run in parallel
- Faster feedback on multi-platform compatibility

**Conditional Steps**:
- Code quality checks run only on Ubuntu
- Coverage upload only on Node 20.x + Ubuntu
- Reduces unnecessary duplicate work

## Security

### Secrets Management

- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate secrets regularly
- ✅ Use environment-specific secrets

### Workflow Permissions

- ✅ Minimal permissions required
- ✅ No persistent credentials in checkout
- ✅ Secrets only in deployment workflow

## Resources

### Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Codecov Documentation](https://docs.codecov.com/)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)

### Tools

- **Hardhat**: Smart contract development
- **Solhint**: Solidity linter
- **ESLint**: JavaScript linter
- **Prettier**: Code formatter
- **Codecov**: Coverage reporting

---

**Last Updated**: 2025-10-29

For questions about CI/CD, refer to workflow files in `.github/workflows/` directory.
