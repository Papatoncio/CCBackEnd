import { Router } from "express";

import * as recoverPassword from "../controllers/recoverPassword.controller";

const router = Router();

router.post("/recovePassword", recoverPassword.sendCode);
router.post("/validCode", recoverPassword.validCode);

export default router;
