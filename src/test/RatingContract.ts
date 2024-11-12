import { expect } from "chai";
import hre from "hardhat";
import { BaseContract, ContractTransactionResponse, Contract, ethers } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Challenge } from "../types/challenge.types";
import { RatingContract } from "../../typechain-types";

describe("RatingContract", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  let ratingContract: RatingContract & { deploymentTransaction(): ContractTransactionResponse; };
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner, user2: HardhatEthersSigner, user3: HardhatEthersSigner, user4: HardhatEthersSigner, user5: HardhatEthersSigner, user0: HardhatEthersSigner;

  this.beforeAll(async () => {
    // Contracts are deployed using the first signer/account by default
    [owner, user1, user2, user3, user4, user5, user0] = await hre.ethers.getSigners();

    const RatingContract = await hre.ethers.getContractFactory("RatingContract");
    ratingContract = await RatingContract.deploy();

    return { ratingContract, owner, user1, user2, user3, user4, user5, user0 };
  })

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ratingContract.owner()).to.equal(owner.address);
    });

    it("Should have no balance in RatingContract initially", async function () {
      expect(await hre.ethers.provider.getBalance(ratingContract.target)).to.equal(
        0
      );
    });

    it("Should create a challenge", async function () {
      const challengeId = 1;
      const name = "Rate Annabelle movie";
      const expiry = 1731434497;
      await expect(ratingContract.createChallenge(challengeId, name, expiry))
        .to.emit(ratingContract, "ChallengeCreated")
        .withArgs(challengeId, name, expiry);
    });

    it("Should get the challenge", async function () {
      let challenge: Challenge = {
        id: 1,
        expiry: 1731434497,
        isExpired: false,
        totalShares: 0,
        name: "Rate Annabelle movie",
        totalPenalities: 0,
        totalRemainingShares: 0
      }
      expect(await ratingContract.challenges(1)).to.eq([challenge.name, challenge.expiry, challenge.totalShares, challenge.totalPenalities, challenge.totalPenalities, challenge.isExpired]);
    });

    it("Should bid the challenge", async function () {
      const challengeId = 1;
      const shares = ethers.parseEther("10000000000000000000");
      for (let index = 0; index <= 5; index++) {
        expect(await ratingContract.addRating(challengeId, index, `user${index}.address`, shares))
          .to.emit(ratingContract, "RatingAdded")
          .withArgs(challengeId, index, user0.address, shares);
      }
    });

    it("Should get the challenge", async function () {
      let challenge: Challenge = {
        id: 1,
        expiry: 1731434497,
        isExpired: false,
        totalShares: 6,
        name: "Rate Annabelle movie",
        totalPenalities: 0,
        totalRemainingShares: 0
      }
      console.log("challenge: ", await ratingContract.challenges(1));
      expect(await ratingContract.challenges(1)).to.eq([challenge.name, challenge.expiry, challenge.totalShares, challenge.totalPenalities, challenge.totalPenalities, challenge.isExpired]);
    });

    it("Should announce outcome for the challenge", async function () {
      const challengeId = 1;
      const outcome = 4;
      expect(await ratingContract.announceOutcome(challengeId, outcome))
        .to.emit(ratingContract, "OutcomeAnnounced")
        .withArgs(challengeId, outcome, true);
    });

    it("Should return true once settle payments for the bidders in the challenge is complete", async function () {
      const challengeId = 1;
      expect(await ratingContract.settlePayments(challengeId)).to.be.true;
    });

  });
});
