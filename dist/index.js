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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
function userById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield prisma.user.findUniqueOrThrow({
                where: {
                    id,
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    });
}
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(express_1.default.json());
app.post('/user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, password } = req.body;
    const money = 1000;
    const user = yield prisma.user.create({
        data: {
            userName,
            email,
            password,
            money,
        }
    });
    res.json(user);
}));
app.get('/user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield prisma.user.findUnique({
        where: {
            id,
        }
    });
    res.json(user);
}));
app.delete('/user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield prisma.user.delete({
        where: {
            id,
        }
    });
    res.json(user);
}));
app.get('/tables', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tables = yield prisma.table.findMany();
    res.json(tables);
}));
app.get('/table/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const table = yield prisma.table.findUnique({
        where: { id: parseInt(id), },
        include: { users: true }
    });
    res.json(table);
}));
app.post('/table', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { users } = req.body;
    let table = yield prisma.table.create({ data: {} });
    for (let i = 0; i < users.length; i++) {
        try {
            let user = yield prisma.user.update({
                where: { id: users[i] },
                data: { tableID: table.id }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    try {
        table = yield prisma.table.findUniqueOrThrow({ where: { id: table.id } });
    }
    catch (error) {
        console.log(error);
    }
    res.json(table);
}));
app.put('/table/enter', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tableID, user } = req.body;
    let userUpdate;
    try {
        userUpdate = yield prisma.user.update({
            where: {
                id: user,
            },
            data: {
                tableID: parseInt(tableID),
            }
        });
    }
    catch (error) {
        console.log(error);
        userUpdate = error;
    }
    res.json(userUpdate);
}));
app.put('/table/leave', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tableID, user } = req.body;
    let userUpdate;
    try {
        userUpdate = yield prisma.user.update({
            where: {
                id: user,
            },
            data: {
                tableID: null,
            }
        });
    }
    catch (error) {
        console.log(error);
        userUpdate = error;
    }
    try {
        const table = yield prisma.table.findUniqueOrThrow({
            where: { id: parseInt(tableID) },
            include: { users: true }
        });
        if (table.users.length == 0) {
            yield prisma.table.delete({ where: { id: parseInt(tableID) } });
        }
    }
    catch (error) {
        console.log(error);
    }
    res.json(userUpdate);
}));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map