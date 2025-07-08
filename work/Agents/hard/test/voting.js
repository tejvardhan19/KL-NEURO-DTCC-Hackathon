const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingSystem", function () {
    let VotingSystem;
    let votingSystem;
    let owner;
    let addr1;
    let addr2;
    let addr3;

    beforeEach(async function () {
        VotingSystem = await ethers.getContractFactory("VotingSystem");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        votingSystem = await VotingSystem.deploy();
        await votingSystem.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right admin", async function () {
            expect(await votingSystem.admin()).to.equal(owner.address);
        });
    });

    describe("Add Proposal", function () {
        it("Should add a new proposal", async function () {
            await votingSystem.addProposal("Proposal 1");
            expect(await votingSystem.proposals(0)).to.equal("Proposal 1");
            expect(await votingSystem.proposalCount()).to.equal(1);
        });

        it("Should revert if non-admin tries to add a proposal", async function () {
            await expect(votingSystem.connect(addr1).addProposal("Proposal 1")).to.be.revertedWith("Only admin can add proposals");
        });
    });

    describe("Vote", function () {
        beforeEach(async function () {
            await votingSystem.addProposal("Proposal 1");
        });

        it("Should allow voting", async function () {
            await votingSystem.connect(addr1).vote(0);
            expect(await votingSystem.voters(addr1.address)).to.equal(true);
            expect(await votingSystem.votes(addr1.address)).to.equal(0);
            expect(await votingSystem.voteCount()).to.equal(1);
        });

        it("Should revert if voter tries to vote more than once", async function () {
            await votingSystem.connect(addr1).vote(0);
            await expect(votingSystem.connect(addr1).vote(0)).to.be.revertedWith("Already voted");
        });

        it("Should revert if proposal ID is invalid", async function () {
            await expect(votingSystem.connect(addr1).vote(1)).to.be.revertedWith("Invalid proposal ID");
        });
    });

    describe("Get Votes", function () {
        beforeEach(async function () {
            await votingSystem.addProposal("Proposal 1");
            await votingSystem.addProposal("Proposal 2");
            await votingSystem.connect(addr1).vote(0);
            await votingSystem.connect(addr2).vote(0);
            await votingSystem.connect(addr3).vote(1);
        });

        it("Should return the correct number of votes for a proposal", async function () {
            expect(await votingSystem.getVotes(0)).to.equal(2);
            expect(await votingSystem.getVotes(1)).to.equal(1);
        });
    });

    describe("Get Winner", function () {
        beforeEach(async function () {
            await votingSystem.addProposal("Proposal 1");
            await votingSystem.addProposal("Proposal 2");
            await votingSystem.connect(addr1).vote(0);
            await votingSystem.connect(addr2).vote(0);
            await votingSystem.connect(addr3).vote(1);
        });

        it("Should return the winner proposal", async function () {
            expect(await votingSystem.getWinner()).to.equal(0);
        });
    });
});