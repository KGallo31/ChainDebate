
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Loader2 } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { voteForTopic } from "@/lib/contract";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface VoteButtonProps {
  topicId: number;
  onVoteSuccess: () => void;
}

const VoteButton = ({ topicId, onVoteSuccess }: VoteButtonProps) => {
  const { signer, provider, isConnected } = useWeb3();
  const [isVoting, setIsVoting] = useState(false);
  
  const handleVote = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      });
      return;
    }
    
    setIsVoting(true);
    try {
      const success = await voteForTopic(signer, provider, topicId);
      if (success) {
        toast({
          title: "Vote successful",
          description: "Your vote has been recorded on the blockchain",
        });
        onVoteSuccess();
      } else {
        toast({
          title: "Vote failed",
          description: "There was an error recording your vote",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Vote error:", error);
      toast({
        title: "Vote failed",
        description: "There was an error recording your vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };
  
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        onClick={handleVote}
        disabled={isVoting || !isConnected}
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
      >
        {isVoting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={16} />
            <span>Voting...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ThumbsUp size={16} />
            <span>Vote</span>
          </div>
        )}
      </Button>
    </motion.div>
  );
};

export default VoteButton;
