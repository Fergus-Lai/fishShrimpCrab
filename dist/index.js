"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const port = parseInt(process.env.PORT || "4000");
const io = new socket_io_1.Server(port, {
    cors: { origin: "http://localhost:8080" },
});
io.on("connection", (socket) => {
    socket.on("createTable", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let id = data.userId;
        let userName = data.name;
        let code = data.code;
        let icon = data.icon;
        try {
            yield prisma.table.create({
                data: {
                    id: code,
                },
            });
        }
        catch (error) {
            socket.emit("table_duplicate");
            return;
        }
        yield prisma.user.upsert({
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
    }));
    socket.on("loading", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let userId = data.userId;
        let id = data.id;
        try {
            let user = yield prisma.user.findUniqueOrThrow({
                where: { id: userId },
                include: { table: true },
            });
            if (!user.table) {
                throw "Table not found";
            }
            if (user.table.id !== id) {
                throw "Table id dont match";
            }
            yield prisma.user.update({
                where: { id: userId },
                data: { socket: socket.id },
            });
            let users = yield prisma.user.findMany({
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
        }
        catch (e) {
            if (e === "Table id dont match") {
                socket.emit("tableIdNotMatch");
            }
            else {
                socket.emit("tableNotFound");
            }
        }
    }));
    socket.on("disconnect", (reason) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let user = yield prisma.user.findFirstOrThrow({
                where: { socket: socket.id },
                select: { id: true, tableID: true },
            });
            if (!user.tableID) {
                yield prisma.user.delete({ where: { id: user.id } });
                return;
            }
            socket.to(user.tableID).emit("player_left", user.id);
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                yield prisma.user.delete({ where: { id: user.id } });
            }), 300000);
        }
        catch (e) { }
    }));
    socket.on("bet", (data) => __awaiter(void 0, void 0, void 0, function* () { }));
    socket.on("joinTable", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let id = data.userId;
        let userName = data.name;
        let code = data.code;
        let icon = data.icon;
        try {
            yield prisma.table.findUniqueOrThrow({ where: { id: code } });
            let user = yield prisma.user.findUnique({
                where: { id },
                select: { tableID: true },
            });
            if (user && user.tableID === code) {
                prisma.user.update({
                    where: { id },
                    data: { socket: socket.id, userName, icon },
                });
            }
            else {
                yield prisma.user.upsert({
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
        }
        catch (e) {
            socket.emit("noTable");
        }
    }));
});
//# sourceMappingURL=index.js.map