import { useState, useEffect } from "react";
import Board from "../components/Board";
import Chat from "../components/Chat";
import useGame from "../hooks/useGame";

const DIFFICULTIES = ["easy", "medium", "hard", "expert"];

export default function Room() {
  const { game, messages, modalMessage, setModalMessage, wrongCell, actions } =
    useGame();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDifficulty, setCreateDifficulty] = useState("easy");
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [replayDifficulty, setReplayDifficulty] = useState("easy");
  const [showChatMobile, setShowChatMobile] = useState(false); // toggle chat mobile

  const createRoom = () => {
    if (!name) return alert("Nhập tên trước khi tạo phòng");
    actions.createRoom(name, createDifficulty, (res) => {
      if (res?.error) return alert(res.error);

      setShowCreateModal(false);
    });
  };

  const joinRoom = () => {
    if (!name) return alert("Nhập tên trước khi vào phòng");
    if (!roomCode) return alert("Nhập mã phòng");
    actions.joinRoom(roomCode, name, (res) => {
      if (res?.error) alert(res.error);
    });
  };

  const handleReplay = () => {
    if (!game) return;
    actions.replay(game.roomCode, replayDifficulty);
    setShowReplayModal(false);
  };

  useEffect(() => {
    if (game?.status === "finished") {
      setShowReplayModal(true);
      // mặc định chọn độ khó giống lần trước
      setReplayDifficulty(game.difficulty || "easy");
    }
  }, [game?.status]);

  return (
    <div className="room-grid">
      <div>
        <div className="panel panel--glass">
          <h2>Sudoku Duo</h2>

          {/* Controls tạo / join phòng */}
          {!game && (
            <div className="controls" style={{ marginBottom: 16 }}>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên của bạn"
              />
              <button className="btn" onClick={() => setShowCreateModal(true)}>
                Tạo phòng
              </button>
              <input
                className="input"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Mã phòng"
              />
              <button className="btn" onClick={joinRoom}>
                Vào phòng
              </button>
            </div>
          )}

          {game && (
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div className="badge">Phòng: {game.roomCode}</div>
              <div className="badge">Trạng thái: {game.status}</div>
              <div className="badge">
                Lỗi tổng:{" "}
                {(game.players[0]?.wrongCount || 0) +
                  (game.players[1]?.wrongCount || 0)}
              </div>
              {/* Hoặc nếu muốn hiển thị từng người chơi */}
              {game.players.map((p) => (
                <div key={p.userId} className="badge">
                  {p.name} Lỗi: {p.wrongCount || 0}
                </div>
              ))}
            </div>
          )}

          {game ? (
            <Board
              board={game.board}
              onMove={actions.makeMove}
              wrongCell={wrongCell}
            />
          ) : (
            <div className="status">
              Tạo hoặc tham gia phòng để bắt đầu chơi.
            </div>
          )}
        </div>
      </div>

      {/* Chat chỉ hiện khi có game */}
      {game && (
        <div className="chat-panel">
          <div className="panel-title">Chat</div>
          {/* Toggle cho mobile */}
          <div className="chat-toggle-mobile">
            <button
              className="btn btn--ghost"
              onClick={() => setShowChatMobile((s) => !s)}
            >
              {showChatMobile ? "Đóng chat" : "Mở chat"}
            </button>
          </div>
          {(showChatMobile || window.innerWidth >= 768) && (
            <Chat messages={messages} onSend={actions.sendChat} />
          )}
        </div>
      )}

      {/* Modal chọn độ khó khi tạo phòng */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Chọn độ khó</div>
            <div className="modal-grid">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  className={`btn btn--ghost ${
                    createDifficulty === d ? "active" : ""
                  }`}
                  onClick={() => setCreateDifficulty(d)}
                  style={{ margin: 5 }}
                >
                  {d}
                </button>
              ))}
            </div>
            <br />
            <div className="modal-actions">
              <button
                className="btn"
                style={{ margin: 5 }}
                onClick={createRoom}
              >
                Tạo phòng
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chơi lại */}
      {showReplayModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Chơi lại?</div>
            <div className="modal-grid">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  className={`btn btn--ghost ${
                    replayDifficulty === d ? "active" : ""
                  }`}
                  onClick={() => setReplayDifficulty(d)}
                  style={{ margin: 5 }}
                >
                  {d}
                </button>
              ))}
            </div>
            <br />
            <div className="modal-actions">
              <button className="btn" onClick={handleReplay}>
                Chơi lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo */}
      {/* {modalMessage && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">{modalMessage}</div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setModalMessage("")}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
