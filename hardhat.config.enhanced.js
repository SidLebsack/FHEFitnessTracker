require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

// Custom Hardhat Tasks
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  console.log("\n=== Available Accounts ===");
  for (const account of accounts) {
    const balance = await hre.ethers.provider.getBalance(account.address);
    console.log(`${account.address} - Balance: ${hre.ethers.formatEther(balance)} ETH`);
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.account);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
  });

task("contract-info", "Get deployed contract information")
  .addParam("address", "The contract address")
  .setAction(async (taskArgs, hre) => {
    const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");
    const contract = PrivateFitnessTracker.attach(taskArgs.address);

    console.log("\n=== Contract Information ===");
    console.log(`Address: ${taskArgs.address}`);
    console.log(`Owner: ${await contract.owner()}`);
    console.log(`Total Members: ${await contract.totalMembers()}`);
    console.log(`Challenge Count: ${await contract.challengeCount()}`);
  });

task("register-member", "Register a new fitness club member")
  .addParam("contract", "The contract address")
  .addParam("type", "Membership type (Basic, Premium, Elite, Corporate)")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");
    const contract = PrivateFitnessTracker.attach(taskArgs.contract);

    console.log(`\nRegistering member with ${taskArgs.type} membership...`);
    const tx = await contract.registerMember(taskArgs.type);
    const receipt = await tx.wait();

    console.log(`✓ Member registered successfully!`);
    console.log(`Transaction hash: ${receipt.hash}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  });

task("record-workout", "Record a workout session")
  .addParam("contract", "The contract address")
  .addParam("calories", "Calories burned")
  .addParam("duration", "Duration in minutes")
  .addParam("intensity", "Intensity level (1-10)")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");
    const contract = PrivateFitnessTracker.attach(taskArgs.contract);

    console.log(`\nRecording workout...`);
    console.log(`Calories: ${taskArgs.calories}, Duration: ${taskArgs.duration}min, Intensity: ${taskArgs.intensity}/10`);

    const tx = await contract.recordWorkout(
      taskArgs.calories,
      taskArgs.duration,
      taskArgs.intensity
    );
    const receipt = await tx.wait();

    console.log(`✓ Workout recorded successfully!`);
    console.log(`Transaction hash: ${receipt.hash}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,  // Higher runs for frequently called functions
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf"
          }
        }
      },
      viaIR: true,  // Enable IR-based code generator for better optimization
      evmVersion: "cancun",  // Latest EVM version
      metadata: {
        bytecodeHash: "ipfs",
        appendCBOR: true
      },
      outputSelection: {
        "*": {
          "*": [
            "abi",
            "evm.bytecode",
            "evm.deployedBytecode",
            "evm.methodIdentifiers",
            "metadata"
          ]
        }
      }
    }
  },

  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: false,  // Security: enforce size limits
      gas: "auto",
      gasPrice: "auto",
      blockGasLimit: 30000000,
      mining: {
        auto: true,
        interval: 0
      },
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
        accountsBalance: "10000000000000000000000"  // 10000 ETH
      }
    },

    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      timeout: 60000
    },

    // Ethereum Sepolia testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
      gas: "auto",
      timeout: 60000,
      httpHeaders: {}
    },

    // Zama fhEVM devnet
    zamaDevnet: {
      url: process.env.ZAMA_RPC_URL || "https://devnet.zama.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8009,
      gasPrice: "auto",
      timeout: 60000
    }
  },

  // Etherscan verification
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    },
    customChains: []
  },

  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    outputFile: process.env.GAS_REPORT_FILE || "gas-report.txt",
    noColors: false,
    showTimeSpent: true,
    showMethodSig: true,
    excludeContracts: [],
    src: "./contracts",
    // Performance optimization tracking
    reportPureAndViewMethods: true,
    // DoS protection: track expensive operations
    onlyCalledMethods: true
  },

  // Code coverage configuration
  coverage: {
    skipFiles: [
      "test/",
      "scripts/"
    ],
    // Security: ensure all paths are covered
    measureFunctionCoverage: true,
    measureStatementCoverage: true,
    measureBranchCoverage: true,
    measureLineCoverage: true
  },

  // Path configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  // Mocha test configuration
  mocha: {
    timeout: 40000,
    bail: false,  // Continue running tests after failure
    allowUncaught: false,
    reporter: "spec",
    slow: 300
  },

  // Type generation
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: []
  },

  // Security and performance settings
  security: {
    // DoS protection settings
    maxContractSize: 24576,  // 24KB limit
    maxGasLimit: 30000000,
    // Rate limiting for tests
    testConcurrency: 1
  }
};
