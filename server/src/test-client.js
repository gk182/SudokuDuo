import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected with id:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});
