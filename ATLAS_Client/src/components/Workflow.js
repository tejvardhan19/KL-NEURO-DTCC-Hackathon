import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  CogIcon,
  CloudArrowUpIcon,
  ServerIcon,
  DocumentCheckIcon,
  FlagIcon
} from "@heroicons/react/24/outline";

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20 },
};

function WorkflowProcess({ updates }) {
  const isComplete = updates[updates.length - 1] === "end";
  
  const getStepIcon = (step, isLast, isComplete) => {
    if (isComplete) return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    if (!isLast) return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    
    // Special icons for processing steps
    if (step.includes("Initial")) return <CogIcon className="h-5 w-5 text-blue-500 animate-spin" />;
    if (step.includes("Upload")) return <CloudArrowUpIcon className="h-5 w-5 text-blue-500" />;
    if (step.includes("Process")) return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
    if (step === "end") return <FlagIcon className="h-5 w-5 text-green-500" />;
    
    return <CogIcon className="h-5 w-5 text-blue-500 animate-spin" />;
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {updates.map((step, idx) => {
          const isLast = idx === updates.length - 1;
          const showProcessing = isLast && !isComplete;
          
          return (
            <motion.div
              key={`${step}-${idx}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={stepVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${
                isComplete 
                  ? "border-green-400 bg-green-50" 
                  : showProcessing 
                    ? "border-blue-400 bg-blue-50" 
                    : "border-green-400 bg-green-50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getStepIcon(step, isLast, isComplete)}
                  </div>
                  <p className="text-gray-700 font-medium">
                    {step === "end" ? "Process completed" : step}
                    {showProcessing && (
                      <span className="ml-2 text-sm text-blue-600">Processing...</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default WorkflowProcess;