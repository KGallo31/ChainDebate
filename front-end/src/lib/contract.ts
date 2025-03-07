
import { ethers } from "ethers";

// This would be your actual contract ABI from your compiled Solidity contract
// For now, using a simplified mock ABI for a voting contract
const contractABI = [
  "function getTopics() view returns (tuple(uint256 id, string name, uint256 voteCount)[])",
  "function vote(uint256 topicId) returns (bool)",
  "function createTopic(string memory name) returns (uint256)",
  "event TopicCreated(uint256 indexed id, string name, address creator)",
  "event Voted(uint256 indexed topicId, address voter)",
];

// Replace with your actual contract address
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; 

export type Topic = {
  id: number;
  name: string;
  voteCount: number;
};

export const getContract = (
  provider: ethers.providers.Web3Provider | null,
  signer?: ethers.Signer | null
) => {
  if (!provider) return null;
  
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    signer || provider
  );
};

export const getTopics = async (provider: ethers.providers.Web3Provider | null): Promise<Topic[]> => {
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
