import express from "express";
import { createNewUserController, getTopUsersController, getUsersController, updateUserInfoController } from "./users.controller.js";
import { checkIfUserExistsMiddleware } from "./users.middleware.js";


const router = express.Router();

router.route('/')
    .get(getUsersController)
    .post(checkIfUserExistsMiddleware, createNewUserController)
    .patch(updateUserInfoController)

router.route('/top-users')
    .post(getTopUsersController)

export default router;