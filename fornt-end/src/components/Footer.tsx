import { motion, AnimatePresence } from "framer-motion";


const Footer = () => {
    return (
        <AnimatePresence>
            <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-auto py-8 px-6 border-t border-border"
        >
            <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-muted-foreground text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} TopicQuest. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Terms</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">FAQ</a>
                </div>
            </div>
            </div>
        </motion.footer>
      </AnimatePresence>

    )
}

export default Footer;