import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidV4 } from "uuid";

import router from "./src/users.router.js";

const PORT = process.env.PORT || 4667;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const allowedOrigins = ["http://localhost:4200"];
const corsOptions = {
  origin: allowedOrigins,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/users", router);

const users = [];
const rooms = [];

io.on("connection", (socket) => {

  socket.on("disconnect", () => {
    const abandonedRoom = rooms.find(room => 
      room.users.find(user=> user === socket.id)
    )?.roomId;
    const abandonedRoomIndex = rooms.find(room => room.roomId === abandonedRoom);
    if(abandonedRoom) {
      rooms.splice(abandonedRoomIndex, 1);
      io.in(abandonedRoom).emit("rival-disconnect", {
        userId: socket.id,
        disconnect: true
      });
    }
  });

  const userId = socket.id;
  users.push(userId);
  socket.emit("get user id", userId);

  socket.on("challenge-user", ({ challenger, challengedId }) => {
    const foundUser = users.find((user) => user === challengedId);
    if (foundUser) {
      socket.broadcast.to(foundUser).emit("receive-challenge", {
        challenger: challenger,
        message: "challengeMessage",
      });
    } else {
      socket.emit("challenge-response", {
        ok: false,
        accept: false,
        message: "noUser",
      });
    }
  });

  socket.on(
    "challenge-response",
    ({ userId, accept, challengerId, roomId }) => {
      if (accept) {
        const newRoom = roomId;
        rooms.push({
          roomId: newRoom,
          users: [userId],
          usersMoves: [],
        });
        socket.join(newRoom);

        socket.broadcast.to(challengerId).emit("challenge-response", {
          ok: true,
          accept: true,
          message: "rivalAccept",
          roomId: newRoom,
          userId,
        });
      } else {
        socket.broadcast.to(challengerId).emit("challenge-response", {
          ok: false,
          accept: false,
          message: "rivalDidNotAccept",
        });
      }
    }
  );

  socket.on("join-room", ({ userId, roomId }) => {
    const foundRoomIndex = rooms.findIndex((room) => room.roomId === roomId);
    if (foundRoomIndex !== -1) {
      const isUserInRoom = rooms[foundRoomIndex].users.find(
        (user) => user === userId
      );
      if (!isUserInRoom) {
        rooms[foundRoomIndex].users.push(userId);
        socket.join(roomId);
      }
      const numberOfUsersInRoom = rooms[foundRoomIndex].users.length;
        let infoToSend = { roomComplete: false };
        if (numberOfUsersInRoom === 2) {
          infoToSend = { roomComplete: true };
        }
      io.in(roomId).emit("all-users-in-room", infoToSend);
      console.log(rooms)
    }
  });

  socket.on('leave-room', ({userId, roomId}) => {
    const abandonedRoom = rooms.find(room => 
      room.users.find(user=> user === userId)
    )?.roomId;
    const abandonedRoomIndex = rooms.findIndex(room => room.roomId === roomId);
    if(abandonedRoomIndex !== -1) {
      socket.leave(roomId);
      rooms.splice(abandonedRoomIndex, 1);
      io.in(abandonedRoom).emit("rival-disconnect", {
        userId: userId,
        disconnect: true
      });
    }
  })

  socket.on("send-pokemon-data", ({ pokemon, opponentUserId }) => {
    socket.broadcast.to(opponentUserId).emit("get-pokemon-data", {
      pokemon,
    });
  });

  socket.on("select-move", ({ moveData, attackerId, receiverId, roomId }) => {
    const roomIndex = rooms.findIndex((room) => room.roomId === roomId);

    if (roomIndex !== -1) {
      // rooms[roomIndex].usersMoves.push({
      //   moveData,
      //   attackerId,
      //   receiverId,
      // });

      // if (rooms[roomIndex].usersMoves.length === 2) {
      //   io.in(roomId).emit("get-opponents-move", rooms[roomIndex].usersMoves);
      //   rooms[roomIndex].usersMoves = [];
      // }

      // se podría cambiar esto a envío directo al id del usuario que tenga que recibirlo y así evitamos que pete en el front

      // io.in(roomId).emit("get-opponents-move", rooms[roomIndex].usersMoves);
      socket.broadcast.to(roomId).emit("get-opponents-move", moveData)

    }
  });

  socket.on('set-timer', ({userId, roomId}) => {
    const seconds = 20;
    socket.broadcast.to(roomId).emit('get-timer', {
      seconds
    });
  });

  socket.on("game-over", ({userId, roomId}) => {
    socket.broadcast.to(roomId).emit("get-game-over", {
      userId
    });
  });

  ///////////////
  socket.on("create-room", ({ roomId, userId }) => {
    const roomAlreadyExists = openRooms.find((r) => r.roomId === roomId);

    if (roomAlreadyExists === undefined) {
      openRooms.push({
        roomId,
        users: [userId],
      });
      socket.join(roomId);
    } else {
      if (roomAlreadyExists.users.length === 2) {
        socket.emit("room-full", "The room si already full.");
      } else {
        const roomIndex = openRooms.findIndex((r) => r.roomId === roomId);
        openRooms[roomIndex].users.push(userId);
        socket.join(roomId);
      }
    }
  });

  socket.on("send test", (data) => {
    console.log(data);
  });

  socket.on("send-message", (data) => {
    console.log(data);
    console.log(data.arenaId);
    // socket.emit('get message', data);
    socket.broadcast.to(data.arenaId).emit("get message", data);
    // io.sockets.emit('get message', data);
  });
});

// app.listen(PORT, () => {
//     console.log(`Server up in port: ${PORT}`)
// });

server.listen(PORT, console.log(`Server is up at port ${PORT}`));

const generateRandomString = () => {
  return uuidV4();
};
