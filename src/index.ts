import dotenv from "dotenv";
import { Prisma, PrismaClient } from "@prisma/client";
import { Server } from "socket.io";

dotenv.config();

const prisma: PrismaClient = new PrismaClient();
const port = parseInt(process.env.PORT || "4000");
const io: Server = new Server(port, {
  cors: {
    origin: ["http://localhost:8080"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

console.log(port);

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
        socket: socket.id,
        userName,
        money: 1000,
        tableID: code,
        icon,
      },
      create: {
        socket: socket.id,
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

  socket.on("loading", async (data) => {
    let userId = data.userId;
    let id = data.id;
    try {
      let user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { table: true },
      });
      if (!user.table) {
        throw "Table not found";
      }
      if (user.table.id !== id) {
        throw "Table id dont match";
      }
      await prisma.user.update({
        where: { id: userId },
        data: { socket: socket.id },
      });
      let users = await prisma.user.findMany({
        where: { tableID: id, NOT: { id: userId } },
        select: { id: true, userName: true, money: true },
      });

      socket.join(data.code);
      socket.emit("loaded", {
        money: user.money,
        icon: user.icon,
        username: user.userName,
        users: users,
      });
      socket.to(data.code).emit("playerJoined", {
        id: user.id,
        money: user.money,
        icon: user.icon,
        username: user.userName,
      });
    } catch (e) {
      if (e === "Table id dont match") {
        socket.emit("tableIdNotMatch");
      } else {
        socket.emit("tableNotFound");
      }
    }
  });

  socket.on("disconnect", async (reason) => {
    try {
      let user = await prisma.user.findFirstOrThrow({
        where: { socket: socket.id },
        select: { id: true, tableID: true },
      });
      if (!user.tableID) {
        await prisma.user.delete({ where: { id: user.id } });
        return;
      }
      socket.to(user.tableID).emit("player_left", user.id);
      setTimeout(async () => {
        try {
          await prisma.user.delete({ where: { id: user.id } });
        } catch (error) {}
      }, 300000);
    } catch (e) {}
  });

  socket.on("bet", async (data) => {});

  socket.on("joinTable", async (data) => {
    let id: string = data.userId;
    let userName: string = data.name;
    let code: string = data.code;
    let icon: string = data.icon;
    try {
      await prisma.table.findUniqueOrThrow({ where: { id: code } });
      let user = await prisma.user.findUnique({
        where: { id },
        select: { tableID: true },
      });
      if (user && user.tableID === code) {
        prisma.user.update({
          where: { id },
          data: { socket: socket.id, userName, icon },
        });
      } else {
        await prisma.user.upsert({
          where: {
            id,
          },
          update: {
            socket: socket.id,
            userName,
            money: 1000,
            tableID: code,
            icon,
          },
          create: {
            socket: socket.id,
            id,
            userName,
            money: 1000,
            tableID: code,
            icon,
          },
        });
      }
      socket.emit("joined");
    } catch (e) {
      socket.emit("noTable");
    }
  });
});
