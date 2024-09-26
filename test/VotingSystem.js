const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  
  describe("VotingSystem", function () {
    async function deployVotingSystemFixture() {
      const [owner, voter1, voter2] = await ethers.getSigners();
  
      const VotingSystem = await ethers.getContractFactory("VotingSystem");
      const votingSystem = await VotingSystem.deploy();
  
      return { votingSystem, owner, voter1, voter2 };
    }
  
    describe("Deployment", function () {
      it("Should set the right owner", async function () {
        const { votingSystem, owner } = await loadFixture(deployVotingSystemFixture);
        expect(await votingSystem.owner()).to.equal(owner.address);
      });
    });
  
    describe("Voting Sessions", function () {
      it("Should create a new voting session", async function () {
        const { votingSystem, owner } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600; // 1 hour
        const topics = ["Topic 1", "Topic 2", "Topic 3"];
        
        await votingSystem.createVotingSession(duration, topics);
        const session = await votingSystem.getCurrentSession();
        
        expect(session.isActive).to.be.true;
        expect(session.endTime).to.be.gt(await time.latest());
        expect(session.topics).to.deep.equal(topics);
      });
  
      it("Should not allow non-owners to create a voting session", async function () {
        const { votingSystem, voter1 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2"];
        
        await expect(votingSystem.connect(voter1).createVotingSession(duration, topics))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });
  
      it("Should end the voting session after the duration", async function () {
        const { votingSystem } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2"];
        
        await votingSystem.createVotingSession(duration, topics);
        await time.increase(duration + 1);
        
        const session = await votingSystem.getCurrentSession();
        expect(session.isActive).to.be.false;
      });
    });
  
    describe("Voting", function () {
      it("Should allow a voter to cast a vote", async function () {
        const { votingSystem, voter1 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2"];
        
        await votingSystem.createVotingSession(duration, topics);
        await votingSystem.connect(voter1).vote(0); // Vote for Topic 1
        
        const voteCount = await votingSystem.getVotes(0);
        expect(voteCount).to.equal(1);
      });
  
      it("Should not allow voting on non-existent topics", async function () {
        const { votingSystem, voter1 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2"];
        
        await votingSystem.createVotingSession(duration, topics);
        await expect(votingSystem.connect(voter1).vote(2)) // Topic index 2 doesn't exist
          .to.be.revertedWith("Invalid topic index");
      });
  
      it("Should not allow voting when session is inactive", async function () {
        const { votingSystem, voter1 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2"];
        
        await votingSystem.createVotingSession(duration, topics);
        await time.increase(duration + 1);
        
        await expect(votingSystem.connect(voter1).vote(0))
          .to.be.revertedWith("Voting session is not active");
      });
  
      it("Should not allow a voter to vote twice", async function () {
        const { votingSystem, voter1 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2"];
        
        await votingSystem.createVotingSession(duration, topics);
        await votingSystem.connect(voter1).vote(0);
        
        await expect(votingSystem.connect(voter1).vote(1))
          .to.be.revertedWith("You have already voted");
      });
    });
  
    describe("Results", function () {
      it("Should correctly tally votes", async function () {
        const { votingSystem, voter1, voter2 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2", "Topic 3"];
        
        await votingSystem.createVotingSession(duration, topics);
        await votingSystem.connect(voter1).vote(0);
        await votingSystem.connect(voter2).vote(1);
        
        expect(await votingSystem.getVotes(0)).to.equal(1);
        expect(await votingSystem.getVotes(1)).to.equal(1);
        expect(await votingSystem.getVotes(2)).to.equal(0);
      });
  
      it("Should return the winning topic", async function () {
        const { votingSystem, voter1, voter2, owner } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2", "Topic 3"];
        
        await votingSystem.createVotingSession(duration, topics);
        await votingSystem.connect(voter1).vote(0);
        await votingSystem.connect(voter2).vote(0);
        await votingSystem.connect(owner).vote(1);
        
        await time.increase(duration + 1);
        
        const winningTopic = await votingSystem.getWinningTopic();
        expect(winningTopic).to.equal("Topic 1");
      });
    });
  });