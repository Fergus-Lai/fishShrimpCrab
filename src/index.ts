import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'

dotenv.config();

const prisma = new PrismaClient()
const app: Express = express();
const port = process.env.PORT;

app.use(express.json());

app.post('/user', async (req: Request, res:Response) => {
    let {userName, email, password} = req.body;
    let money = 1000;
    const post = await prisma.user.create({
        data: {
            userName,
            email,
            password,
            money,
        }
    })
    res.json(post)
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})