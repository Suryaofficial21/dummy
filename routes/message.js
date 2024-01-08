// routes/proposalRoutes.js

import express from 'express';
import {sendMessage,getMessages} from '../controllers/messageControllers.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';

const router = express.Router();

router.post('/message/:id', isAuthenticatedUser, sendMessage);
router.get('/message/:id', isAuthenticatedUser, getMessages);

export default router;
