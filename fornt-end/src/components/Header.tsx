import WalletConnect from "@/components/WalletConnect";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";



const Header = () => {

    const navigate = useNavigate();

    const navigateHome = () => {
        navigate("/")
    }

    return (
        <AnimatePresence>
            <div>
                <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-xl font-bold tracking-tight flex items-center">
                    <a onClick={navigateHome} className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TopicQuest</a>
                    </h1>
                </motion.div>
                
                <WalletConnect />
                </div>
            </header>
            </div>
        </AnimatePresence>
    )
}

export default Header;