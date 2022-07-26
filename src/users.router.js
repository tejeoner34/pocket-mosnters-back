import express from "express";
import { createNewUserController, getUsersController, updateUserInfoController } from "./users.controller.js";
import { checkIfUserExistsMiddleware } from "./users.middleware.js";


const router = express.Router();

router.route('/')
    .get(getUsersController)
    .post(checkIfUserExistsMiddleware, createNewUserController)
    .patch(updateUserInfoController)

export default router;