
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { ethers } from "ethers";
import { toast } from "@/hooks/use-toast";

type Web3ContextType = {
  account: string | null;
  chainId: number | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const Web3Context = createContext<Web3ContextType>({
  account: null,
  chainId: null,
  provider: null,
  signer: null,
  isConnecting: false,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
});

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or another web3 wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      
      // Create ethers provider
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethersSigner = ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();
      
      setAccount(accounts[0]);
      setChainId(network.chainId);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setIsConnected(true);
      
      toast({
        title: "Wallet connected",
        description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      });
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  // Handle account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        toast({
          title: "Account changed",
          description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
        });
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      toast({
        title: "Network changed",
        description: `Connected to chain ID: ${newChainId}`,
      });
    };

    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("disconnect", handleDisconnect);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      }
    };
  }, [account]);

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        provider,
        signer,
        isConnecting,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
