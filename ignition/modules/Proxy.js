const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Proxy", (m) => {
  // First, deploy the implementation contract (e.g., VotingSystem)
  const votingSystem = m.contract("VotingSystem");

  // Now, deploy the Proxy contract with the implementation address
  const proxy = m.contract("Proxy", [votingSystem]);

  // Optional: Initialize the implementation through the proxy
  // This assumes your implementation has an initialize function
  const initializeData = votingSystem.interface.encodeFunctionData("initialize", [/* any parameters */]);
  m.call(proxy, "setImplementation", [votingSystem.address]);
  m.rawTx({
    from: m.getAccount(0),
    to: proxy.address,
    data: initializeData
  });

  return { proxy, votingSystem };
});