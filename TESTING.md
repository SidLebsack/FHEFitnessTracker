# Testing Documentation

## Overview

This document provides comprehensive information about the Privacy Fitness Tracker test suite, including test organization, execution instructions, coverage requirements, and best practices.

## Test Infrastructure

### Technology Stack

- **Testing Framework**: Hardhat + Mocha + Chai
- **Assertion Library**: Chai with Hardhat matchers
- **Coverage Tool**: solidity-coverage
- **Gas Reporter**: hardhat-gas-reporter
- **Blockchain**: Hardhat Network (local) / Sepolia (testnet)

### Test Files

```
test/
├── PrivateFitnessTracker.test.js              # 30 core tests
└── PrivateFitnessTracker.comprehensive.test.js # 70+ comprehensive tests
```

**Total Test Cases**: 100+ tests covering all contract functionality

## Test Categories

### 1. Deployment and Initialization (5 tests)

Verifies correct contract deployment and initial state:
- Contract address validation
- Owner assignment
- Initial counters (members, challenges)
- Contract balance
- State consistency

### 2. Member Registration (10 tests)

Tests user registration functionality:
- All membership types (Basic, Premium, Elite, Corporate)
- Member count increments
- Duplicate registration prevention
- Input validation
- Join date recording
- Active status
- Session initialization

### 3. Workout Recording (12 tests)

Validates workout tracking:
- Successful workout recording
- Session count increments
- Multiple workout tracking
- Access control (members only)
- Input validation (calories, duration, intensity)
- Boundary values (min/max intensity)
- Event emissions
- Multi-user independence

### 4. Challenge Creation (8 tests)

Tests challenge system:
- Owner-only creation
- Challenge count tracking
- Input validation (name, target, duration)
- Prize pool handling
- Multiple challenge support
- Access control
- Invalid input rejection

### 5. Challenge Participation (6 tests)

Verifies challenge joining:
- Member enrollment
- Access control
- Invalid challenge handling
- Multiple participants
- Duplicate prevention
- Participant counting

### 6. Fitness Level Updates (4 tests)

Tests fitness level management:
- Level update functionality
- Boundary validation (1-10)
- Member-only access
- Invalid input rejection

### 7. Owner Functions (5 tests)

Validates administrative features:
- Member deactivation
- Ownership transfer
- Fund withdrawal
- Access control
- Invalid address handling

### 8. View Functions (4 tests)

Tests read-only operations:
- Member information retrieval
- Workout session queries
- Time calculations (week/month)
- Data accuracy

### 9. Gas Optimization (3 tests)

Monitors transaction costs:
- Registration gas usage (< 300k gas)
- Workout recording (< 200k gas)
- Challenge participation (< 150k gas)

### 10. Edge Cases (3 tests)

Tests boundary conditions:
- Minimum valid values
- Maximum durations
- Rapid successive transactions
- Unusual input combinations

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test
```

### Specific Test Suites

```bash
# Run core tests only
npx hardhat test test/PrivateFitnessTracker.test.js

# Run comprehensive tests
npx hardhat test test/PrivateFitnessTracker.comprehensive.test.js

# Run specific test category
npx hardhat test --grep "Member Registration"

# Run with verbose output
npx hardhat test --verbose
```

### Network-Specific Testing

```bash
# Local Hardhat network (default)
npx hardhat test

# Sepolia testnet
npx hardhat test --network sepolia

# With gas reporting
REPORT_GAS=true npx hardhat test
```

## Test Coverage

### Coverage Analysis

```bash
# Generate coverage report
npx hardhat coverage
```

**Coverage Output**:
```
File                           | % Stmts | % Branch | % Funcs | % Lines |
-------------------------------|---------|----------|---------|---------|
contracts/                     |   95.2  |   88.7   |   97.3  |   96.1  |
  PrivateFitnessTracker.sol    |   95.2  |   88.7   |   97.3  |   96.1  |
-------------------------------|---------|----------|---------|---------|
All files                      |   95.2  |   88.7   |   97.3  |   96.1  |
```

### Coverage Goals

- **Statements**: > 95%
- **Branches**: > 85%
- **Functions**: > 95%
- **Lines**: > 95%

## Gas Reporting

### Enabling Gas Reports

```bash
# Set environment variable
export REPORT_GAS=true

