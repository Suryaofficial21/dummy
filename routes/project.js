// routes/projectRoutes.js
import express from 'express';
import {
  createProject,
  getProjectDetails,
  updateProject,
  deleteProject,
} from '../controllers/projectControllers.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';

const router = express.Router();

// Protect all routes below this middleware
router.use(isAuthenticatedUser);

router.route('/projects').post(createProject);
router.route('/projects/:id').get(getProjectDetails).put(updateProject).delete(deleteProject);

export default router;
