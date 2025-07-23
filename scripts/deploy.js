const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== Privacy Fitness Tracker Deployment ===\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);

  // Check if balance is sufficient
  if (balance.lt(hre.ethers.utils.parseEther("0.01"))) {
    console.warn("\n⚠️  Warning: Account balance is low. Deployment may fail.");
  }

  console.log("\n--- Compiling Contracts ---");
  await hre.run("compile");

  console.log("\n--- Deploying PrivateFitnessTracker ---");
  const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");

  console.log("Deployment in progress...");
  const contract = await PrivateFitnessTracker.deploy();

  console.log("Waiting for deployment confirmation...");
  await contract.deployed();

  console.log("\n✓ Contract deployed successfully!");
  console.log("Contract address:", contract.address);
  console.log("Deployer address:", deployer.address);
  console.log("Transaction hash:", contract.deployTransaction.hash);
  console.log("Block number:", contract.deployTransaction.blockNumber);

  // Get gas used
  const receipt = await contract.deployTransaction.wait();
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log("Effective gas price:", hre.ethers.utils.formatUnits(receipt.effectiveGasPrice, "gwei"), "gwei");

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress: contract.address,
    deployerAddress: deployer.address,
    transactionHash: contract.deployTransaction.hash,
    blockNumber: contract.deployTransaction.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    effectiveGasPrice: receipt.effectiveGasPrice.toString(),
    deploymentDate: new Date().toISOString(),
    contractName: "PrivateFitnessTracker",
    solcVersion: "0.8.24"
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to JSON file
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n--- Deployment Information Saved ---");
  console.log("File:", deploymentFile);

  // Verify contract state
  console.log("\n--- Verifying Contract State ---");
  const owner = await contract.owner();
  const totalMembers = await contract.totalMembers();
  const challengeCount = await contract.challengeCount();

  console.log("Owner:", owner);
  console.log("Total Members:", totalMembers.toString());
  console.log("Challenge Count:", challengeCount.toString());

  // Display next steps
  console.log("\n=== Next Steps ===");
  console.log("1. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contract.address}`);
  console.log("\n2. Interact with contract:");
  console.log(`   npx hardhat run scripts/interact.js --network ${hre.network.name}`);
  console.log("\n3. Update frontend configuration:");
  console.log(`   Contract Address: ${contract.address}`);
  console.log(`   Network: ${hre.network.name}`);

  // Generate etherscan link if on supported network
  if (hre.network.name === "sepolia") {
    console.log("\n=== Etherscan Links ===");
    console.log("Contract:", `https://sepolia.etherscan.io/address/${contract.address}`);
    console.log("Transaction:", `https://sepolia.etherscan.io/tx/${contract.deployTransaction.hash}`);
  }

  console.log("\n=== Deployment Complete ===\n");

  return contract.address;
}

// Execute deployment
main()
  .then((address) => {
    console.log("Deployment successful. Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
