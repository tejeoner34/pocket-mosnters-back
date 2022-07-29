import * as dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from 'cors';
import router from './src/users.router.js';

const app = express();

const allowedOrigins = ['http://localhost:4200'];
const corsOptions = {
    origin: allowedOrigins
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/users', router)


const PORT = process.env.PORT || 4667;
app.listen(PORT, () => {
    console.log(`Server up in port: ${PORT}`)
})