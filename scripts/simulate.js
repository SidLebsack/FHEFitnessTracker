const hre = require("hardhat");

async function main() {
  console.log("\n=== Privacy Fitness Tracker - Simulation Mode ===\n");

  console.log("Network:", hre.network.name);

  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.warn("⚠️  Warning: Simulation is designed for local networks.");
    console.warn("Current network:", hre.network.name);
    console.warn("Consider running: npx hardhat node");
  }

  // Get signers
  const [owner, member1, member2, member3, member4] = await hre.ethers.getSigners();

  console.log("\n--- Test Accounts ---");
  console.log("Owner:", owner.address);
  console.log("Member 1:", member1.address);
  console.log("Member 2:", member2.address);
  console.log("Member 3:", member3.address);
  console.log("Member 4:", member4.address);

  // Deploy contract
  console.log("\n--- Deploying Contract ---");
  const PrivateFitnessTracker = await hre.ethers.getContractFactory("PrivateFitnessTracker");
  const contract = await PrivateFitnessTracker.deploy();
  await contract.deployed();

  console.log("✓ Contract deployed at:", contract.address);
  console.log("✓ Owner:", await contract.owner());

  // Simulate member registrations
  console.log("\n--- Simulating Member Registrations ---");

  const membershipTypes = ["Basic", "Premium", "Elite", "Premium"];
  const members = [member1, member2, member3, member4];

  for (let i = 0; i < members.length; i++) {
    console.log(`\nRegistering Member ${i + 1} (${membershipTypes[i]})...`);

    const tx = await contract.connect(members[i]).registerMember(membershipTypes[i]);
    const receipt = await tx.wait();

    console.log(`✓ Member ${i + 1} registered`);
    console.log(`  Address: ${members[i].address}`);
    console.log(`  Type: ${membershipTypes[i]}`);
    console.log(`  Gas used: ${receipt.gasUsed.toString()}`);
  }

  const totalMembers = await contract.totalMembers();
  console.log(`\n✓ Total members registered: ${totalMembers}`);

  // Simulate workout recordings
  console.log("\n--- Simulating Workout Sessions ---");

  const workouts = [
    { member: member1, calories: 450, duration: 45, intensity: 7 },
    { member: member1, calories: 320, duration: 30, intensity: 6 },
    { member: member2, calories: 580, duration: 60, intensity: 8 },
    { member: member2, calories: 420, duration: 40, intensity: 7 },
    { member: member2, calories: 380, duration: 35, intensity: 6 },
    { member: member3, calories: 650, duration: 70, intensity: 9 },
    { member: member3, calories: 520, duration: 50, intensity: 8 },
    { member: member4, calories: 400, duration: 40, intensity: 7 },
  ];

  let totalWorkouts = 0;
  for (const workout of workouts) {
    totalWorkouts++;

    console.log(`\nWorkout #${totalWorkouts}:`);
    console.log(`  Member: ${workout.member.address.slice(0, 10)}...`);
    console.log(`  Calories: ${workout.calories}, Duration: ${workout.duration}min, Intensity: ${workout.intensity}/10`);

    const tx = await contract
      .connect(workout.member)
      .recordWorkout(workout.calories, workout.duration, workout.intensity);

    const receipt = await tx.wait();
    console.log(`  ✓ Recorded (Gas: ${receipt.gasUsed.toString()})`);
  }

  console.log(`\n✓ Total workouts simulated: ${totalWorkouts}`);

  // Display member statistics
  console.log("\n--- Member Statistics ---");

  for (let i = 0; i < members.length; i++) {
    const info = await contract.getMemberInfo(members[i].address);
    const sessionCount = await contract.sessionCount(members[i].address);

    console.log(`\nMember ${i + 1}:`);
    console.log(`  Address: ${members[i].address}`);
    console.log(`  Type: ${info.membershipType}`);
    console.log(`  Active: ${info.isActive}`);
    console.log(`  Sessions: ${sessionCount.toString()}`);
    console.log(`  Join Date: ${new Date(info.joinDate.toNumber() * 1000).toLocaleString()}`);
  }

  // Create challenges
  console.log("\n--- Creating Fitness Challenges ---");

  const challenges = [
    {
      name: "30-Day Burn Challenge",
      targetCalories: 10000,
      durationDays: 30,
      prize: "0.5"
    },
    {
      name: "Weekend Warrior",
      targetCalories: 2000,
      durationDays: 2,
      prize: "0.2"
    },
    {
      name: "Elite Endurance",
      targetCalories: 20000,
      durationDays: 60,
      prize: "1.0"
    }
  ];

  for (let i = 0; i < challenges.length; i++) {
    const challenge = challenges[i];

    console.log(`\nCreating Challenge ${i + 1}: ${challenge.name}`);
    console.log(`  Target: ${challenge.targetCalories} calories`);
    console.log(`  Duration: ${challenge.durationDays} days`);
    console.log(`  Prize: ${challenge.prize} ETH`);

    const tx = await contract.createChallenge(
      challenge.name,
      challenge.targetCalories,
      challenge.durationDays,
      { value: hre.ethers.utils.parseEther(challenge.prize) }
    );

    const receipt = await tx.wait();
    console.log(`  ✓ Created (Gas: ${receipt.gasUsed.toString()})`);
  }

  const challengeCount = await contract.challengeCount();
  console.log(`\n✓ Total challenges created: ${challengeCount}`);

  // Members join challenges
  console.log("\n--- Members Joining Challenges ---");

  const challengeParticipants = [
    { member: member1, challengeId: 0 },
    { member: member2, challengeId: 0 },
    { member: member3, challengeId: 0 },
    { member: member1, challengeId: 1 },
    { member: member2, challengeId: 1 },
    { member: member3, challengeId: 2 },
    { member: member4, challengeId: 2 },
  ];

  for (const participation of challengeParticipants) {
    const challengeInfo = await contract.getChallengeInfo(participation.challengeId);

    console.log(`\nMember ${participation.member.address.slice(0, 10)}... joining "${challengeInfo.challengeName}"`);

    const tx = await contract.connect(participation.member).joinChallenge(participation.challengeId);
    const receipt = await tx.wait();

    console.log(`  ✓ Joined (Gas: ${receipt.gasUsed.toString()})`);
  }

  // Display challenge information
  console.log("\n--- Challenge Details ---");

  for (let i = 0; i < challengeCount.toNumber(); i++) {
    const info = await contract.getChallengeInfo(i);

    console.log(`\nChallenge ${i}: ${info.challengeName}`);
    console.log(`  Start: ${new Date(info.startTime.toNumber() * 1000).toLocaleString()}`);
    console.log(`  End: ${new Date(info.endTime.toNumber() * 1000).toLocaleString()}`);
    console.log(`  Prize: ${hre.ethers.utils.formatEther(info.prize)} ETH`);
    console.log(`  Active: ${info.isActive}`);
    console.log(`  Participants: ${info.participantCount.toString()}`);
  }

  // Update fitness levels
  console.log("\n--- Updating Fitness Levels ---");

  const fitnessUpdates = [
    { member: member1, level: 6 },
    { member: member2, level: 8 },
    { member: member3, level: 9 },
    { member: member4, level: 7 },
  ];

  for (const update of fitnessUpdates) {
    console.log(`\nUpdating ${update.member.address.slice(0, 10)}... to level ${update.level}`);

    const tx = await contract.connect(update.member).updateFitnessLevel(update.level);
    const receipt = await tx.wait();

    console.log(`  ✓ Updated (Gas: ${receipt.gasUsed.toString()})`);
  }

  // Final statistics
  console.log("\n--- Final Contract State ---");
  console.log("Contract Address:", contract.address);
  console.log("Total Members:", (await contract.totalMembers()).toString());
  console.log("Total Challenges:", (await contract.challengeCount()).toString());
  console.log("Contract Balance:", hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(contract.address)), "ETH");

  // Gas usage summary
  console.log("\n--- Gas Usage Summary ---");
  console.log("Operations simulated successfully");
  console.log("- Member registrations: 4");
  console.log("- Workout recordings: 8");
  console.log("- Challenge creations: 3");
  console.log("- Challenge joins: 7");
  console.log("- Fitness level updates: 4");

  console.log("\n=== Simulation Complete ===");
  console.log("\nContract deployed at:", contract.address);
  console.log("You can interact with this contract using:");
  console.log(`npx hardhat run scripts/interact.js --network ${hre.network.name}`);
  console.log("\nOr use Hardhat tasks:");
  console.log(`npx hardhat contract-info --address ${contract.address} --network ${hre.network.name}`);

  console.log("\n");

  return contract;
}

// Execute simulation
main()
  .then((contract) => {
    console.log("Simulation successful. Contract:", contract.address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });
