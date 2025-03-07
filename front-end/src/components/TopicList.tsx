
import { useState, useEffect } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { getTopics, Topic } from "@/lib/contract";
import TopicCard from "./TopicCard";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const TopicList = () => {
  const { provider, isConnected } = useWeb3();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const fetchedTopics = await getTopics(provider);
      // Sort by vote count in descending order
      const sortedTopics = [...fetchedTopics].sort((a, b) => b.voteCount - a.voteCount);
      setTopics(sortedTopics);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Use mock data for preview when not connected
    if (!isConnected) {
      const mockTopics = [
        { id: 1, name: "Climate Change Solutions", voteCount: 120 },
        { id: 2, name: "Decentralized Governance", voteCount: 85 },
        { id: 3, name: "Economic Reform Proposals", voteCount: 67 },
        { id: 4, name: "Education Technology", voteCount: 42 },
        { id: 5, name: "Healthcare Accessibility", voteCount: 39 },
        { id: 6, name: "Sustainable Energy", voteCount: 31 },
      ];
      setTopics(mockTopics);
      setLoading(false);
      return;
    }
    
    fetchTopics();
  }, [provider, isConnected]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading topics...</p>
      </div>
    );
  }
  
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">No topics found. Be the first to create one!</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {topics.map((topic, index) => (
        <TopicCard 
          key={topic.id} 
          topic={topic} 
          index={index}
          onVoteSuccess={fetchTopics}
        />
      ))}
    </motion.div>
  );
};

export default TopicList;
