import React, { useState, useEffect,useRef } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { PauseCircleIcon ,CheckCircleIcon} from "@heroicons/react/24/solid";
const SOCKET_URL = "http://127.0.0.1:5000";

function App() {

  const [socket, setSocket] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [updates, setUpdates] = useState([]);


  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      upgrade: false,
      forceNew: true,
      
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      

      pingTimeout: 60000 * 60,
      pingInterval: 15000,
      

      timeout: 60000,
      autoConnect: true,
      query: {
        keepalive: "true",
        clientType: "web"
      }
    });

    newSocket.on("connect", () => {
      console.log(" Connected");
      startKeepalive(newSocket);
    });

    newSocket.on("disconnect", (reason) => {
      console.log(" Disconnected:", reason);
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    newSocket.on("reconnect", (attempt) => {
      console.log(` Reconnected (attempt ${attempt})`);
    });

    // keepalive acknowledgement
    newSocket.on("keepalive", () => {
      console.debug(" Keepalive acknowledged");
    });
    newSocket.on("update",(data)=>{
        setUpdates(prevItems => [...prevItems, data['data']]);
        console.log(data['data'])
    })


    

    newSocket.on("file", (data) => {
      const base64PDF = data;

      const byteCharacters = atob(base64PDF);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], { type: 'application/pdf' });
      setPdfBlob(blob);
      handleDownload()
    });

    setSocket(newSocket);
    

    

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("reconnect");
      newSocket.off("keepalive");
      newSocket.off("r");
      newSocket.disconnect();
    };
  }, []);
  const sendMessage = () => {
    socket.emit("prompt", { name : 'voting' ,prompt : "create a sample voting system smart contract" });
  };
  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'output.pdf';
      link.click();
      URL.revokeObjectURL(url); // Clean up
    }
  };
  const startKeepalive = (socket) => {
    // Combined keepalive strategy
    const keepaliveInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("keepalive", { 
          timestamp: Date.now(),
          client: "web-ui"
        }); 
        

        if (!socket.connected) {
          socket.connect();
        }
      }
    }, 30000);

    return () => clearInterval(keepaliveInterval);
  };
  
const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

  return (
<div className="flex h-screen w-screen bg-white px-4 box-border">
  <div className="flex w-full gap-4 p-3">
    {/* Left - 20% */}
    <div className="w-[20%] h-full bg-white rounded-md">
      <AnimatePresence>
      {updates.map((step, idx) => (
            <motion.div
              key={step + idx}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={stepVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -left-[22px] top-1.5">
                <CheckCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <p className="text-gray-800 dark:text-gray-100 font-medium">{step}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
    </div>


    <div className="w-[60%] h-full bg-gray-200 rounded-3xl shadow-lg ">
      <button onClick={sendMessage}>Send to Backend</button>
    </div>


    <div className="w-[20%] h-full bg-white rounded-md">
      {/* Right content */}
    </div>
  </div>
</div>


  );
}

export default App;

