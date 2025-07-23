const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateFitnessTracker", function () {
  let contract;
  let owner;
  let member1;
  let member2;
  let member3;

  beforeEach(async function () {
    // Get signers
    [owner, member1, member2, member3] = await ethers.getSigners();

    // Deploy contract
    const PrivateFitnessTracker = await ethers.getContractFactory("PrivateFitnessTracker");
    contract = await PrivateFitnessTracker.deploy();
    await contract.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero members", async function () {
      expect(await contract.totalMembers()).to.equal(0);
    });

    it("Should initialize with zero challenges", async function () {
      expect(await contract.challengeCount()).to.equal(0);
    });
  });

  describe("Member Registration", function () {
    it("Should register a new member successfully", async function () {
      await expect(contract.connect(member1).registerMember("Premium"))
        .to.emit(contract, "MemberRegistered")
        .withArgs(member1.address, "Premium");

      const totalMembers = await contract.totalMembers();
      expect(totalMembers).to.equal(1);
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

    it("Should store member information correctly", async function () {
      await contract.connect(member1).registerMember("Elite");

      const memberInfo = await contract.getMemberInfo(member1.address);
      expect(memberInfo.isActive).to.equal(true);
      expect(memberInfo.membershipType).to.equal("Elite");
      expect(memberInfo.sessions).to.equal(0);
    });
  });

  describe("Workout Recording", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
    });

    it("Should record workout successfully", async function () {
      await expect(contract.connect(member1).recordWorkout(500, 45, 8))
        .to.emit(contract, "WorkoutRecorded")
        .withArgs(member1.address, 0);

      const sessionCount = await contract.sessionCount(member1.address);
      expect(sessionCount).to.equal(1);
    });

    it("Should not allow non-members to record workouts", async function () {
      await expect(
        contract.connect(member2).recordWorkout(500, 45, 8)
      ).to.be.revertedWith("Only active members");
    });

    it("Should validate calorie input", async function () {
      await expect(
        contract.connect(member1).recordWorkout(0, 45, 8)
      ).to.be.revertedWith("Invalid calories");
    });

    it("Should validate duration input", async function () {
      await expect(
        contract.connect(member1).recordWorkout(500, 0, 8)
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should validate intensity level", async function () {
      await expect(
        contract.connect(member1).recordWorkout(500, 45, 0)
      ).to.be.revertedWith("Invalid intensity level");

      await expect(
        contract.connect(member1).recordWorkout(500, 45, 11)
      ).to.be.revertedWith("Invalid intensity level");
    });

    it("Should increment session count after multiple workouts", async function () {
      await contract.connect(member1).recordWorkout(500, 45, 8);
      await contract.connect(member1).recordWorkout(300, 30, 6);
      await contract.connect(member1).recordWorkout(700, 60, 9);

      const sessionCount = await contract.sessionCount(member1.address);
      expect(sessionCount).to.equal(3);
    });
  });

  describe("Challenge System", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
      await contract.connect(member2).registerMember("Elite");
    });

    it("Should allow owner to create challenge", async function () {
      const prize = ethers.utils.parseEther("0.5");

      await expect(
        contract.createChallenge("30-Day Challenge", 10000, 30, { value: prize })
      ).to.emit(contract, "ChallengeCreated");

      expect(await contract.challengeCount()).to.equal(1);
    });

    it("Should not allow non-owner to create challenge", async function () {
      const prize = ethers.utils.parseEther("0.5");

      await expect(
        contract.connect(member1).createChallenge("Challenge", 10000, 30, { value: prize })
      ).to.be.revertedWith("Only owner can execute");
    });

    it("Should validate challenge parameters", async function () {
      const prize = ethers.utils.parseEther("0.5");

      await expect(
        contract.createChallenge("", 10000, 30, { value: prize })
      ).to.be.revertedWith("Invalid challenge name");

      await expect(
        contract.createChallenge("Test", 0, 30, { value: prize })
      ).to.be.revertedWith("Invalid target calories");

      await expect(
        contract.createChallenge("Test", 10000, 0, { value: prize })
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should allow members to join challenges", async function () {
      const prize = ethers.utils.parseEther("0.5");
      await contract.createChallenge("Challenge", 10000, 30, { value: prize });

      await expect(contract.connect(member1).joinChallenge(0))
        .to.emit(contract, "ChallengeJoined")
        .withArgs(0, member1.address);
    });

    it("Should not allow non-members to join challenges", async function () {
      const prize = ethers.utils.parseEther("0.5");
      await contract.createChallenge("Challenge", 10000, 30, { value: prize });

      await expect(
        contract.connect(member3).joinChallenge(0)
      ).to.be.revertedWith("Only active members");
    });

    it("Should retrieve challenge information", async function () {
      const prize = ethers.utils.parseEther("0.5");
      await contract.createChallenge("Elite Challenge", 15000, 45, { value: prize });

      const info = await contract.getChallengeInfo(0);
      expect(info.challengeName).to.equal("Elite Challenge");
      expect(info.prize).to.equal(prize);
      expect(info.isActive).to.equal(true);
      expect(info.participantCount).to.equal(0);
    });
  });

  describe("Fitness Level Updates", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
    });

    it("Should allow members to update fitness level", async function () {
      await expect(
        contract.connect(member1).updateFitnessLevel(8)
      ).to.not.be.reverted;
    });

    it("Should validate fitness level range", async function () {
      await expect(
        contract.connect(member1).updateFitnessLevel(0)
      ).to.be.revertedWith("Invalid fitness level");

      await expect(
        contract.connect(member1).updateFitnessLevel(11)
      ).to.be.revertedWith("Invalid fitness level");
    });

    it("Should not allow non-members to update fitness level", async function () {
      await expect(
        contract.connect(member2).updateFitnessLevel(7)
      ).to.be.revertedWith("Only active members");
    });
  });

  describe("Owner Functions", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
    });

    it("Should allow owner to deactivate member", async function () {
      await contract.deactivateMember(member1.address);

      const memberInfo = await contract.getMemberInfo(member1.address);
      expect(memberInfo.isActive).to.equal(false);
    });

    it("Should not allow non-owner to deactivate member", async function () {
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
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
      await contract.connect(member1).recordWorkout(500, 45, 8);
    });

    it("Should get workout session information", async function () {
      const session = await contract.getWorkoutSession(member1.address, 0);
      expect(session.completed).to.equal(true);
      expect(session.timestamp).to.be.gt(0);
    });

    it("Should return correct week and month", async function () {
      const currentWeek = await contract.getCurrentWeek();
      const currentMonth = await contract.getCurrentMonth();

      expect(currentWeek).to.be.gt(0);
      expect(currentMonth).to.be.gt(0);
    });
  });
});
