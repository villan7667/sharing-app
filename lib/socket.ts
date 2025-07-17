import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

interface User {
  id: string
  name: string
  location?: { lat: number; lng: number }
}

interface Room {
  users: Map<string, User>
}

const rooms = new Map<string, Room>()

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    path: "/api/socket/io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    socket.on("join-room", ({ roomCode, userName }) => {
      socket.join(roomCode)

      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, { users: new Map() })
      }

      const room = rooms.get(roomCode)!
      const user: User = { id: socket.id, name: userName }
      room.users.set(socket.id, user)

      // Notify others in the room
      socket.to(roomCode).emit("user-joined", user)

      // Send current users to the new user
      const usersArray = Array.from(room.users.values()).filter((u) => u.id !== socket.id)
      socket.emit("users-in-room", usersArray)
    })

    socket.on("share-location", ({ roomCode, location }) => {
      const room = rooms.get(roomCode)
      if (room && room.users.has(socket.id)) {
        const user = room.users.get(socket.id)!
        user.location = location

        socket.to(roomCode).emit("location-update", {
          userId: socket.id,
          location,
        })
      }
    })

    socket.on("share-file", ({ roomCode, file }) => {
      const fileData = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.data, // In production, upload to cloud storage
        sender: file.sender,
      }

      io.to(roomCode).emit("file-shared", fileData)
    })

    socket.on("webrtc-offer", ({ roomCode, offer }) => {
      socket.to(roomCode).emit("webrtc-offer", offer)
    })

    socket.on("webrtc-answer", ({ roomCode, answer }) => {
      socket.to(roomCode).emit("webrtc-answer", answer)
    })

    socket.on("webrtc-ice-candidate", ({ roomCode, candidate }) => {
      socket.to(roomCode).emit("webrtc-ice-candidate", candidate)
    })

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)

      // Remove user from all rooms
      rooms.forEach((room, roomCode) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id)
          socket.to(roomCode).emit("user-left", socket.id)

          // Clean up empty rooms
          if (room.users.size === 0) {
            rooms.delete(roomCode)
          }
        }
      })
    })
  })

  return io
}
