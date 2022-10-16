import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'

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

app.delete('/user/:id', async (req:Request, res:Response) => {
    const {id} = req.params;
    const user = await prisma.user.delete({
        where: {
            id,
        }
    })
    res.json(user)
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})