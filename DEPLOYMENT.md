# Privacy Fitness Tracker - Deployment Guide

## Overview

This document provides comprehensive deployment information for the Privacy Fitness Tracker smart contract built with Hardhat and Zama's FHE technology.

## Contract Information

### Smart Contract Details

- **Contract Name**: PrivateFitnessTracker
- **Solidity Version**: 0.8.24
- **License**: MIT
- **Optimizer**: Enabled (200 runs)
- **Deployment Framework**: Hardhat

### Contract Features

- Fully Homomorphic Encryption (FHE) for workout data privacy
- Member registration and management
- Encrypted workout session tracking
- Fitness challenge creation and participation
- Privacy-preserving progress tracking

## Deployment on Sepolia Testnet

### Network Information

- **Network Name**: Ethereum Sepolia
- **Chain ID**: 11155111
- **RPC URL**: https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
- **Block Explorer**: https://sepolia.etherscan.io

### Deployed Contract

**Contract Address**: `0x6Bbf52494089ce94859414D82d03f7c8a4cF1844`

**Etherscan Links**:
- Contract: https://sepolia.etherscan.io/address/0x6Bbf52494089ce94859414D82d03f7c8a4cF1844
- Verified Code: https://sepolia.etherscan.io/address/0x6Bbf52494089ce94859414D82d03f7c8a4cF1844#code

### Deployment Details

- **Deployer Address**: Will be set during deployment
- **Deployment Date**: Check Etherscan for exact timestamp
- **Transaction Hash**: Available in `deployments/sepolia.json` after deployment
- **Block Number**: Available in `deployments/sepolia.json` after deployment

## Prerequisites

### Required Tools

1. **Node.js** (v16 or higher)
   ```bash
   node --version
   ```

2. **npm** or **yarn**
   ```bash
   npm --version
   ```

3. **Git**
   ```bash
   git --version
   ```

### Environment Setup

1. Clone or navigate to the project directory:
   ```bash
   cd privacy-fitness-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your credentials:
   ```env
   PRIVATE_KEY=your_wallet_private_key_here
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

### Obtaining Testnet ETH

Get Sepolia testnet ETH from these faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

## Deployment Process

### Step 1: Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### Step 2: Deploy to Sepolia

```bash
npm run deploy
# or
npx hardhat run scripts/deploy.js --network sepolia
```

This script will:
- Display deployer account and balance
- Compile contracts
- Deploy the PrivateFitnessTracker contract
- Save deployment information to `deployments/sepolia.json`
- Display contract address and Etherscan links

### Step 3: Verify Contract on Etherscan

```bash
npm run verify
# or
npx hardhat run scripts/verify.js --network sepolia
```

This script will:
- Load deployment information
- Verify contract code on Etherscan
- Confirm contract functionality
- Update deployment file with verification status

Alternative manual verification:
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Step 4: Interact with Deployed Contract

```bash
npm run interact
# or
npx hardhat run scripts/interact.js --network sepolia
```

Available interactions:
1. Register as member
2. Record workout
3. Get member info
4. Create challenge (owner only)
5. Join challenge
6. Get challenge info
7. Update fitness level
8. Display contract stats

## Local Development & Testing

### Start Local Hardhat Node

```bash
npx hardhat node
```

This starts a local Ethereum network at `http://127.0.0.1:8545`

### Deploy Locally

In a new terminal:
```bash
npm run deploy:local
# or
npx hardhat run scripts/deploy.js --network localhost
```

### Run Simulation

Test full contract functionality with simulated data:
```bash
npm run simulate
# or
npx hardhat run scripts/simulate.js --network localhost
```

The simulation will:
- Deploy the contract
- Register 4 members
- Record 8 workout sessions
- Create 3 challenges
- Have members join challenges
- Update fitness levels
- Display comprehensive statistics

## Hardhat Tasks

### Built-in Tasks

List all accounts:
```bash
npx hardhat accounts --network sepolia
```

Check account balance:
```bash
npx hardhat balance --account 0xYourAddress --network sepolia
```

Get contract information:
```bash
npx hardhat contract-info --address 0xContractAddress --network sepolia
```

### Custom Tasks

Register a member:
```bash
npx hardhat register-member --contract 0xContractAddress --type Premium --network sepolia
```

Record a workout:
```bash
npx hardhat record-workout --contract 0xContractAddress --calories 500 --duration 45 --intensity 8 --network sepolia
```

## Contract Architecture

### Main Components

1. **Member Management**
   - Registration with encrypted data
   - Membership type tracking
   - Activity status management

2. **Workout Tracking**
   - FHE-encrypted calorie data
   - FHE-encrypted duration
   - FHE-encrypted intensity levels
   - Session counting

