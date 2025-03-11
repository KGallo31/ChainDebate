
import { ethers } from "ethers";
import contractABI from "/Users/kg/Code/ChainDebate/artifacts/contracts/VotingSystem.sol/VotingSystem.json"

export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

export type Topic = {
  id: number;
  name: string;
  voteCount: number;
};

export const Ping = async (provider: ethers.providers.JsonRpcProvider | null) => {
  const contract = getContract(provider);
  try{
    const ping = await contract.ping();
    console.log(ping)
  } catch (error){
    console.log("error within contract.ts", error)
  }
}

export const getContract = (
  provider: ethers.providers.JsonRpcProvider | null,
  signer?: ethers.Signer | null
) => {
  if (!provider) return null;

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI.abi,
    signer || provider
  );
};

export const getTopics = async (provider: ethers.providers.JsonRpcProvider | null): Promise<Topic[]> => {
  const contract = getContract(provider);
  if (!contract) return [];
  
  try {
    const topics = await contract.getTopics();
    return topics.map((topic: any) => ({
      id: topic.id.toNumber(),
      name: topic.name,
      voteCount: topic.voteCount.toNumber(),
    }));
  } catch (error) {
    console.error("Failed to fetch topics:", error);
    return [];
  }
};

export const voteForTopic = async (
  signer: ethers.Signer | null,
  provider: ethers.providers.Web3Provider | null,
  topicId: number
): Promise<boolean> => {
  if (!signer || !provider) return false;
  
  const contract = getContract(provider, signer);
  if (!contract) return false;
  
  try {
    const tx = await contract.vote(topicId);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Failed to vote:", error);
    return false;
  }
};

export const createTopic = async (
  signer: ethers.Signer | null,
  provider: ethers.providers.Web3Provider | null,
  name: string
): Promise<number | null> => {
  if (!signer || !provider) return null;
  
  const contract = getContract(provider, signer);
  if (!contract) return null;
  
  try {
    const tx = await contract.createTopic(name);
    const receipt = await tx.wait();
    
    // Parse event to get the new topic ID
    const event = receipt.events?.find((e: any) => e.event === "TopicCreated");
    if (event) {
      return event.args.id.toNumber();
    }
    return null;
  } catch (error) {
    console.error("Failed to create topic:", error);
    return null;
  }
};
