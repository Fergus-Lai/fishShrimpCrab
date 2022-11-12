import dotenv from "dotenv";
import { Prisma, PrismaClient } from "@prisma/client";
import { Server } from "socket.io";

dotenv.config();

const prisma: PrismaClient = new PrismaClient();
const port = parseInt(process.env.PORT || "4000");
const io: Server = new Server(port, {
  cors: { origin: "http://localhost:3001" },
});

io.on("connection", (socket) => {
  socket.on("createTable", async (data) => {
    let userName: string = data.name;
    let code: string = data.code;
    let icon: string = data.icon;
    try {
      await prisma.table.create({
        data: {
          id: code,
        },
      });
    } catch (error) {
      socket.emit("table_duplicate");
      return;
    }
    await prisma.user.upsert({
      where: {
        id: socket.id,
      },
      update: {
        userName,
        money: 1000,
        tableID: code,
        icon,
      },
      create: {
        id: socket.id,
        userName,
        money: 1000,
        tableID: code,
        icon,
      },
    });
    socket.emit("created");
    return;
  });

  socket.on("joinTable", async (data) => {
    let userName: string = data.name;
    let code: string = data.code;
    let icon: string = data.icon;
    try {
      await prisma.table.findUniqueOrThrow({ where: { id: code } });
      await prisma.user.upsert({
        where: {
          id: socket.id,
        },
        update: {
          userName,
          money: 1000,
          tableID: code,
          icon,
        },
        create: {
          id: socket.id,
          userName,
          money: 1000,
          tableID: code,
          icon,
        },
      });
      socket.emit("joined");
    } catch (e) {
      socket.emit("noTable");
    }
  });

  socket.on("disconnect", async () => {
    try {
      await prisma.user.delete({ where: { id: socket.id } });
    } catch (e) {}
  });
});
