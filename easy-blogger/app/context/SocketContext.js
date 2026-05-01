"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

// create socket connection to the socket.io backend server
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let newSocket;
    // connect to the socket.io server
    const connectSocket = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const backendUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          //make the connection with the socket.io server
          newSocket = io(backendUrl, {
            auth: { token },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          });
          // log when connected to the socket.io server
          newSocket.on("connect", () => {
            console.log("🟢 Connected to Socket.IO Server");
            setIsConnected(true);
          });

          newSocket.on("disconnect", () => {
            console.log("🔴 Disconnected from Socket.IO Server");
            setIsConnected(false);
          });

          setSocket(newSocket);
        } catch (error) {
          console.error("Socket connection failed:", error);
        }
      }
    };

    connectSocket();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
