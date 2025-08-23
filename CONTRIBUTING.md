# Contributing to Privacy Fitness Tracker

Thank you for your interest in contributing to the Privacy Fitness Tracker project! This document provides guidelines and instructions for contributors.

## Getting Started

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone <your-fork-url>
   cd privacy-fitness-tracker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Compile Contracts**
   ```bash
   npm run compile
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, documented code
   - Follow the existing code style
   - Add tests for new functionality

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint:sol
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Ensure all tests pass

## Coding Standards

### Solidity Style Guide

- Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments for all public functions
- Maximum line length: 120 characters
- Use meaningful variable names
- Add comments for complex logic

Example:
```solidity
/**
 * @notice Register a new fitness club member
 * @param _membershipType The type of membership (Basic, Premium, Elite, Corporate)
 */
function registerMember(string memory _membershipType) external {
    // Implementation
}
```

### JavaScript Style Guide

- Use ES6+ features
- Follow ESLint configuration
- Use async/await for asynchronous code
- Add JSDoc comments for functions

Example:
```javascript
/**
 * Deploy the PrivateFitnessTracker contract
 * @returns {Promise<Contract>} The deployed contract instance
 */
async function deployContract() {
    // Implementation
}
```

## Testing Guidelines

### Writing Tests

- Write tests for all new features
- Ensure edge cases are covered
- Use descriptive test names
- Group related tests with `describe` blocks

Example:
```javascript
describe("Member Registration", function () {
  it("Should register a new member successfully", async function () {
    // Test implementation
  });

  it("Should not allow duplicate registration", async function () {
    // Test implementation
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npx hardhat coverage

# Run specific test file
npx hardhat test test/PrivateFitnessTracker.test.js
```

## Commit Message Format

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(contracts): add workout sharing functionality

Implement ability for members to share encrypted workout data
with selected friends while maintaining privacy guarantees.

Closes #123
```

```
fix(deploy): resolve gas estimation error

Update deployment script to properly estimate gas for
contract deployment on Sepolia testnet.
```

## Pull Request Guidelines

### Before Submitting

- ✅ All tests pass
- ✅ Code is properly formatted
- ✅ No linting errors
- ✅ Documentation is updated
- ✅ Commit messages follow convention

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings
```

## Security Considerations

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email security concerns privately
2. Provide detailed description
3. Include reproduction steps
4. Suggest fix if possible

### Security Best Practices

- Never commit private keys or sensitive data
- Validate all user inputs
- Use SafeMath for arithmetic operations
- Follow checks-effects-interactions pattern
- Add access control modifiers appropriately

## Documentation

### Updating Documentation

When adding features:
- Update README.md with new functionality
- Update DEPLOYMENT.md if deployment changes
- Add inline code comments
- Update API documentation

### Documentation Style

- Use clear, concise language
- Include code examples
- Provide context and explanations
- Keep formatting consistent

## Code Review Process

### For Contributors

- Be responsive to feedback
- Make requested changes promptly
- Ask questions if unclear
- Be respectful and professional

### For Reviewers

- Provide constructive feedback
- Explain reasoning for changes
- Approve when satisfied
- Be timely with reviews

## Areas for Contribution

### Priority Areas

1. **Smart Contract Enhancements**
   - Additional FHE operations
   - Gas optimization
   - New features

2. **Testing**
   - Increase test coverage
   - Integration tests
   - Stress testing

3. **Documentation**
   - Improve guides
   - Add tutorials
   - API documentation

4. **Tooling**
   - Deployment automation
   - Monitoring scripts
   - Analytics tools

5. **Security**
   - Security audits
   - Vulnerability testing
   - Best practices

## Resources

### Learning Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org)
- [Zama fhEVM](https://docs.zama.ai/fhevm)
- [Ethereum Development](https://ethereum.org/developers)

### Community

- GitHub Discussions
- Discord Server
- Twitter Updates

## Questions?

If you have questions:
1. Check existing documentation
2. Search GitHub issues
3. Ask in discussions
4. Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Privacy Fitness Tracker! Your efforts help build a more private and secure fitness tracking platform.
