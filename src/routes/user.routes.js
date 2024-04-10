import { Router } from "express";

import * as userController from "../controllers/user.controller";

const router = Router();

router.post("/updatePassword", userController.updatePassword);

export default router;
