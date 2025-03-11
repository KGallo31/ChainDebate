const hre = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment of VotingSystem...");

    // Get the contract factory
    const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");

    // Deploy the contract
    let votingSystemResponse;
    const votingSystem = await VotingSystem.deploy().then(res => votingSystemResponse = res);

    console.log("VotingSystem deployed to:", votingSystemResponse.target);
    // console.log(x)

    // Verify the contract on Etherscan if not on a local network
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log("Waiting for block confirmations...");
      
      // Wait for 6 block confirmations
      await votingSystem.deployTransaction.wait(6);
      
      // Verify the contract
      await hre.run("verify:verify", {
        address: votingSystem.address,
        constructorArguments: [],
      });
      
      console.log("Contract verified on Etherscan");
    }

    return votingSystem;
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = main;
