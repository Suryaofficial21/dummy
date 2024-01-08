// controllers/projectController.js
import Project from '../models/project.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Create a new project
export const createProject = catchAsyncErrors(async (req, res, next) => {
  const { title, description, skillsRequired, budget, deadline, location, category } = req.body;

  // Assuming that the user ID is available in req.user._id
  const createdBy = req.user._id;

  const project = await Project.create({
    title,
    description,
    skillsRequired,
    budget,
    deadline,
    location,
    category,
    createdBy,
  });

  res.status(201).json({
    success: true,
    project,
  });
});

// Get project details
export const getProjectDetails = catchAsyncErrors(async (req, res, next) => {
  const projectId = req.params.id;

  const project = await Project.findById(projectId).populate('createdBy', 'username');

  if (!project) {
    return next(new ErrorHandler('Project not found', 404));
  }

  res.status(200).json({
    success: true,
    project,
  });
});

// Update project details
export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const projectId = req.params.id;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler('Project not found', 404));
  }

  // Check if the user updating the project is the creator (assuming you want only the creator to update)
  if (project.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('You are not authorized to update this project', 403));
  }

  const { title, description, skillsRequired, budget, deadline, location, category } = req.body;

  project.title = title;
  project.description = description;
  project.skillsRequired = skillsRequired;
  project.budget = budget;
  project.deadline = deadline;
  project.location = location;
  project.category = category;

  await project.save();

  res.status(200).json({
    success: true,
    project,
  });
});

// Delete a project
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const projectId = req.params.id;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler('Project not found', 404));
  }

  // Check if the user deleting the project is the creator (assuming you want only the creator to delete)
  if (project.createdBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('You are not authorized to delete this project', 403));
  }

  await project.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  });
});
