
import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import TopicList from "@/components/TopicList";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    // Check if Web3 provider exists on window load
    if (!window.ethereum) {
      toast({
        title: "Web3 wallet not detected",
        description: "Please install MetaMask or another Web3 wallet to use all features",
        variant: "destructive",
      });
    }
  }, []);
  
  return (
    <AnimatePresence>
      <div className="min-h-screen flex flex-col">
        <Header />

        {/* Hero Section */}
        <HeroSection />
        
        {/* Topics Section */}
        <motion.section
          id="topics-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="py-20 px-6"
        >
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-secondary text-muted-foreground">
                Top Voted Topics
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover Popular Topics</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse the most popular topics and cast your vote. Your participation helps shape the community's priorities.
              </p>
            </div>
            
            <TopicList />
          </div>
        </motion.section>
        
        {/* Footer */}

        <Footer />

      </div>
    </AnimatePresence>
  );
};

export default Index;
