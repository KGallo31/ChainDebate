import { motion } from "framer-motion";
import { useWeb3 } from "@/hooks/useWeb3";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";


const HeroSection = () => {
  const { isConnected, connect } = useWeb3();
  const navigate = useNavigate();
  
  const scrollToTopics = () => {
    const topicsSection = document.getElementById('topics-section');
    if (topicsSection) {
      topicsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHowItWorks = () => {
    navigate('/HowItWorks');
  };

  
  return (
    <div className="relative w-full overflow-hidden">
      {/* Background gradient and noise */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 z-0" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-40 z-0" />
      
      <div className="container relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-6 py-24 text-center">
        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="inline-block px-3 py-1 mb-6 text-sm font-medium text-accent rounded-full bg-accent/10 border border-accent/20">
              Decentralized Voting Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
              Vote on Topics that <span className="text-primary relative">Matter
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-primary/10 -z-10 translate-y-2"></span>
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
              A transparent and secure platform where your vote makes a difference. 
              Connect your wallet and start voting on topics you feel strongly about.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {!isConnected ? (
              <Button 
                onClick={connect} 
                size="lg" 
                className="text-base px-6 h-12 bg-primary hover:bg-primary/90"
              >
                Connect Wallet to Vote
              </Button>
            ) : (
              <Button 
                onClick={scrollToTopics} 
                size="lg" 
                className="text-base px-6 h-12 bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                Explore Topics
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base px-6 h-12 border-2 hover:bg-secondary/50 transition-all duration-300"
              onClick={handleHowItWorks}
            >
              How It Works
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <button 
            onClick={scrollToTopics}
            className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-sm mb-2">Scroll to explore</span>
            <ChevronDown className="animate-bounce" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
