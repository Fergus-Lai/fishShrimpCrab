import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client'

async function userById(id:string) {
    try{ 
        return await prisma.user.findUniqueOrThrow({
            where: {
                id,
            }
        })
    }
    catch (error) {
        console.log(error)
    }
}

dotenv.config();

const prisma: PrismaClient = new PrismaClient()
const app: Express = express();
const port = process.env.PORT;

app.use(express.json());

app.post('/user', async (req: Request, res:Response) => {
    const {userName, email, password} = req.body;
    const money = 1000;
    const user = await prisma.user.create({
        data: {
            userName,
            email,
            password,
            money,
        }
    })
    res.json(user)
})

app.get('/user/:id', async (req:Request, res:Response) => {
    const {id} = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id,
        }
    })
    res.json(user)
})

app.delete('/user/:id', async (req:Request, res:Response) => {
    const {id} = req.params;
    const user = await prisma.user.delete({
        where: {
            id,
        }
    })
    res.json(user)
})

app.get('/tables', async (req:Request, res:Response) => {
    const tables = await prisma.table.findMany()
    res.json(tables)
})

app.get('/table/:id', async (req:Request, res:Response) => {
    const {id} = req.params;
    const table = await prisma.table.findUnique({
        where: {id:parseInt(id),}, 
        include: {users: true}})
    res.json(table)
})

app.post('/table', async (req:Request, res:Response) => {
    const {users} = req.body;
    let table = await prisma.table.create({data:{}})
    for (let i=0; i<users.length; i++) {
        try{
            let user = await prisma.user.update({
                where:{id:users[i]}, 
                data:{tableID:table.id}})
        } catch (error) {
            console.log(error);
        }
    }
    try { 
        table = await prisma.table.findUniqueOrThrow({where:{id:table.id}});
    } catch (error) {
        console.log(error);
    }
    res.json(table);
})

app.put('/table/enter', async (req:Request, res:Response) => {
    const {tableID,user} = req.body;
    let userUpdate;
    try {
        userUpdate = await prisma.user.update({
            where: {
                id: user,
            },
            data: {
                tableID: parseInt(tableID),
            }
        })
    } catch (error) {
        console.log(error)
        userUpdate = error; 
    }
    res.json(userUpdate)
})

app.put('/table/leave', async (req:Request, res:Response) => {
    const {tableID,user} = req.body;
    let userUpdate;
    try {
        userUpdate = await prisma.user.update({
            where: {
                id: user,
            },
            data: {
                tableID: null,
            }
        })
    } catch (error) {
        console.log(error)
        userUpdate = error; 
    }
    try {
        const table = await prisma.table.findUniqueOrThrow({
            where:{id:parseInt(tableID)},
            include:{users:true}})
        if (table.users.length == 0) {
            await prisma.table.delete({where:{id:parseInt(tableID)}})
        }
    } catch (error) {
        console.log(error);
    }
    res.json(userUpdate)
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})