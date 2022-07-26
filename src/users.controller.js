import { createNewUser, getUsers, updateUserInfo } from "./users.model.js";


export async function getUsersController(req, res) {
    const users = await getUsers();
    res.json(users);
}

export async function createNewUserController(req, res) {
    const {userName} = req.body;
    const newUser = await createNewUser(userName);
    res.status(201).json(newUser);
}

export async function updateUserInfoController(req, res) {
    const user = {...req.body};
    const updatedUserData = await updateUserInfo(user);
    res.json(updatedUserData);
}