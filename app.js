import * as dotenv from 'dotenv';
dotenv.config();
import express from "express";
import router from './src/users.router.js';

const app = express();

app.use(express.json());

app.use('/users', router)


const PORT = process.env.PORT || 4667;
app.listen(PORT, () => {
    console.log(`Server up in port: ${PORT}`)
})