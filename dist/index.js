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
    }));
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield prisma.user.delete({ where: { id: socket.id } });
        }
        catch (e) { }
    }));
});
//# sourceMappingURL=index.js.map