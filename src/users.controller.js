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
    console.log(user, 'user en controller');
    const updatedUserData = await updateUserInfo(user);
    console.log(updatedUserData, 'updated user en controller')
    res.json(updatedUserData);
}

export async function getTopUsersController(req, res) {
    let topUsers = [];
    const {userName} = req.body;
    const sortedUsers = await getUsers();
    for(let i = 0; i < 3; i++) {
        topUsers.push({...sortedUsers[i], position: i + 1});
    }
    const userPosition = sortedUsers.findIndex(user => user.userName === userName) + 1;
    const user = sortedUsers.find(user => user.userName === userName);
    res.json({
        topUsers,
        user: {...user, position: userPosition}
    })
} 