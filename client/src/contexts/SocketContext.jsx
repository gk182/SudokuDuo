import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API = import.meta.env.VITE_API_URL;

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // chỉ tạo socket 1 lần khi mount
    const socket = io(API, {
      transports: ["websocket"], // ép dùng websocket, tránh polling lỗi
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    const onConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      setConnected(true);
    };
    const onDisconnect = () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
