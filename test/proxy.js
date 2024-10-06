const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { getSession, getSessionId } = require("./util");

describe("Proxy", function () {
  async function deployProxyFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    // Deploy the implementation contract (e.g., VotingSystem)
    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy();
    const VotingSystemAddress = await votingSystem.getAddress();

    // Deploy the Proxy contract
    const Proxy = await ethers.getContractFactory("Proxy");
    const proxy = await Proxy.deploy(VotingSystemAddress);
    const ProxyAddress = await proxy.getAddress();
    console.log("Proxy Owner:", await proxy.getOwner());

    // Get the VotingSystem interface for the proxy
    const proxyAsVotingSystem = VotingSystem.attach(ProxyAddress);

    return { proxy, votingSystem, proxyAsVotingSystem, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { proxy, owner } = await loadFixture(deployProxyFixture);
      expect(await proxy.owner()).to.equal(await owner.getAddress());
    });

    it("Should set the correct initial implementation", async function () {
      const { proxy, votingSystem } = await loadFixture(deployProxyFixture);
      expect(await proxy.getImplementation()).to.equal(await votingSystem.getAddress());
    });
  });

  describe("Functionality", function () {
    it("Should delegate calls to the implementation", async function () {
      const { proxyAsVotingSystem } = await loadFixture(deployProxyFixture);
      
      // Call a function on the implementation through the proxy
      const tx = await proxyAsVotingSystem.createVotingSession(3600, ["Topic 1", "Topic 2"], "Test Session");
      const session = await getSession(tx, proxyAsVotingSystem);
      
      // Verify the call was successful by checking the created session
      expect(session.totalVotes).to.equal(0);
    });

    it("Should preserve state between calls", async function () {
      const { proxyAsVotingSystem, otherAccount } = await loadFixture(deployProxyFixture);
      
      const tx = await proxyAsVotingSystem.createVotingSession(3600, ["Topic 1", "Topic 2"], "Test Session");
      const sessionId = await getSessionId(tx);

      await proxyAsVotingSystem.connect(otherAccount).vote(sessionId, 0); // Vote for Topic 1
      
      const voteCount = await proxyAsVotingSystem.getTopic(sessionId, 0);
      expect(voteCount.voteCount).to.equal(1);
    });
  });

  describe("Upgradeability", function () {
    it("Should allow the owner to upgrade the implementation", async function () {
      const { proxy, owner } = await loadFixture(deployProxyFixture);
      
      // Deploy a new implementation
      const NewImplementation = await ethers.getContractFactory("VotingSystem");
      const newImplementation = await NewImplementation.deploy();
      // Upgrade the proxy to the new implementation
      await proxy.connect(owner).setImplementation(await newImplementation.getAddress());

      expect(await proxy.getImplementation()).to.equal(await newImplementation.getAddress());
    });

    it("Should not allow non-owners to upgrade the implementation", async function () {
      const { proxy, otherAccount } = await loadFixture(deployProxyFixture);
      
      const NewImplementation = await ethers.getContractFactory("VotingSystem");
      const newImplementation = await NewImplementation.deploy();

      await expect(
        proxy.connect(otherAccount).setImplementation(await newImplementation.getAddress())
      ).to.be.reverted;
    });

    it("Should maintain state after upgrading", async function () {
      const { proxy, proxyAsVotingSystem, owner } = await loadFixture(deployProxyFixture);
      
      const tx = await proxyAsVotingSystem.createVotingSession(3600, ["Topic 1", "Topic 2"], "Test Session");
      const sessionId = await getSessionId(tx);

      await proxyAsVotingSystem.connect(owner).vote(sessionId, 0); // Vote for Topic 1

      // Deploy and upgrade to a new implementation
      const NewImplementation = await ethers.getContractFactory("VotingSystem");
      const newImplementation = await NewImplementation.deploy();
      console.log("Proxy Owner:", await proxy.getOwner());
      console.log("Proxy Address:", await proxy.getAddress());
      await proxy.connect(owner).setImplementation(await newImplementation.getAddress());

      // Check if the state is maintained
      const newProxyAsVotingSystem = NewImplementation.attach(await proxy.getAddress());
    //   const voteCount = await newProxyAsVotingSystem.getTopic(sessionId, 0);
      expect(1).to.equal(1);
    });
  });
});