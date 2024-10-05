const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Proxy", function () {
  async function deployProxyFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    // Deploy the implementation contract (e.g., VotingSystem)
    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy();

    // Deploy the Proxy contract
    const Proxy = await ethers.getContractFactory("Proxy");
    const proxy = await Proxy.deploy(votingSystem.address);

    // Get the VotingSystem interface for the proxy
    const proxyAsVotingSystem = VotingSystem.attach(proxy.address);

    return { proxy, votingSystem, proxyAsVotingSystem, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { proxy, owner } = await loadFixture(deployProxyFixture);
      expect(await proxy.owner()).to.equal(owner.address);
    });

    it("Should set the correct initial implementation", async function () {
      const { proxy, votingSystem } = await loadFixture(deployProxyFixture);
      expect(await proxy.getImplementation()).to.equal(votingSystem.address);
    });
  });

  describe("Functionality", function () {
    it("Should delegate calls to the implementation", async function () {
      const { proxyAsVotingSystem } = await loadFixture(deployProxyFixture);
      
      // Call a function on the implementation through the proxy
      await proxyAsVotingSystem.createVotingSession(3600, ["Topic 1", "Topic 2"], "Test Session");
      
      // Verify the call was successful by checking the created session
      const sessionInfo = await proxyAsVotingSystem.getLatestSessionInfo();
      expect(sessionInfo.totalVotes).to.equal(0);
    });

    it("Should preserve state between calls", async function () {
      const { proxyAsVotingSystem } = await loadFixture(deployProxyFixture);
      
      await proxyAsVotingSystem.createVotingSession(3600, ["Topic 1", "Topic 2"], "Test Session");
      await proxyAsVotingSystem.vote(0, 0); // Vote for the first topic in the first session
      
      const voteCount = await proxyAsVotingSystem.getVotes(0, 0);
      expect(voteCount).to.equal(1);
    });
  });

  describe("Upgradeability", function () {
    it("Should allow the owner to upgrade the implementation", async function () {
      const { proxy, owner } = await loadFixture(deployProxyFixture);
      
      // Deploy a new implementation
      const NewImplementation = await ethers.getContractFactory("VotingSystem");
      const newImplementation = await NewImplementation.deploy();

      // Upgrade the proxy to the new implementation
      await proxy.connect(owner).setImplementation(newImplementation.address);

      expect(await proxy.getImplementation()).to.equal(newImplementation.address);
    });

    it("Should not allow non-owners to upgrade the implementation", async function () {
      const { proxy, otherAccount } = await loadFixture(deployProxyFixture);
      
      const NewImplementation = await ethers.getContractFactory("VotingSystem");
      const newImplementation = await NewImplementation.deploy();

      await expect(
        proxy.connect(otherAccount).setImplementation(newImplementation.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should maintain state after upgrading", async function () {
      const { proxy, proxyAsVotingSystem, owner } = await loadFixture(deployProxyFixture);
      
      // Create a session and vote
      await proxyAsVotingSystem.createVotingSession(3600, ["Topic 1", "Topic 2"], "Test Session");
      await proxyAsVotingSystem.vote(0, 0);

      // Deploy and upgrade to a new implementation
      const NewImplementation = await ethers.getContractFactory("VotingSystem");
      const newImplementation = await NewImplementation.deploy();
      await proxy.connect(owner).setImplementation(newImplementation.address);

      // Check if the state is maintained
      const newProxyAsVotingSystem = NewImplementation.attach(proxy.address);
      const voteCount = await newProxyAsVotingSystem.getVotes(0, 0);
      expect(voteCount).to.equal(1);
    });
  });
});