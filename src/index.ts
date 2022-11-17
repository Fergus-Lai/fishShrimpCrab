import dotenv from "dotenv";
import { Prisma, PrismaClient } from "@prisma/client";
import { Server } from "socket.io";

dotenv.config();

//  Create Prisma and Server
const prisma: PrismaClient = new PrismaClient();
const port = parseInt(process.env.PORT || "4000");
const io: Server = new Server(port, {
  cors: {
    origin: ["http://localhost:8080"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Handle Socket Connection Events
io.on("connection", (socket) => {
  // Create Table Request
  socket.on("createTable", async (data) => {
    let { userId, userName, code, icon } = data;
    //  Create Table
    try {
      await prisma.table.create({
        data: {
          id: code,
        },
      });
      // Table Already Exists
    } catch (error) {
      socket.emit("tableDuplicate");
      return;
    }
    // Update Or Create User
    await prisma.user.upsert({
      where: {
        id: userId,
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
        id: userId,
        userName,
        money: 1000,
        tableID: code,
        icon,
      },
    });
    // Send Response of joined
    socket.emit("joined");
    return;
  });

  // Handle Loading of The Board Page
  socket.on("loading", async (data) => {
    let { userId, id } = data;
    try {
      // Search For User
      let user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { table: true },
      });
      // If There Are No Table Field
      if (!user.table) {
        throw "Table not found";
      }
      // If Table Field != Code Recevied
      if (user.table.id !== id) {
        throw "Table id dont match";
      }
      // Update Socket Id
      await prisma.user.update({
        where: { id: userId },
        data: { socket: socket.id },
      });
      // Get List Of Other Users In The Table
      let users = await prisma.user.findMany({
        where: { tableID: id, NOT: { id: userId } },
        select: { id: true, userName: true, icon: true, money: true },
      });

      // Emit The Loaded Event to The Player
      socket.emit("loaded", {
        money: user.money,
        icon: user.icon,
        username: user.userName,
        users: users,
      });

      // Emit Player Joined Event To All Player in Table
      socket.to(id).emit("playerJoined", {
        id: user.id,
        username: user.userName,
        icon: user.icon,
        money: user.money,
      });

      // Join Table
      socket.join(id);
    } catch (e) {
      if (e === "Table id dont match") {
        socket.emit("tableIdNotMatch");
      } else if (e === "Table not found") {
        socket.emit("tableNotFound");
      } else {
        socket.emit("userNotFound");
      }
    }
  });

  // Handle socket disconnect
  socket.on("disconnecting", async (reason) => {
    try {
      // Search For User with The Same Socket Id
      let user = await prisma.user.findFirstOrThrow({
        where: { socket: socket.id },
        select: { id: true, tableID: true },
      });
      // Delete User If User Not In A Table
      if (!user.tableID) {
        await prisma.user.delete({ where: { id: user.id } });
        return;
      }
      // console.log(await io.in(user.tableID).fetchSockets());
      socket.to(user.tableID).emit("playerLeft", { id: user.id });
      setTimeout(async () => {
        try {
          await prisma.user.delete({ where: { id: user.id } });
        } catch (error) {}
      }, 300000);
    } catch (e) {}
  });

  socket.on("bet", async (data) => {});

  // Handle join table
  socket.on("joinTable", async (data) => {
    let { userId, userName, code, icon } = data;
    try {
      // Search If Table Of Code Exists
      await prisma.table.findUniqueOrThrow({ where: { id: code } });
      // Get User If Exists Or None
      let user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tableID: true },
      });
      // If User Exists and The TableID Is Equal To The Input Code, Only Update The Username, Icon and Socket
      if (user && user.tableID === code) {
        prisma.user.update({
          where: { id: userId },
          data: { socket: socket.id, userName, icon },
        });
      } else {
        // Update Or Create User
        await prisma.user.upsert({
          where: {
            id: userId,
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
            id: userId,
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
// Log Port When Server Running
console.log(port);
