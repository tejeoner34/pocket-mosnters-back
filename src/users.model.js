import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";



export async function getUsers() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();       
        const db = client.db('PocketMonsters');
        const users = db.collection('users');
        return await users.find().sort({points: -1}).toArray();
    } catch(err) {
        console.log(err);
    }finally {
        await client.close();
    }
}

export async function createNewUser(userName) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();       
        const db = client.db('PocketMonsters');
        const users = db.collection('users');
        const newUser = {userName, wins: 0, defeats: 0, points: 0}
        await users.insertOne(newUser);
        return await users.findOne({userName});
    } catch(err) {
        console.log(err);
    }finally {
        await client.close();
    }
}

export async function checkIfUserExists(userName) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();       
        const db = client.db('PocketMonsters');
        const users = db.collection('users');
        return await users.findOne({userName});
    } catch(err) {
        console.log(err);
    }finally {
        await client.close();
    }
}

export async function updateUserInfo(user) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();       
        const db = client.db('PocketMonsters');
        const users = db.collection('users');
        await users.updateOne({userName: user.userName},{$set: {
            wins: user.wins,
            defeats: user.defeats,
            points: user.points
        }}, {upsert:true});  
        return await users.findOne({userName: user.userName});
    } catch(err) {
        console.log(err);
    }finally {
        await client.close();
    }
}