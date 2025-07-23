const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log("\n=== Privacy Fitness Tracker - Contract Interaction ===\n");

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found!");
    console.error(`Expected file: ${deploymentFile}`);
    console.error(`\nPlease deploy the contract first with:`);
    console.error(`npx hardhat run scripts/deploy.js --network ${hre.network.name}`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log("Network:", deploymentInfo.network);
  console.log("Contract Address:", deploymentInfo.contractAddress);

  // Get contract instance
  const [signer] = await hre.ethers.getSigners();
  console.log("Interacting with account:", signer.address);

  const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");
  const contract = PrivateFitnessTracker.attach(deploymentInfo.contractAddress);

  // Display contract stats
  await displayContractStats(contract);

  // Interactive menu
  let running = true;
  while (running) {
    console.log("\n=== Available Actions ===");
    console.log("1. Register as member");
    console.log("2. Record workout");
    console.log("3. Get member info");
    console.log("4. Create challenge (owner only)");
    console.log("5. Join challenge");
    console.log("6. Get challenge info");
    console.log("7. Update fitness level");
    console.log("8. Display contract stats");
    console.log("9. Exit");

    const choice = await question("\nSelect an action (1-9): ");

    try {
      switch (choice.trim()) {
        case "1":
          await registerMember(contract, signer);
          break;
        case "2":
          await recordWorkout(contract, signer);
          break;
        case "3":
          await getMemberInfo(contract, signer);
          break;
        case "4":
          await createChallenge(contract, signer);
          break;
        case "5":
          await joinChallenge(contract, signer);
          break;
        case "6":
          await getChallengeInfo(contract);
          break;
        case "7":
          await updateFitnessLevel(contract, signer);
          break;
        case "8":
          await displayContractStats(contract);
          break;
        case "9":
          running = false;
          console.log("\nGoodbye!");
          break;
        default:
          console.log("\n❌ Invalid choice. Please select 1-9.");
      }
    } catch (error) {
      console.error("\n❌ Error:", error.message);
    }
  }

  rl.close();
  console.log("\n=== Interaction Complete ===\n");
}

async function displayContractStats(contract) {
  console.log("\n--- Contract Statistics ---");

  const owner = await contract.owner();
  const totalMembers = await contract.totalMembers();
  const challengeCount = await contract.challengeCount();

  console.log("Owner:", owner);
  console.log("Total Members:", totalMembers.toString());
  console.log("Total Challenges:", challengeCount.toString());
}

async function registerMember(contract, signer) {
  console.log("\n--- Register Member ---");

  // Check if already registered
  const memberInfo = await contract.members(signer.address);
  if (memberInfo.isActive) {
    console.log("❌ You are already registered as a member");
    return;
  }

  console.log("Available membership types:");
  console.log("1. Basic");
  console.log("2. Premium");
  console.log("3. Elite");
  console.log("4. Corporate");

  const typeChoice = await question("Select membership type (1-4): ");

  const membershipTypes = ["Basic", "Premium", "Elite", "Corporate"];
  const membershipType = membershipTypes[parseInt(typeChoice) - 1];

  if (!membershipType) {
    console.log("❌ Invalid membership type");
    return;
  }

  console.log(`\nRegistering as ${membershipType} member...`);

  const tx = await contract.registerMember(membershipType);
  console.log("Transaction submitted:", tx.hash);

  const receipt = await tx.wait();
  console.log("✓ Registration successful!");
  console.log("Gas used:", receipt.gasUsed.toString());
}

async function recordWorkout(contract, signer) {
  console.log("\n--- Record Workout ---");

  // Check if member is registered
  const memberInfo = await contract.members(signer.address);
  if (!memberInfo.isActive) {
    console.log("❌ You must register as a member first");
    return;
  }

  const calories = await question("Calories burned: ");
  const duration = await question("Duration (minutes): ");
  const intensity = await question("Intensity level (1-10): ");

  console.log("\nRecording workout...");
  console.log(`Calories: ${calories}, Duration: ${duration}min, Intensity: ${intensity}/10`);

  const tx = await contract.recordWorkout(
    parseInt(calories),
    parseInt(duration),
    parseInt(intensity)
  );
  console.log("Transaction submitted:", tx.hash);

  const receipt = await tx.wait();
  console.log("✓ Workout recorded successfully!");
  console.log("Gas used:", receipt.gasUsed.toString());

  const sessionCount = await contract.sessionCount(signer.address);
  console.log("Total workout sessions:", sessionCount.toString());
}

