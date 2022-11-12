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
    let id: string = data.userId;
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
        id,
      },
      update: {
        userName,
        money: 1000,
        tableID: code,
        icon,
      },
      create: {
        id,
        userName,
        money: 1000,
        tableID: code,
        icon,
      },
    });
    socket.emit("created");
    return;
  });

  socket.on("loaded", async (data) => {
    let userId = data.userId;
    let id = data.id;
    try {
      let table = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { table: true },
      });
      if (!table.table) {
        throw "Table not found";
      }
      if (table.table.id !== id) {
        throw "Table id dont match";
      }
      socket.join(data.code);
    } catch (e) {
      if (e === "Table id dont match") {
        socket.emit("tableIdNotMatch");
      } else {
        socket.emit("tableNotFound");
      }
    }
  });

  socket.on("joinTable", async (data) => {
    let id: string = data.userId;
    let userName: string = data.name;
    let code: string = data.code;
    let icon: string = data.icon;
    try {
      await prisma.table.findUniqueOrThrow({ where: { id: code } });
      await prisma.user.upsert({
        where: {
          id,
        },
        update: {
          userName,
          money: 1000,
          tableID: code,
          icon,
        },
        create: {
          id,
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
  socket.on;
});
