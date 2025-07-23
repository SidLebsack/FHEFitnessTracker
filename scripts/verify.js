const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== Contract Verification ===\n");

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found!");
    console.error(`Expected file: ${deploymentFile}`);
    console.error("\nPlease deploy the contract first:");
    console.error(`npx hardhat run scripts/deploy.js --network ${hre.network.name}`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log("Network:", deploymentInfo.network);
  console.log("Contract Address:", deploymentInfo.contractAddress);
  console.log("Deployer:", deploymentInfo.deployerAddress);
  console.log("Deployment Date:", deploymentInfo.deploymentDate);

  // Verify contract has code
  console.log("\n--- Checking Contract Code ---");
  const code = await hre.ethers.provider.getCode(deploymentInfo.contractAddress);

  if (code === "0x") {
    console.error("❌ No contract code found at address:", deploymentInfo.contractAddress);
    console.error("The contract may not be deployed or the network is incorrect.");
    process.exit(1);
  }

  console.log("✓ Contract code verified at address");

  // Verify contract on Etherscan (if supported network)
  if (hre.network.name === "sepolia") {
    console.log("\n--- Verifying on Etherscan ---");

    try {
      console.log("Submitting contract for verification...");
      console.log("This may take a few moments...\n");

      await hre.run("verify:verify", {
        address: deploymentInfo.contractAddress,
        constructorArguments: []
      });

      console.log("\n✓ Contract verified on Etherscan successfully!");
      console.log("\nEtherscan URL:", `https://sepolia.etherscan.io/address/${deploymentInfo.contractAddress}#code`);

      // Update deployment info with verification status
      deploymentInfo.verified = true;
      deploymentInfo.verificationDate = new Date().toISOString();
      deploymentInfo.etherscanUrl = `https://sepolia.etherscan.io/address/${deploymentInfo.contractAddress}`;

      fs.writeFileSync(
        deploymentFile,
        JSON.stringify(deploymentInfo, null, 2)
      );

      console.log("\n✓ Deployment information updated with verification status");

    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("\n✓ Contract is already verified on Etherscan");
        console.log("Etherscan URL:", `https://sepolia.etherscan.io/address/${deploymentInfo.contractAddress}#code`);
      } else {
        console.error("\n❌ Verification failed:");
        console.error(error.message);

        console.log("\n--- Manual Verification ---");
        console.log("You can verify manually at:");
        console.log(`https://sepolia.etherscan.io/verifyContract?a=${deploymentInfo.contractAddress}`);
        console.log("\nContract Details:");
        console.log("- Compiler Version: v0.8.24");
        console.log("- Optimization: Enabled (200 runs)");
        console.log("- Constructor Arguments: (none)");
      }
    }
  } else {
    console.log("\n--- Network Verification Status ---");
    console.log(`Network '${hre.network.name}' does not support Etherscan verification.`);
    console.log("Contract deployed and code verified on-chain.");
  }

  // Verify contract functionality
  console.log("\n--- Verifying Contract Functionality ---");

  const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");
  const contract = PrivateFitnessTracker.attach(deploymentInfo.contractAddress);

  try {
    const owner = await contract.owner();
    const totalMembers = await contract.totalMembers();
    const challengeCount = await contract.challengeCount();

    console.log("✓ Contract owner:", owner);
    console.log("✓ Total members:", totalMembers.toString());
    console.log("✓ Challenge count:", challengeCount.toString());

    console.log("\n✓ Contract is functioning correctly");

  } catch (error) {
    console.error("❌ Error reading contract state:");
    console.error(error.message);
    process.exit(1);
  }

  // Display contract ABI location
  console.log("\n--- Contract ABI ---");
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "PrivateFitnessTracker.sol", "PrivateFitnessTracker.json");

  if (fs.existsSync(artifactPath)) {
    console.log("ABI location:", artifactPath);
    console.log("\nYou can use this ABI for frontend integration.");
  }

  console.log("\n=== Verification Complete ===\n");
}

// Execute verification
main()
  .then(() => {
    console.log("Verification successful");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Verification failed:");
    console.error(error);
    process.exit(1);
  });
