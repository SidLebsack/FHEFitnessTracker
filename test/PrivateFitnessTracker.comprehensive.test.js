const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateFitnessTracker - Comprehensive Test Suite", function () {
  let contract;
  let owner;
  let member1;
  let member2;
  let member3;
  let nonMember;

  // Deploy fresh contract for each test
  beforeEach(async function () {
    [owner, member1, member2, member3, nonMember] = await ethers.getSigners();

    const PrivateFitnessTracker = await ethers.getContractFactory("PrivateFitnessTracker");
    contract = await PrivateFitnessTracker.deploy();
    await contract.deployed();
  });

  describe("1. Deployment and Initialization (5 tests)", function () {
    it("Should deploy successfully with valid address", async function () {
      expect(contract.address).to.be.properAddress;
    });

    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero members", async function () {
      expect(await contract.totalMembers()).to.equal(0);
    });

    it("Should initialize with zero challenges", async function () {
      expect(await contract.challengeCount()).to.equal(0);
    });

    it("Should have zero contract balance initially", async function () {
      const balance = await ethers.provider.getBalance(contract.address);
      expect(balance).to.equal(0);
    });
  });

  describe("2. Member Registration (10 tests)", function () {
    it("Should register Basic membership successfully", async function () {
      await expect(contract.connect(member1).registerMember("Basic"))
        .to.emit(contract, "MemberRegistered")
        .withArgs(member1.address, "Basic");
    });

    it("Should register Premium membership successfully", async function () {
      await contract.connect(member1).registerMember("Premium");
      const info = await contract.getMemberInfo(member1.address);
      expect(info.membershipType).to.equal("Premium");
    });

    it("Should register Elite membership successfully", async function () {
      await contract.connect(member1).registerMember("Elite");
      const info = await contract.getMemberInfo(member1.address);
      expect(info.membershipType).to.equal("Elite");
    });

    it("Should register Corporate membership successfully", async function () {
      await contract.connect(member1).registerMember("Corporate");
      const info = await contract.getMemberInfo(member1.address);
      expect(info.membershipType).to.equal("Corporate");
    });

    it("Should increment total members count", async function () {
      await contract.connect(member1).registerMember("Premium");
      expect(await contract.totalMembers()).to.equal(1);

      await contract.connect(member2).registerMember("Basic");
      expect(await contract.totalMembers()).to.equal(2);
    });

    it("Should not allow duplicate registration", async function () {
      await contract.connect(member1).registerMember("Basic");
      await expect(
        contract.connect(member1).registerMember("Premium")
      ).to.be.revertedWith("Already registered");
    });

    it("Should not allow empty membership type", async function () {
      await expect(
        contract.connect(member1).registerMember("")
      ).to.be.revertedWith("Invalid membership type");
    });

    it("Should store correct join date", async function () {
      await contract.connect(member1).registerMember("Premium");
      const info = await contract.getMemberInfo(member1.address);
      expect(info.joinDate).to.be.gt(0);
    });

    it("Should set member as active", async function () {
      await contract.connect(member1).registerMember("Elite");
      const info = await contract.getMemberInfo(member1.address);
      expect(info.isActive).to.equal(true);
    });

    it("Should initialize session count to zero", async function () {
      await contract.connect(member1).registerMember("Premium");
      const sessionCount = await contract.sessionCount(member1.address);
      expect(sessionCount).to.equal(0);
    });
  });

  describe("3. Workout Recording (12 tests)", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
      await contract.connect(member2).registerMember("Elite");
    });

    it("Should record workout successfully", async function () {
      await expect(contract.connect(member1).recordWorkout(500, 45, 8))
        .to.emit(contract, "WorkoutRecorded")
        .withArgs(member1.address, 0);
    });

    it("Should increment session count", async function () {
      await contract.connect(member1).recordWorkout(500, 45, 8);
      const sessionCount = await contract.sessionCount(member1.address);
      expect(sessionCount).to.equal(1);
    });

    it("Should record multiple workouts", async function () {
      await contract.connect(member1).recordWorkout(500, 45, 8);
      await contract.connect(member1).recordWorkout(300, 30, 6);
      await contract.connect(member1).recordWorkout(700, 60, 9);

      const sessionCount = await contract.sessionCount(member1.address);
      expect(sessionCount).to.equal(3);
    });

    it("Should not allow non-members to record workouts", async function () {
      await expect(
        contract.connect(nonMember).recordWorkout(500, 45, 8)
      ).to.be.revertedWith("Only active members");
    });

    it("Should validate calorie input (zero)", async function () {
      await expect(
        contract.connect(member1).recordWorkout(0, 45, 8)
      ).to.be.revertedWith("Invalid calories");
    });

    it("Should validate duration input (zero)", async function () {
      await expect(
        contract.connect(member1).recordWorkout(500, 0, 8)
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should validate intensity level (too low)", async function () {
      await expect(
        contract.connect(member1).recordWorkout(500, 45, 0)
      ).to.be.revertedWith("Invalid intensity level");
    });

    it("Should validate intensity level (too high)", async function () {
      await expect(
        contract.connect(member1).recordWorkout(500, 45, 11)
      ).to.be.revertedWith("Invalid intensity level");
    });

    it("Should allow minimum valid intensity (1)", async function () {
      await expect(
        contract.connect(member1).recordWorkout(500, 45, 1)
      ).to.not.be.reverted;
    });

    it("Should allow maximum valid intensity (10)", async function () {
      await expect(
        contract.connect(member1).recordWorkout(500, 45, 10)
      ).to.not.be.reverted;
    });

    it("Should emit ProgressUpdated event", async function () {
      await expect(contract.connect(member1).recordWorkout(500, 45, 8))
        .to.emit(contract, "ProgressUpdated");
    });

    it("Should allow different members to record independently", async function () {
      await contract.connect(member1).recordWorkout(500, 45, 8);
      await contract.connect(member2).recordWorkout(600, 50, 9);

      expect(await contract.sessionCount(member1.address)).to.equal(1);
      expect(await contract.sessionCount(member2.address)).to.equal(1);
    });
  });

  describe("4. Challenge Creation (8 tests)", function () {
    it("Should allow owner to create challenge", async function () {
      const prize = ethers.utils.parseEther("0.5");

      await expect(
        contract.createChallenge("30-Day Challenge", 10000, 30, { value: prize })
      ).to.emit(contract, "ChallengeCreated");
    });

    it("Should increment challenge count", async function () {
      const prize = ethers.utils.parseEther("0.5");
      await contract.createChallenge("Challenge 1", 10000, 30, { value: prize });

      expect(await contract.challengeCount()).to.equal(1);
    });

    it("Should not allow non-owner to create challenge", async function () {
      const prize = ethers.utils.parseEther("0.5");

      await expect(
        contract.connect(member1).createChallenge("Challenge", 10000, 30, { value: prize })
      ).to.be.revertedWith("Only owner can execute");
    });

    it("Should validate challenge name", async function () {
      const prize = ethers.utils.parseEther("0.5");

      await expect(
        contract.createChallenge("", 10000, 30, { value: prize })
      ).to.be.revertedWith("Invalid challenge name");
    });

    it("Should validate target calories", async function () {
      const prize = ethers.utils.parseEther("0.5");

      await expect(
        contract.createChallenge("Test", 0, 30, { value: prize })
      ).to.be.revertedWith("Invalid target calories");
    });

    it("Should validate duration", async function () {
      const prize = ethers.utils.parseEther("0.5");

      await expect(
        contract.createChallenge("Test", 10000, 0, { value: prize })
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should accept prize pool", async function () {
      const prize = ethers.utils.parseEther("1.0");

      await contract.createChallenge("Big Challenge", 20000, 60, { value: prize });

      const balance = await ethers.provider.getBalance(contract.address);
      expect(balance).to.equal(prize);
    });

    it("Should create multiple challenges", async function () {
      const prize = ethers.utils.parseEther("0.5");

      await contract.createChallenge("Challenge 1", 5000, 15, { value: prize });
      await contract.createChallenge("Challenge 2", 10000, 30, { value: prize });

      expect(await contract.challengeCount()).to.equal(2);
    });
  });

  describe("5. Challenge Participation (6 tests)", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
      await contract.connect(member2).registerMember("Elite");

      const prize = ethers.utils.parseEther("0.5");
      await contract.createChallenge("Test Challenge", 10000, 30, { value: prize });
    });

    it("Should allow members to join challenges", async function () {
      await expect(contract.connect(member1).joinChallenge(0))
        .to.emit(contract, "ChallengeJoined")
        .withArgs(0, member1.address);
    });

    it("Should not allow non-members to join", async function () {
      await expect(
        contract.connect(nonMember).joinChallenge(0)
      ).to.be.revertedWith("Only active members");
    });

    it("Should not allow joining invalid challenge", async function () {
      await expect(
        contract.connect(member1).joinChallenge(999)
      ).to.be.revertedWith("Challenge does not exist");
    });

    it("Should allow multiple members to join same challenge", async function () {
      await contract.connect(member1).joinChallenge(0);
      await contract.connect(member2).joinChallenge(0);

      const info = await contract.getChallengeInfo(0);
      expect(info.participantCount).to.equal(2);
    });

    it("Should not allow duplicate joins", async function () {
      await contract.connect(member1).joinChallenge(0);

      await expect(
        contract.connect(member1).joinChallenge(0)
      ).to.be.revertedWith("Already joined this challenge");
    });

    it("Should update participant count", async function () {
      await contract.connect(member1).joinChallenge(0);

      const info = await contract.getChallengeInfo(0);
      expect(info.participantCount).to.equal(1);
    });
  });

  describe("6. Fitness Level Updates (4 tests)", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
    });

    it("Should allow members to update fitness level", async function () {
      await expect(
        contract.connect(member1).updateFitnessLevel(8)
      ).to.not.be.reverted;
    });

    it("Should validate minimum fitness level", async function () {
      await expect(
        contract.connect(member1).updateFitnessLevel(0)
      ).to.be.revertedWith("Invalid fitness level");
    });

    it("Should validate maximum fitness level", async function () {
      await expect(
        contract.connect(member1).updateFitnessLevel(11)
      ).to.be.revertedWith("Invalid fitness level");
    });

    it("Should not allow non-members to update", async function () {
      await expect(
        contract.connect(nonMember).updateFitnessLevel(7)
      ).to.be.revertedWith("Only active members");
    });
  });

  describe("7. Owner Functions (5 tests)", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
    });

    it("Should allow owner to deactivate member", async function () {
      await contract.deactivateMember(member1.address);

      const info = await contract.getMemberInfo(member1.address);
      expect(info.isActive).to.equal(false);
    });

    it("Should not allow non-owner to deactivate", async function () {
      await expect(
        contract.connect(member2).deactivateMember(member1.address)
      ).to.be.revertedWith("Only owner can execute");
    });

    it("Should allow owner to change ownership", async function () {
      await contract.changeOwner(member1.address);
      expect(await contract.owner()).to.equal(member1.address);
    });

    it("Should not allow invalid owner address", async function () {
      await expect(
        contract.changeOwner(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should allow owner to withdraw funds", async function () {
      // Add funds to contract
      const prize = ethers.utils.parseEther("1.0");
      await contract.createChallenge("Test", 10000, 30, { value: prize });

      // Withdraw
      await expect(contract.withdrawFunds()).to.not.be.reverted;
    });
  });

  describe("8. View Functions (4 tests)", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
      await contract.connect(member1).recordWorkout(500, 45, 8);
    });

    it("Should get member information", async function () {
      const info = await contract.getMemberInfo(member1.address);

      expect(info.isActive).to.equal(true);
      expect(info.membershipType).to.equal("Premium");
      expect(info.sessions).to.equal(1);
    });

    it("Should get workout session information", async function () {
      const session = await contract.getWorkoutSession(member1.address, 0);

      expect(session.completed).to.equal(true);
      expect(session.timestamp).to.be.gt(0);
    });

    it("Should calculate current week", async function () {
      const currentWeek = await contract.getCurrentWeek();
      expect(currentWeek).to.be.gt(0);
    });

    it("Should calculate current month", async function () {
      const currentMonth = await contract.getCurrentMonth();
      expect(currentMonth).to.be.gt(0);
    });
  });

  describe("9. Gas Optimization (3 tests)", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
    });

    it("Should have acceptable gas cost for registration", async function () {
      const tx = await contract.connect(member2).registerMember("Basic");
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(300000); // < 300k gas
    });

    it("Should have acceptable gas cost for workout recording", async function () {
      const tx = await contract.connect(member1).recordWorkout(500, 45, 8);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(200000); // < 200k gas
    });

    it("Should have acceptable gas cost for challenge join", async function () {
      const prize = ethers.utils.parseEther("0.5");
      await contract.createChallenge("Test", 10000, 30, { value: prize });

      const tx = await contract.connect(member1).joinChallenge(0);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(150000); // < 150k gas
    });
  });

  describe("10. Edge Cases (3 tests)", function () {
    it("Should handle workout with minimum values", async function () {
      await contract.connect(member1).registerMember("Premium");

      await expect(
        contract.connect(member1).recordWorkout(1, 1, 1)
      ).to.not.be.reverted;
    });

    it("Should handle challenge with long duration", async function () {
      const prize = ethers.utils.parseEther("0.1");

      await expect(
        contract.createChallenge("Long Challenge", 100000, 365, { value: prize })
      ).to.not.be.reverted;
    });

    it("Should handle multiple rapid workouts", async function () {
      await contract.connect(member1).registerMember("Premium");

      for (let i = 0; i < 5; i++) {
        await contract.connect(member1).recordWorkout(100 + i, 10 + i, 5);
      }

      const sessionCount = await contract.sessionCount(member1.address);
      expect(sessionCount).to.equal(5);
    });
  });
});