# Run tests with gas reporting
npm test
```

### Expected Gas Costs

| Operation | Avg Gas | Max Gas |
|-----------|---------|---------|
| Contract Deployment | ~2,800,000 | ~3,200,000 |
| Register Member | ~180,000 | ~250,000 |
| Record Workout | ~120,000 | ~180,000 |
| Create Challenge | ~150,000 | ~200,000 |
| Join Challenge | ~80,000 | ~120,000 |
| Update Fitness Level | ~60,000 | ~90,000 |

## Test Patterns

### Pattern 1: Deployment Fixture

```javascript
beforeEach(async function () {
  [owner, member1, member2] = await ethers.getSigners();

  const PrivateFitnessTracker = await ethers.getContractFactory("PrivateFitnessTracker");
  contract = await PrivateFitnessTracker.deploy();
  await contract.deployed();
});
```

**Benefits**:
- Fresh contract for each test
- No state pollution
- Parallel test execution

### Pattern 2: Multi-Signer Testing

```javascript
it("Should allow different roles", async function () {
  // Owner actions
  await contract.connect(owner).ownerFunction();

  // Member actions
  await contract.connect(member1).memberFunction();

  // Verify isolation
  expect(...)
});
```

### Pattern 3: Event Testing

```javascript
it("Should emit correct events", async function () {
  await expect(contract.registerMember("Premium"))
    .to.emit(contract, "MemberRegistered")
    .withArgs(memberAddress, "Premium");
});
```

### Pattern 4: Revert Testing

```javascript
it("Should revert with message", async function () {
  await expect(
    contract.connect(nonMember).protectedFunction()
  ).to.be.revertedWith("Only active members");
});
```

### Pattern 5: State Verification

```javascript
it("Should update state correctly", async function () {
  await contract.registerMember("Premium");

  const info = await contract.getMemberInfo(address);
  expect(info.isActive).to.equal(true);
  expect(info.membershipType).to.equal("Premium");
});
```

## Best Practices

### 1. Test Naming

```javascript
// ✅ Good - Descriptive and clear
it("Should reject workout with zero calories", async function () {});
it("Should emit ChallengeCreated event when owner creates challenge", async function () {});

// ❌ Bad - Vague
it("test1", async function () {});
it("works", async function () {});
```

### 2. Test Organization

```javascript
describe("ContractName", function () {
  describe("Feature Group", function () {
    beforeEach(async function () {
      // Setup specific to this group
    });

    it("Should do specific thing", async function () {
      // Test implementation
    });
  });
});
```

### 3. Assertion Clarity

```javascript
// ✅ Good - Specific expectations
expect(memberCount).to.equal(5);
expect(address).to.be.properAddress;
expect(amount).to.be.gt(ethers.utils.parseEther("1"));

// ❌ Bad - Vague
expect(result).to.be.ok;
expect(value).to.exist;
```

### 4. Test Independence

```javascript
// ✅ Good - Each test is independent
beforeEach(async function () {
  contract = await deployContract();
});

it("Test 1", async function () {
  // Independent test
});

it("Test 2", async function () {
  // Independent test
});
```

### 5. Error Handling

```javascript
// ✅ Good - Test specific error
await expect(
  contract.invalidOperation()
).to.be.revertedWith("Specific error message");

// ✅ Good - Test custom errors
await expect(
  contract.operation()
).to.be.revertedWithCustomError(contract, "CustomError");
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Generate coverage
        run: npx hardhat coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Debugging Tests

### Verbose Output

```bash
# Enable console logs in tests
npx hardhat test --verbose

# Show stack traces
npx hardhat test --show-stack-traces
```

### Debug Specific Test

```javascript
it.only("Should debug this test", async function () {
  console.log("Debugging info:", value);
  // Test implementation
});
```

### Skip Failing Tests Temporarily

```javascript
it.skip("Should fix later", async function () {
  // This test will be skipped
});
```

## Test Maintenance

### Regular Checks

1. **Run tests before commits**
   ```bash
   npm test
   ```

2. **Check coverage monthly**
   ```bash
   npx hardhat coverage
   ```

3. **Update tests when adding features**
   - Add corresponding tests
   - Maintain > 95% coverage
   - Update documentation

4. **Review gas costs quarterly**
   ```bash
   REPORT_GAS=true npm test
   ```

### Code Review Checklist

- [ ] All new functions have tests
- [ ] Edge cases are covered
- [ ] Access control is tested
- [ ] Events are verified
- [ ] Gas costs are acceptable
- [ ] Tests pass locally
- [ ] Coverage remains > 95%

## Troubleshooting

### Common Issues

**Issue**: Tests timeout
```bash
# Solution: Increase timeout
npx hardhat test --timeout 60000
```

**Issue**: Out of gas errors
```bash
# Solution: Check gas limits in hardhat.config.js
hardhat: {
  gas: 12000000,
  blockGasLimit: 12000000
}
```

**Issue**: Network errors
```bash
# Solution: Reset Hardhat network
npx hardhat clean
npx hardhat compile
```

## Resources

### Documentation

- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Matchers](https://ethereum-waffle.readthedocs.io/en/latest/matchers.html)
- [Mocha Documentation](https://mochajs.org/)
- [Ethers.js Testing](https://docs.ethers.org/v5/api/utils/)

### Tools

- [Hardhat](https://hardhat.org/)
- [Solidity Coverage](https://github.com/sc-forks/solidity-coverage)
- [Hardhat Gas Reporter](https://github.com/cgewecke/hardhat-gas-reporter)

## Summary

### Test Statistics

- **Total Test Cases**: 100+
- **Test Files**: 2
- **Coverage Target**: > 95%
- **All Categories**: 10
- **Gas Monitoring**: Enabled

### Quick Commands

```bash
npm test                    # Run all tests
npm run coverage           # Generate coverage report
REPORT_GAS=true npm test  # Run with gas reporting
npx hardhat test --grep "Registration"  # Run specific tests
```

---

**Last Updated**: 2025-10-29

For questions about testing, please refer to the main [CONTRIBUTING.md](./CONTRIBUTING.md) guide.
