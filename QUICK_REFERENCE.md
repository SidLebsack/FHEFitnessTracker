# Quick Reference Guide

## Essential Commands

### Setup
```bash
npm install                           # Install dependencies
cp .env.example .env                  # Create environment file
npm run compile                       # Compile contracts
```

### Testing
```bash
npm test                              # Run all tests
npx hardhat test                      # Run tests with Hardhat
npx hardhat coverage                  # Generate coverage report
```

### Local Development
```bash
npx hardhat node                      # Start local node
npm run deploy:local                  # Deploy to local network
npm run simulate                      # Run full simulation
```

### Deployment
```bash
npm run deploy                        # Deploy to Sepolia
npm run verify                        # Verify on Etherscan
npm run interact                      # Interactive interface
```

### Hardhat Tasks
```bash
npx hardhat accounts --network sepolia
npx hardhat balance --account 0xAddress --network sepolia
npx hardhat contract-info --address 0xContract --network sepolia
npx hardhat register-member --contract 0xContract --type Premium --network sepolia
npx hardhat record-workout --contract 0xContract --calories 500 --duration 45 --intensity 8 --network sepolia
```

### Code Quality
```bash
npm run lint:sol                      # Lint Solidity
npm run format:sol                    # Format Solidity
npm run format:js                     # Format JavaScript
npx hardhat clean                     # Clean artifacts
```

## Contract Functions

### Member Functions
```solidity
registerMember(string _membershipType)
recordWorkout(uint32 _calories, uint16 _duration, uint8 _intensity)
updateFitnessLevel(uint8 _level)
joinChallenge(uint256 _challengeId)
```

### Owner Functions
```solidity
createChallenge(string _name, uint32 _target, uint16 _days) payable
completeChallenge(uint256 _challengeId)
deactivateMember(address _member)
changeOwner(address _newOwner)
```

### View Functions
```solidity
getMemberInfo(address _member) view
getChallengeInfo(uint256 _challengeId) view
getWorkoutSession(address _member, uint256 _sessionId) view
getCurrentWeek() view
getCurrentMonth() view
```

## Network Configuration

### Sepolia Testnet
- Chain ID: 11155111
- RPC: https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
- Explorer: https://sepolia.etherscan.io
- Faucets: https://sepoliafaucet.com/

### Contract Address
- Sepolia: `0x6Bbf52494089ce94859414D82d03f7c8a4cF1844`

## File Locations

### Important Files
- Contract: `contracts/PrivateFitnessTracker.sol`
- Deploy: `scripts/deploy.js`
- Verify: `scripts/verify.js`
- Interact: `scripts/interact.js`
- Simulate: `scripts/simulate.js`
- Tests: `test/PrivateFitnessTracker.test.js`
- Config: `hardhat.config.js`

### Generated Files
- Deployments: `deployments/*.json`
- Artifacts: `artifacts/contracts/`
- ABI: `artifacts/contracts/PrivateFitnessTracker.sol/PrivateFitnessTracker.json`

## Environment Variables

```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=optional
REPORT_GAS=false
```

## Common Issues

### Deployment Fails
```bash
# Check balance
npx hardhat balance --account YOUR_ADDRESS --network sepolia

# Get testnet ETH from faucet
# Visit: https://sepoliafaucet.com/
```

### Verification Fails
```bash
# Wait a few minutes after deployment
# Then retry: npm run verify
```

### Transaction Reverts
```bash
# Check if you're registered as member
# Verify input parameters are valid
# Ensure correct network connection
```

### Gas Estimation Fails
```bash
# Manually set gas limit in hardhat.config.js
# Or check contract state
```

## Gas Costs (Sepolia)

- Deploy Contract: ~3,000,000 gas
- Register Member: ~200,000 gas
- Record Workout: ~150,000 gas
- Create Challenge: ~180,000 gas
- Join Challenge: ~100,000 gas

## Best Practices

1. **Always test locally first**
   ```bash
   npm run simulate
   ```

2. **Verify contracts after deployment**
   ```bash
   npm run verify
   ```

3. **Never commit .env file**
   ```bash
   # Already in .gitignore
   ```

4. **Use hardware wallet for mainnet**
   ```bash
   # Configure Ledger/Trezor in hardhat.config.js
   ```

5. **Monitor gas prices**
   ```bash
   # Check https://etherscan.io/gastracker
   ```

## Support Links

- Hardhat: https://hardhat.org/docs
- Zama fhEVM: https://docs.zama.ai/fhevm
- Ethers.js: https://docs.ethers.org/v5/
- Solidity: https://docs.soliditylang.org

## Quick Workflow

```bash
# 1. Setup
npm install
cp .env.example .env
# Edit .env

# 2. Test Locally
npm run compile
npm test
npm run simulate

# 3. Deploy to Testnet
npm run deploy

# 4. Verify
npm run verify

# 5. Interact
npm run interact
```

---

**For detailed information, see:**
- Full Documentation: `README.md`
- Deployment Guide: `DEPLOYMENT.md`
- Contributing Guide: `CONTRIBUTING.md`
- Project Summary: `PROJECT_SUMMARY.md`
