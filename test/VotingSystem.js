const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");

  const { getSession, getSessionId } = require("./util");
  
  describe("VotingSystem", function () {
    async function deployVotingSystemFixture() {
      const [owner, voter1, voter2] = await ethers.getSigners();
  
      const VotingSystem = await ethers.getContractFactory("VotingSystem");
      const votingSystem = await VotingSystem.deploy();
  
      return { votingSystem, owner, voter1, voter2 };
    }
    
    describe("Voting Sessions", function () {
      it("Should create a new voting session", async function () {
        const { votingSystem, owner } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600; // 1 hour
        const topics = ["Topic 1", "Topic 2", "Topic 3"];
        const title = "Voting Session 1";

        const tx = await votingSystem.createVotingSession(duration, topics, title);
        const session = await getSession(tx, votingSystem);



        expect(session.endTime).to.be.gt(await time.latest());
        expect(session.title).to.equal(title);
        expect(session.creator).to.equal(owner.address);
        expect(session.totalVotes).to.equal(0);
        expect(session.isActive).to.be.true;
      });
  
      it("Should end the voting session after the duration", async function () {
        const { votingSystem } = await loadFixture(deployVotingSystemFixture);
        const duration = 10;
        const topics = ["Topic 1", "Topic 2"];
        const title = "Voting Session 1";
        
        const tx = await votingSystem.createVotingSession(duration, topics, title);
        await ethers.provider.send("evm_increaseTime", [1000000]); // Increase time by 601 seconds
        await ethers.provider.send("evm_mine"); 

        const session = await getSession(tx, votingSystem);
        
        expect(session.isActive).to.be.false;
      });
    });
  
    describe("Voting", function () {
      it("Should allow a voter to cast a vote", async function () {
        const { votingSystem, voter1 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2"];
        const title = "Voting Session 1";
        
        const tx = await votingSystem.createVotingSession(duration, topics, title);
        const sessionId = await getSessionId(tx);

        await votingSystem.connect(voter1).vote(sessionId, 0); // Vote for Topic 1
        const topic = await votingSystem.getTopic(sessionId, 0);
        expect(topic.voteCount).to.equal(1);
      });
  
      it("Should not allow voting on non-existent topics", async function () {
        const { votingSystem, voter1 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2"];
        const title = "Voting Session 1";

        const tx = await votingSystem.createVotingSession(duration, topics, title);
        const sessionId = await getSessionId(tx);

        await expect(votingSystem.connect(voter1).vote(sessionId, 2)) // Topic index 2 doesn't exist
          .to.be.revertedWith("Invalid topic ID");
      });
  
      it("Should not allow voting when session is inactive", async function () {
        const { votingSystem, voter1 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2"];
        const title = "Voting Session 1";
        
        const tx = await votingSystem.createVotingSession(duration, topics, title);
        const sessionId = await getSessionId(tx);

        await ethers.provider.send("evm_increaseTime", [1000000]); 
        await ethers.provider.send("evm_mine"); 

        await expect(votingSystem.connect(voter1).vote(sessionId, 0))
          .to.be.revertedWith("Voting period is over");
      });
  
      it("Should not allow a voter to vote twice", async function () {
        const { votingSystem, voter1 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2"];
        const title = "Voting Session 1";
        
        const tx = await votingSystem.createVotingSession(duration, topics, title);
        const sessionId = await getSessionId(tx);

        await votingSystem.connect(voter1).vote(sessionId, 0);
        
        await expect(votingSystem.connect(voter1).vote(sessionId, 1))
          .to.be.revertedWith("You have already voted in this session");
      });
    });
  
    describe("Results", function () {
      it("Should correctly tally votes", async function () {
        const { votingSystem, voter1, voter2 } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2", "Topic 3"];
        const title = "Voting Session 1";
        
        const tx = await votingSystem.createVotingSession(duration, topics, title);
        const sessionId = await getSessionId(tx);

        await votingSystem.connect(voter1).vote(sessionId, 0);
        await votingSystem.connect(voter2).vote(sessionId, 1);

        const totalVotes = await votingSystem.getTotalVotesForSession(sessionId);

        expect(totalVotes).to.equal(2);
      });
  
      it("Should return the winning topic", async function () {
        const { votingSystem, voter1, voter2, owner } = await loadFixture(deployVotingSystemFixture);
        const duration = 3600;
        const topics = ["Topic 1", "Topic 2", "Topic 3"];
        const title = "Voting Session 1";
        
        const tx = await votingSystem.createVotingSession(duration, topics, title);
        const sessionId = await getSessionId(tx);

        await votingSystem.connect(voter1).vote(sessionId, 0);
        await votingSystem.connect(voter2).vote(sessionId, 0);
        await votingSystem.connect(owner).vote(sessionId, 1);
        
        await ethers.provider.send("evm_increaseTime", [1000000]); 
        await ethers.provider.send("evm_mine"); 
                
        const winningTopic = await votingSystem.winner(sessionId);

        expect(winningTopic).to.equal("Topic 1");
      });
    });
  });