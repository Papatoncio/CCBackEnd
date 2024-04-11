import { Router } from "express";

import * as userController from "../controllers/user.controller";

const router = Router();

router.post("/updatePassword", userController.updatePassword);

router.post("/updateUser", userController.updateUser);

router.post("/getUser", userController.getUser);

export default router;
