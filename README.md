# Sudoku Duo - Dark Theme Starter (MERN + Socket.IO)

Sudoku Duo là một trò chơi Sudoku trực tuyến cho **2 người chơi** với giao diện **Dark Theme**, sử dụng **React (Vite)** cho frontend và **Node.js + Express + Socket.IO** cho backend.

## Features

- **Two-player realtime Sudoku**: Cả hai người chơi sẽ thấy bảng Sudoku đồng bộ cùng lúc.
- **Dark theme UI**: Giao diện hiện đại, dễ nhìn, phù hợp với chế độ tối.
- **Structured server**: Server được tách thành các phần **services**, **controllers**, và **sockets** để dễ bảo trì.
- **Gameplay rule**: Mỗi người chơi chỉ được phép sai tối đa **3 lần**; sai quá 3 lần sẽ thua và kết thúc trò chơi.
- **Simple preset-based puzzle generator**: Phiên bản MVP sử dụng generator dựa trên các preset. Sau này có thể thay thế bằng generator tạo Sudoku với **giải pháp duy nhất**.

## Quick Start

### 1. Chuẩn bị môi trường
- Đảm bảo bạn đã cài đặt **Node.js >= 18** và **npm**.

### 2. Chạy server
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
### 3. Chạy client
```bash
cd client
npm install
npm run dev
```
