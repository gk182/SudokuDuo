import { useEffect, useState, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";

export default function useGame() {
  const socket = useSocket();
  const myIdRef = useRef(null);
  const [game, setGame] = useState(null);
  const [messages, setMessages] = useState([]);
  const [modalMessage, setModalMessage] = useState("");
  const [wrongCell, setWrongCell] = useState(null);
  const [roomCode, setRoomCode] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      myIdRef.current = socket.id;
    });

    // update game state
    socket.on("state", ({ game }) => setGame(game));

    // chat
    socket.on("chat", (msg) => setMessages((prev) => [msg, ...prev]));

    // move result
    socket.on("moveResult", (m) => {
      if (!m.correct && m.userId === myIdRef.current) {
        setModalMessage("Bạn đã nhập sai, hãy thử lại!");
        setWrongCell({ r: m.r, c: m.c, value: m.value });
      }
    });

    // game over
    socket.on("gameOver", ({ winner, loser, message }) => {
      if (message) setModalMessage(message);
      else if (myIdRef.current === loser) setModalMessage("Bạn thua (3 lỗi)!");
      else if (myIdRef.current === winner) setModalMessage("Bạn thắng!");
      else setModalMessage("Kết thúc ván!");
    });

    return () => {
      socket.off("state");
      socket.off("chat");
      socket.off("moveResult");
      socket.off("gameOver");
    };
  }, [socket]);

  const actions = {
    createRoom: (name, difficulty, cb) => {
      if (!socket) return;
      console.log("Socket connected:", socket.connected);

      socket.emit("createRoom", { name, difficulty }, (res) => {
        console.log("Server response createRoom:", res); // 👈 Thêm dòng này
        if (res?.ok) {
          setRoomCode(res.roomCode);
          setGame(res.game);
          setMessages((prev) => [
            { from: "system", message: `Bạn đã tạo phòng #${res.roomCode}` },
            ...prev,
          ]);
        }
        cb && cb(res);
      });
    },
    joinRoom: (roomCode, name, cb) => {
      if (!socket) return;
      socket.emit("joinRoom", { roomCode, name }, (res) => {
        if (res?.ok) {
          setRoomCode(roomCode);
          setMessages((prev) => [
            { from: "system", message: `Bạn đã vào phòng #${roomCode}` },
            ...prev,
          ]);
        }
        cb && cb(res);
      });
    },
    makeMove: (r, c, value, cb) => {
      if (!socket) return;
      socket.emit("makeMove", { r, c, value }, cb);
    },
    sendChat: (message) => {
      if (!socket) return;
      socket.emit("chat", { message });
    },
    replay: (roomCode, difficulty) => {
      if (!socket) return;
      socket.emit("replay", { roomCode, difficulty });
    },
  };

  return {
    game,
    messages,
    modalMessage,
    setModalMessage,
    wrongCell,
    roomCode,
    actions,
  };
}
