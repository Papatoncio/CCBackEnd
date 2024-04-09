import { Router } from "express";

import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/signIn', authController.signIn);

router.post('/signUp', authController.signUp);

router.post('/logOut', authController.logOut);

export default router