async function getMemberInfo(contract, signer) {
  console.log("\n--- Member Information ---");

  const address = await question("Member address (press Enter for your address): ");
  const targetAddress = address.trim() || signer.address;

  const memberInfo = await contract.getMemberInfo(targetAddress);

  console.log("\nMember:", targetAddress);
  console.log("Active:", memberInfo.isActive);
  console.log("Membership Type:", memberInfo.membershipType);
  console.log("Join Date:", new Date(memberInfo.joinDate.toNumber() * 1000).toLocaleString());
  console.log("Workout Sessions:", memberInfo.sessions.toString());

  if (!memberInfo.isActive) {
    console.log("\n⚠️  This member is not active");
  }
}

async function createChallenge(contract, signer) {
  console.log("\n--- Create Fitness Challenge ---");

  const owner = await contract.owner();
  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    console.log("❌ Only the contract owner can create challenges");
    console.log("Owner address:", owner);
    return;
  }

  const name = await question("Challenge name: ");
  const targetCalories = await question("Target calories: ");
  const durationDays = await question("Duration (days): ");
  const prize = await question("Prize amount (ETH): ");

  console.log("\nCreating challenge...");

  const tx = await contract.createChallenge(
    name,
    parseInt(targetCalories),
    parseInt(durationDays),
    { value: hre.ethers.utils.parseEther(prize) }
  );
  console.log("Transaction submitted:", tx.hash);

  const receipt = await tx.wait();
  console.log("✓ Challenge created successfully!");
  console.log("Gas used:", receipt.gasUsed.toString());

  const challengeCount = await contract.challengeCount();
  console.log("Challenge ID:", (challengeCount.toNumber() - 1).toString());
}

async function joinChallenge(contract, signer) {
  console.log("\n--- Join Challenge ---");

  // Check if member is registered
  const memberInfo = await contract.members(signer.address);
  if (!memberInfo.isActive) {
    console.log("❌ You must register as a member first");
    return;
  }

  const challengeCount = await contract.challengeCount();
  console.log(`Available challenges: 0 to ${challengeCount.toNumber() - 1}`);

  const challengeId = await question("Challenge ID to join: ");

  console.log("\nJoining challenge...");

  const tx = await contract.joinChallenge(parseInt(challengeId));
  console.log("Transaction submitted:", tx.hash);

  const receipt = await tx.wait();
  console.log("✓ Joined challenge successfully!");
  console.log("Gas used:", receipt.gasUsed.toString());
}

async function getChallengeInfo(contract) {
  console.log("\n--- Challenge Information ---");

  const challengeCount = await contract.challengeCount();

  if (challengeCount.toNumber() === 0) {
    console.log("No challenges created yet");
    return;
  }

  const challengeId = await question(`Challenge ID (0-${challengeCount.toNumber() - 1}): `);

  const info = await contract.getChallengeInfo(parseInt(challengeId));

  console.log("\nChallenge ID:", challengeId);
  console.log("Name:", info.challengeName);
  console.log("Start Time:", new Date(info.startTime.toNumber() * 1000).toLocaleString());
  console.log("End Time:", new Date(info.endTime.toNumber() * 1000).toLocaleString());
  console.log("Prize:", hre.ethers.utils.formatEther(info.prize), "ETH");
  console.log("Active:", info.isActive);
  console.log("Participants:", info.participantCount.toString());
}

async function updateFitnessLevel(contract, signer) {
  console.log("\n--- Update Fitness Level ---");

  // Check if member is registered
  const memberInfo = await contract.members(signer.address);
  if (!memberInfo.isActive) {
    console.log("❌ You must register as a member first");
    return;
  }

  const level = await question("New fitness level (1-10): ");

  console.log("\nUpdating fitness level...");

  const tx = await contract.updateFitnessLevel(parseInt(level));
  console.log("Transaction submitted:", tx.hash);

  const receipt = await tx.wait();
  console.log("✓ Fitness level updated successfully!");
  console.log("Gas used:", receipt.gasUsed.toString());
}

// Execute interaction
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });
