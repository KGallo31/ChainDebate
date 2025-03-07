
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import VoteButton from "./VoteButton";
import { Topic } from "@/lib/contract";
import { useState } from "react";

interface TopicCardProps {
  topic: Topic;
  index: number;
  onVoteSuccess: () => void;
}

const TopicCard = ({ topic, index, onVoteSuccess }: TopicCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className={`h-full overflow-hidden transition-all duration-300 ${isHovered ? 'shadow-lg' : 'shadow-md'}`}>
        <div className="h-2 bg-gradient-to-r from-primary to-accent" />
        <CardContent className="pt-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
              Topic #{topic.id}
            </div>
            <div className="flex items-center gap-1">
              <div className="px-2 py-1 text-xs font-medium rounded-full bg-secondary">
                {topic.voteCount} votes
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold leading-tight mb-2">{topic.name}</h3>
          
          <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(topic.voteCount * 5, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <VoteButton topicId={topic.id} onVoteSuccess={onVoteSuccess} />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TopicCard;
