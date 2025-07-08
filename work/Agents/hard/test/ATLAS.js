const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ATLAS Contract", function () {
    let ATLAS;
    let atlas;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        ATLAS = await ethers.getContractFactory("ATLAS");
        [owner, addr1, addr2] = await ethers.getSigners();
        atlas = await ATLAS.deploy();
        await atlas.deployed();
    });

    it("Should deploy with the correct initial supply", async function () {
        expect(await atlas.totalSupply()).to.equal(ethers.utils.parseUnits("300", 18));
        expect(await atlas.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("300", 18));
    });

    it("Should transfer tokens", async function () {
        await atlas.transfer(addr1.address, ethers.utils.parseUnits("100", 18));
        expect(await atlas.balanceOf(addr1.address)).to.equal(ethers.utils.parseUnits("100", 18));
        expect(await atlas.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("200", 18));
    });

    it("Should emit Transfer event on transfer", async function () {
        await expect(atlas.transfer(addr1.address, ethers.utils.parseUnits("100", 18)))
            .to.emit(atlas, "Transfer")
            .withArgs(owner.address, addr1.address, ethers.utils.parseUnits("100", 18));
    });

    it("Should approve tokens", async function () {
        await atlas.approve(addr1.address, ethers.utils.parseUnits("50", 18));
        expect(await atlas.allowance(owner.address, addr1.address)).to.equal(ethers.utils.parseUnits("50", 18));
    });

    it("Should emit Approval event on approve", async function () {
        await expect(atlas.approve(addr1.address, ethers.utils.parseUnits("50", 18)))
            .to.emit(atlas, "Approval")
            .withArgs(owner.address, addr1.address, ethers.utils.parseUnits("50", 18));
    });

    it("Should transfer tokens from one address to another using transferFrom", async function () {
        await atlas.approve(addr1.address, ethers.utils.parseUnits("50", 18));
        await atlas.connect(addr1).transferFrom(owner.address, addr2.address, ethers.utils.parseUnits("50", 18));
        expect(await atlas.balanceOf(addr2.address)).to.equal(ethers.utils.parseUnits("50", 18));
        expect(await atlas.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("250", 18));
        expect(await atlas.allowance(owner.address, addr1.address)).to.equal(ethers.utils.parseUnits("0", 18));
    });

    it("Should emit Transfer event on transferFrom", async function () {
        await atlas.approve(addr1.address, ethers.utils.parseUnits("50", 18));
        await expect(atlas.connect(addr1).transferFrom(owner.address, addr2.address, ethers.utils.parseUnits("50", 18)))
            .to.emit(atlas, "Transfer")
            .withArgs(owner.address, addr2.address, ethers.utils.parseUnits("50", 18));
    });

    it("Should revert on transfer to the zero address", async function () {
        await expect(atlas.transfer(ethers.constants.AddressZero, ethers.utils.parseUnits("100", 18))).to.be.revertedWith("Invalid address");
    });

    it("Should revert on transfer with insufficient balance", async function () {
        await expect(atlas.transfer(addr1.address, ethers.utils.parseUnits("400", 18))).to.be.revertedWith("Insufficient balance");
    });

    it("Should revert on transferFrom with insufficient balance", async function () {
        await atlas.approve(addr1.address, ethers.utils.parseUnits("50", 18));
        await expect(atlas.connect(addr1).transferFrom(owner.address, addr2.address, ethers.utils.parseUnits("100", 18))).to.be.revertedWith("Insufficient balance");
    });

    it("Should revert on transferFrom with insufficient allowance", async function () {
        await expect(atlas.connect(addr1).transferFrom(owner.address, addr2.address, ethers.utils.parseUnits("50", 18))).to.be.revertedWith("Allowance exceeded");
    });
});