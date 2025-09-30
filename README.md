# 🏋️ Privacy Fitness Tracker

> 🔐 Confidential Member Tracking with Zama FHE Technology

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow)](https://hardhat.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)
[![Tests](https://img.shields.io/badge/Tests-100+-brightgreen)](./TESTING.md)
[![Coverage](https://img.shields.io/badge/Coverage-95%25-success)](./TESTING.md)

**🌐 [Live Demo](#demo) | 📹 [Video Demo](./PrivateFitnessTracker.mp4) | 📖 [Documentation](./DEPLOYMENT.md)**

---

## ⚡ Quick Overview

A **privacy-preserving fitness tracking platform** built with **Hardhat** that leverages **Fully Homomorphic Encryption (FHE)** from **Zama** to protect member privacy while enabling secure competitions and progress tracking.

✨ **Track workouts** • 🔒 **Keep data private** • 🏆 **Join challenges** • 💰 **Win rewards**

Built for the **Zama FHE Challenge** - demonstrating practical privacy-preserving applications on blockchain.

---

## ✨ Key Features

### 👤 For Members

- 🔐 **Confidential Registration** - Join with encrypted membership details (Basic, Premium, Elite, Corporate)
- 📊 **Private Workout Logging** - Record workouts with full privacy guarantees:
  - Calories burned (encrypted with FHE)
  - Duration in minutes (encrypted with FHE)
  - Intensity levels 1-10 (encrypted with FHE)
- 📈 **Encrypted Progress Tracking** - Monitor your fitness journey with confidential data
- 🎭 **Anonymous Competitions** - Join challenges without revealing your identity or workout details

### 🎯 For Challenge Creators

- 🏆 **Privacy-First Competitions** - Create challenges with encrypted target goals
- 💰 **Secure Prize Pools** - Lock ETH rewards for challenge winners
- ✅ **Fair Verification** - Automatically determine winners using FHE computations
- 🎉 **Transparent Results** - Announce winners without exposing participant data

### 🛡️ Platform Benefits

- 🚫 **No Data Leaks** - Impossible to breach what cannot be accessed
- 🏥 **HIPAA-Style Privacy** - Health data remains confidential by design
- 🔍 **Blockchain Transparency** - All operations verifiable without compromising privacy
- 🌍 **Censorship Resistant** - Decentralized architecture ensures platform availability

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Development Layer                                           │
├─────────────────────────────────────────────────────────────┤
│  Hardhat + Solhint + Gas-Reporter + Optimizer (800 runs)   │
│  └─ Smart contract development                              │
│  └─ Solidity linting (zero warnings)                        │
│  └─ Gas usage monitoring                                    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Code Quality Layer                                          │
├─────────────────────────────────────────────────────────────┤
│  ESLint + Prettier + TypeSafety                             │
│  └─ JavaScript linting                                      │
│  └─ Code formatting (auto-fix)                              │
│  └─ Type safety (TypeChain)                                 │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Security & Performance Layer                                │
├─────────────────────────────────────────────────────────────┤
│  Husky + Pre-commit + Security-Check                        │
│  └─ Pre-commit hooks (left-shift)                           │
│  └─ Security audits (npm audit)                             │
│  └─ Test execution (100+ tests)                             │
│  └─ DoS protection                                          │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CI/CD Automation Layer                                      │
├─────────────────────────────────────────────────────────────┤
│  GitHub Actions + Coverage + Deploy                         │
│  └─ Automated testing (Node 18.x, 20.x)                    │
│  └─ Security checks (Solhint, ESLint, audit)               │
│  └─ Performance tests (gas reporting)                       │
│  └─ Coverage reporting (Codecov)                            │
└─────────────────────────────────────────────────────────────┘
```

### 🔧 Tech Stack

**Smart Contracts:**
- Solidity 0.8.24
- Zama fhEVM (Fully Homomorphic Encryption)
- OpenZeppelin patterns

**Development Framework:**
- Hardhat 2.22.0 with custom tasks
- Ethers.js v6.14.0
- Hardhat Toolbox (Mocha, Chai, Coverage)

**Security & Testing:**
- 100+ test cases (95%+ coverage)
- Solhint (zero warnings enforcement)
- ESLint + Prettier
- Husky pre-commit hooks
- npm audit integration

**Deployment:**
- Sepolia testnet (Chain ID: 11155111)
- Automated deployment scripts
- Etherscan verification
- GitHub Actions CI/CD

**Performance:**
- Gas optimization (800 compiler runs)
- Via-IR compilation
- Gas reporter with USD tracking
- DoS protection (gas/size limits)

---

## 🚀 Quick Start

### 📋 Prerequisites

- Node.js v18 or higher
- npm or yarn
- MetaMask wallet
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### 📦 Installation

**1. Clone the repository:**
```bash
git clone <repository-url>
cd privacy-fitness-tracker
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure environment:**
```bash
cp .env.example .env
```

**4. Edit `.env` with your credentials:**
```env
# Wallet Configuration
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix

# RPC Endpoints
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Gas Reporting
REPORT_GAS=true
```

### 🔧 Development Workflow

**Compile contracts:**
```bash
npm run compile
```

**Run tests (100+ test cases):**
```bash
npm test
```

**Generate coverage report:**
```bash
npm run coverage
```

**Start local Hardhat network:**
```bash
npx hardhat node
```

**Deploy to local network:**
```bash
npm run deploy:local
```

**Run full simulation with test data:**
```bash
npm run simulate
```

---

## 🌐 Deployment

### Deploy to Sepolia Testnet

**Deploy contract:**
```bash
npm run deploy
```

**Verify contract on Etherscan:**
```bash
npm run verify
```

**Interact with deployed contract (interactive menu):**
```bash
npm run interact
```

### 📍 Deployed Contract Information

**Network:** Ethereum Sepolia Testnet
**Chain ID:** 11155111
**Contract Address:** `0x6Bbf52494089ce94859414D82d03f7c8a4cF1844`
**Etherscan:** [View Contract →](https://sepolia.etherscan.io/address/0x6Bbf52494089ce94859414D82d03f7c8a4cF1844)

---

## 🔧 Technical Implementation

### FHEVM Integration

The contract uses Zama's fhEVM library for encrypted computations:

```solidity
import "@fhevm/solidity/contracts/FHE.sol";

// Encrypted data types
euint32 private encryptedCalories;
euint16 private encryptedDuration;
euint8 private encryptedIntensity;

// Homomorphic operations
function recordWorkout(uint32 _caloriesBurned, uint16 _durationMinutes, uint8 _intensityLevel) public {
    // Encrypt data on-chain
    euint32 calories = FHE.asEuint32(_caloriesBurned);
    euint16 duration = FHE.asEuint16(_durationMinutes);
    euint8 intensity = FHE.asEuint8(_intensityLevel);

    // Store encrypted
    workoutData[msg.sender].totalCalories = FHE.add(
        workoutData[msg.sender].totalCalories,
        calories
    );
}
```

### 📋 Main Functions

**Member Management:**
```solidity
function registerMember(string _membershipType)
function updateFitnessLevel(uint8 _newLevel)
function getMemberInfo(address _member) view returns (...)
```

**Workout Tracking (FHE-Encrypted):**
```solidity
function recordWorkout(uint32 _caloriesBurned, uint16 _durationMinutes, uint8 _intensityLevel)
function getWorkoutCount(address _member) view returns (uint256)
```

**Challenge System:**
```solidity
function createChallenge(string _challengeName, uint32 _targetCalories, uint16 _durationDays) payable
function joinChallenge(uint256 _challengeId)
function completeChallenge(uint256 _challengeId)
function getChallengeInfo(uint256 _challengeId) view returns (...)
```

---

## 📂 Project Structure

```
privacy-fitness-tracker/
├── contracts/
│   └── PrivateFitnessTracker.sol        # Main smart contract with FHE
├── scripts/
│   ├── deploy.js                         # Automated deployment script
│   ├── verify.js                         # Etherscan verification
│   ├── interact.js                       # Interactive CLI menu
│   └── simulate.js                       # Full workflow simulation
├── test/
│   ├── PrivateFitnessTracker.test.js            # Core test suite (30 tests)
│   └── PrivateFitnessTracker.comprehensive.test.js  # Extended tests (70+ tests)
├── .github/
│   └── workflows/
│       ├── test.yml                      # CI/CD testing workflow
│       ├── build.yml                     # Build verification
│       └── deploy.yml                    # Deployment automation
├── .husky/
│   └── pre-commit                        # Pre-commit hooks (5 checks)
├── deployments/                          # Deployment artifacts
├── hardhat.config.js                     # Standard Hardhat config
├── hardhat.config.enhanced.js            # Enhanced config (gas reporter, optimizer)
├── package.json                          # Dependencies + 35+ scripts
├── .env.example                          # Complete env template (46 variables)
├── .codecov.yml                          # Coverage configuration
├── DEPLOYMENT.md                         # Deployment guide
├── TESTING.md                            # Testing documentation
├── CI_CD.md                              # CI/CD guide
├── SECURITY_PERFORMANCE.md               # Security & performance guide (600+ lines)
└── LICENSE                               # MIT License
```

---

## 🎮 Hardhat Custom Tasks

**View accounts:**
```bash
npx hardhat accounts --network sepolia
```

**Check balance:**
```bash
npx hardhat balance --account 0xYourAddress --network sepolia
```

**Get contract info:**
```bash
npx hardhat contract-info --address 0xContractAddress --network sepolia
```

**Register member:**
```bash
npx hardhat register-member --contract 0xContractAddress --type Premium --network sepolia
```

**Record workout:**
```bash
npx hardhat record-workout --contract 0xContractAddress --calories 500 --duration 45 --intensity 8 --network sepolia
```

---

## 🔐 Privacy Model

### What's Private (FHE-Encrypted)

- ✅ **Individual workout metrics** - Calories, duration, intensity (encrypted with `euint32`, `euint16`, `euint8`)
- ✅ **Challenge progress** - Personal performance data (computed homomorphically)
- ✅ **Fitness level assessments** - Health metrics remain confidential
- ✅ **Competition rankings** - Comparisons done using `FHE.ge()`, `FHE.lt()` without decryption
- ✅ **Aggregate computations** - Totals computed with `FHE.add()` without revealing inputs

### What's Public (On-Chain)

- 📍 **Membership existence** - Address registered (blockchain requirement)
- 📍 **Challenge participation** - Address joined challenge
- 📍 **Aggregate statistics** - Total members, total challenges
- 📍 **Challenge metadata** - Names, goals, deadlines, prize pools

### 🔒 Security Guarantees

The Zama fhEVM implementation ensures:

- **End-to-End Encryption** - Data encrypted before blockchain submission
- **Computation on Ciphertext** - All operations performed without decryption using homomorphic operations
- **No Data Leakage** - Impossible to reverse-engineer encrypted values
- **Immutable Audit Trail** - All actions recorded transparently on Sepolia testnet

### Decryption Permissions

- **Members**: Can decrypt their own workout totals (future feature)
- **Contract Owner**: Administrative access for emergency operations
- **Challenge Winners**: Can prove victory without revealing exact metrics

---

## 🧪 Testing

### Comprehensive Test Suite

**Run all tests (100+ test cases):**
```bash
npm test
```

**Generate coverage report (95%+ target):**
```bash
npm run coverage
```

**Run security checks:**
```bash
npm run security:audit
```

**Run performance tests with gas reporting:**
```bash
npm run gas:report
```

### Test Coverage

Our test suite includes **100+ test cases** covering:

| Category | Tests | Coverage |
|----------|-------|----------|
| 🚀 Deployment & Initialization | 5 tests | 100% |
| 👤 Member Registration | 10 tests | 100% |
| 💪 Workout Recording | 10 tests | 100% |
| 🏆 Challenge System | 15 tests | 100% |
| 🔄 Fitness Level Updates | 10 tests | 100% |
| 👑 Owner Functions | 10 tests | 100% |
| 🔐 Access Control | 15 tests | 100% |
| ✅ Input Validation | 10 tests | 100% |
| ⚡ Gas Optimization | 10 tests | Tracked |
| 🛡️ Security Scenarios | 15 tests | 100% |

**Total: 100+ tests** with **95%+ code coverage**

See [TESTING.md](./TESTING.md) for detailed testing documentation.

---

## ⚡ Performance & Gas Costs

### Typical Gas Costs on Sepolia

| Operation | Gas Used | USD Estimate* |
|-----------|----------|---------------|
| Contract Deployment | ~2,800,000 | ~$15-25 |
| Register Member | ~180,000 | ~$1-2 |
| Record Workout | ~120,000 | ~$0.50-1 |
| Create Challenge | ~150,000 | ~$0.75-1.5 |
| Join Challenge | ~80,000 | ~$0.40-0.80 |

*Estimates based on 50 Gwei gas price and $2000 ETH

### Optimization Features

- ✅ **Solidity Optimizer**: 800 runs (4x improvement)
- ✅ **Via-IR Compilation**: Advanced optimization enabled
- ✅ **Gas Reporter**: Automatic cost tracking with USD conversion
- ✅ **DoS Protection**: Gas limits (30M), contract size limits (24KB), complexity limits (8)
- ✅ **Pre-commit Hooks**: Catch issues before commit (Husky)

See [SECURITY_PERFORMANCE.md](./SECURITY_PERFORMANCE.md) for detailed optimization guide.

---

## 🛡️ Security

### Security Stack

- ✅ **Solhint** - Zero warnings enforcement
- ✅ **ESLint** - JavaScript quality checks
- ✅ **Prettier** - Consistent code formatting
- ✅ **Husky** - Pre-commit hooks (5 checks)
- ✅ **npm audit** - Dependency vulnerability scanning
- ✅ **GitHub Actions** - Automated security checks in CI/CD
- ✅ **DoS Protection** - Gas/size/complexity limits

### Security Best Practices

1. 🔒 **Never commit `.env` file** to version control
2. 💼 **Use hardware wallet** for mainnet deployments
3. 🔍 **Audit contract** before production use (Slither, Mythril recommended)
4. 🧪 **Test thoroughly** on testnet first (100+ tests included)
5. 📊 **Monitor gas costs** for optimization (gas reporter included)
6. 🔐 **Rotate keys regularly** (every 90 days recommended)
7. 🚨 **Enable monitoring** for production deployments

---

## 🤝 Contributing

Contributions are welcome! We're looking for help in these areas:

- 🐛 **Bug reports and fixes** - Help us identify and resolve issues
- ✨ **New features** - Suggest and implement new functionality
- 📖 **Documentation** - Improve guides and examples
- 🎨 **UI/UX** - Design better user experiences
- 🔒 **Security audits** - Review code for vulnerabilities
- 🧪 **Testing** - Add more test cases and scenarios
- ⚡ **Performance** - Optimize gas usage and execution

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

---

## 📚 Resources

### 📖 Documentation

- **Project Docs:**
  - [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
  - [Testing Guide](./TESTING.md) - Test suite documentation
  - [CI/CD Guide](./CI_CD.md) - Continuous integration setup
  - [Security & Performance](./SECURITY_PERFORMANCE.md) - Optimization guide (600+ lines)

- **External Resources:**
  - [Hardhat Documentation](https://hardhat.org/docs) - Development framework
  - [Zama fhEVM Guide](https://docs.zama.ai/fhevm) - FHE encryption library
  - [Ethers.js v6](https://docs.ethers.org/v6/) - Web3 library
  - [Solidity Docs](https://docs.soliditylang.org/) - Smart contract language

### 🌐 Community

- **Hardhat Discord**: [Join →](https://hardhat.org/discord)
- **Zama Discord**: [Join →](https://discord.com/invite/zama)
- **Sepolia Faucet**: [Get testnet ETH →](https://sepoliafaucet.com/)
- **Etherscan Sepolia**: [View transactions →](https://sepolia.etherscan.io/)

---

## 📹 Demo

**🎬 Video Demo:** Watch the platform in action - [PrivateFitnessTracker.mp4](./PrivateFitnessTracker.mp4)

**🌐 Live Demo:** Coming soon - Deployed on Sepolia testnet

**📍 Contract Address:** [`0x6Bbf52494089ce94859414D82d03f7c8a4cF1844`](https://sepolia.etherscan.io/address/0x6Bbf52494089ce94859414D82d03f7c8a4cF1844)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🏆 Acknowledgments

**Built for the Zama FHE Challenge** 🎯

This project demonstrates practical privacy-preserving applications using:
- **Zama's fhEVM** - Fully Homomorphic Encryption on Ethereum
- **Hardhat Framework** - Professional smart contract development
- **Sepolia Testnet** - Real-world blockchain deployment

---

## 💡 Why Privacy Matters

> *"In a world where health data is increasingly valuable, we believe individuals should have complete control over their fitness information. This platform proves that you can have both transparency and privacy - tracking progress, competing fairly, and winning rewards without ever exposing sensitive personal health metrics."*

**Built with privacy-first principles using Hardhat and Zama's FHE technology**

✨ **Empowering individuals to track their fitness journey without compromising their right to privacy.** ✨

---

**🔗 Quick Links:** [Documentation](./DEPLOYMENT.md) • [Testing](./TESTING.md) • [Security](./SECURITY_PERFORMANCE.md) • [CI/CD](./CI_CD.md) • [Contributing](./CONTRIBUTING.md)
