import { checkIfUserExists } from "./users.model.js";

export async function checkIfUserExistsMiddleware(req, res, next) {
    const {userName} = req.body;
    const user = await checkIfUserExists(userName);
    if(user) {
        res.status(200).json(user);
    } else {
        next();
    }

}