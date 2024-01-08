// routes/proposalRoutes.js

import express from 'express';
import { submitProposal, getProjectProposals, getFreelancerProposals } from '../controllers/proposalControllers.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';

const router = express.Router();

router.post('/proposals/submit', isAuthenticatedUser, submitProposal);
router.get('/proposals/:projectId', isAuthenticatedUser, getProjectProposals);
router.get('/proposal', isAuthenticatedUser, getFreelancerProposals);

export default router;