3. **Challenge System**
   - Challenge creation with prize pools
   - Member participation
   - Encrypted progress tracking
   - Winner determination

4. **Progress Tracking**
   - Weekly statistics
   - Monthly statistics
   - Automatic period resets

### Key Functions

```solidity
// Member functions
registerMember(string _membershipType)
recordWorkout(uint32 _caloriesBurned, uint16 _durationMinutes, uint8 _intensityLevel)
updateFitnessLevel(uint8 _newLevel)

// Challenge functions (owner)
createChallenge(string _challengeName, uint32 _targetCalories, uint16 _durationDays) payable

// Challenge functions (members)
joinChallenge(uint256 _challengeId)
updateChallengeProgress(uint256 _challengeId, uint32 _calories)

// View functions
getMemberInfo(address _member) view
getChallengeInfo(uint256 _challengeId) view
getWorkoutSession(address _member, uint256 _sessionId) view
```

## Security Considerations

### FHE Privacy Guarantees

- All workout metrics encrypted on-chain
- Computations performed on ciphertext
- Only authorized users can decrypt their data
- No plaintext exposure during operations

### Best Practices

1. **Never commit `.env` file** to version control
2. **Use hardware wallet** for mainnet deployments
3. **Audit contract** before production use
4. **Test thoroughly** on testnet first
5. **Monitor gas costs** for optimization

### Access Control

- Owner-only functions: `createChallenge`, `completeChallenge`, `deactivateMember`
- Member-only functions: `recordWorkout`, `joinChallenge`, `updateFitnessLevel`
- Public view functions: `getMemberInfo`, `getChallengeInfo`

## Deployment Artifacts

### Generated Files

After deployment, the following files are created:

1. **deployments/sepolia.json**
   - Contract address
   - Deployment transaction details
   - Network information
   - Verification status

2. **artifacts/contracts/PrivateFitnessTracker.sol/PrivateFitnessTracker.json**
   - Contract ABI
   - Bytecode
   - Compiler metadata

### ABI Location

The contract ABI for frontend integration is located at:
```
artifacts/contracts/PrivateFitnessTracker.sol/PrivateFitnessTracker.json
```

Extract ABI:
```javascript
const artifact = require('./artifacts/contracts/PrivateFitnessTracker.sol/PrivateFitnessTracker.json');
const abi = artifact.abi;
```

## Frontend Integration

### Web3 Connection

```javascript
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(
  "0x6Bbf52494089ce94859414D82d03f7c8a4cF1844", // Contract address
  abi,
  signer
);
```

### Example Interactions

```javascript
// Register member
await contract.registerMember("Premium");

// Record workout
await contract.recordWorkout(500, 45, 8);

// Get member info
const info = await contract.getMemberInfo(address);
```

## Troubleshooting

### Common Issues

**Issue**: Deployment fails with "insufficient funds"
- **Solution**: Get more testnet ETH from faucets

**Issue**: Verification fails
- **Solution**: Wait a few minutes and try again. Ensure Etherscan API key is set.

**Issue**: Transaction reverts
- **Solution**: Check requirements (member registration, valid parameters)

**Issue**: Gas estimation fails
- **Solution**: Increase gas limit manually or check contract state

### Debug Commands

Check network connection:
```bash
npx hardhat console --network sepolia
```

Verify deployment file exists:
```bash
cat deployments/sepolia.json
```

Test contract compilation:
```bash
npx hardhat clean
npx hardhat compile
```

## Gas Optimization

### Typical Gas Costs (Sepolia)

- Contract Deployment: ~3,000,000 gas
- Register Member: ~200,000 gas
- Record Workout: ~150,000 gas
- Create Challenge: ~180,000 gas
- Join Challenge: ~100,000 gas

### Optimization Tips

1. Use `calldata` instead of `memory` for external functions
2. Batch operations when possible
3. Use events instead of storage for historical data
4. Optimize loop iterations

## Support & Resources

### Documentation

- Hardhat: https://hardhat.org/docs
- Zama fhEVM: https://docs.zama.ai/fhevm
- Ethers.js: https://docs.ethers.org/v5/

### Community

- GitHub Issues: Report bugs and request features
- Hardhat Discord: https://hardhat.org/discord
- Zama Discord: https://discord.com/invite/zama

## License

This project is licensed under the MIT License.

## Changelog

### Version 1.0.0
- Initial deployment on Sepolia testnet
- Core FHE functionality implemented
- Member registration and workout tracking
- Challenge system with prize pools
- Hardhat development framework setup

---

**Last Updated**: 2025-10-29

For questions or issues, please refer to the project documentation or create an issue on GitHub.
