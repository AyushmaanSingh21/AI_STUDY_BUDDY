import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

const Toast = ({ show, message, onClose }) => {
  // Default message if none provided
  const displayMessage = message || "Transcript not available. Using mock data for demonstration.";
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg shadow-xl max-w-md z-50"
          role="alert"
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">Transcript Not Available</p>
              <p className="text-sm text-yellow-700">{displayMessage}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-yellow-500 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-full p-1 -mt-1 -mr-1"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
