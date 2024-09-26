const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingSystem", (m) => {
  const votingSystem = m.contract("VotingSystem");

  // Example: Create an initial voting session
  const initialTopics = ["Topic 1", "Topic 2", "Topic 3"];
  const votingDurationInMinutes = 60; // 1 hour

  m.call(votingSystem, "createVotingSession", [votingDurationInMinutes, initialTopics]);

  return { votingSystem };
});