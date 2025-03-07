import { motion, AnimatePresence } from "framer-motion";

import Header from "@/components/Header";
import Footer from "@/components/Footer";


const HowItWorks = () => {

    return (
        <AnimatePresence>

            <Header />

            <motion.section
                id="topics-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="py-20 px-6"
            >
                <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Getting Started</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        The first requirement is that you need to have a wallet extension on your web browser. This will be used as your login and will allow you to use any feature. 
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4"> No Transaction Will Happen Without Your Approval!</h2>
                </div>
                
                </div>
            </motion.section>

            <Footer />
          </AnimatePresence>

    )

}

export default HowItWorks;