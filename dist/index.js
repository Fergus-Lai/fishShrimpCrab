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
    cors: { origin: "http://localhost:3001" },
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
    }));
    socket.on("loaded", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let userId = data.userId;
        let id = data.id;
        try {
            let table = yield prisma.user.findUniqueOrThrow({
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
    socket.on("joinTable", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let id = data.userId;
        let userName = data.name;
        let code = data.code;
        let icon = data.icon;
        try {
            yield prisma.table.findUniqueOrThrow({ where: { id: code } });
            yield prisma.user.upsert({
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
        }
        catch (e) {
            socket.emit("noTable");
        }
    }));
    socket.on;
});
//# sourceMappingURL=index.js.map