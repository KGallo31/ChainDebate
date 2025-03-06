
import { useWeb3 } from "@/hooks/useWeb3";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const WalletConnect = () => {
  const { account, isConnected, isConnecting, connect, disconnect } = useWeb3();

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10"
    >
      {!isConnected ? (
        <Button 
          onClick={connect} 
          disabled={isConnecting}
          variant="default" 
          className="relative overflow-hidden group h-10"
        >
          {isConnecting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span>Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wallet size={16} />
              <span>Connect Wallet</span>
            </div>
          )}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-secondary text-secondary-foreground rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            <p className="text-sm font-medium">
              {account ? `${account.substring(0, 6)}...${account.substring(38)}` : ''}
            </p>
          </div>
          <Button 
            onClick={disconnect} 
            variant="outline" 
            size="icon"
            className="group"
          >
            <LogOut size={16} className="group-hover:text-destructive transition-colors" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default WalletConnect;
