// controllers/proposalControllers.js

import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import Proposal from '../models/proposal.js';
import Project from '../models/project.js';
// @desc    Submit a proposal
// @route   POST /api/v1/proposals/submit
// @access  Freelancer
// controllers/proposalControllers.js

export const submitProposal = catchAsyncErrors(async (req, res, next) => {
    const { project, coverLetter, bidAmount, deliveryTime, milestones, attachments } = req.body;
  
    const freelancer = req.user._id;
  
    // Create the proposal
    const proposal = await Proposal.create({
      project,
      freelancer,
      coverLetter,
      bidAmount,
      deliveryTime,
      milestones,
      attachments,
    });
  
    // Update the Project model with the new proposal reference
    await Project.findByIdAndUpdate(project, {
      $push: { proposals: proposal._id },
      $inc: { numberOfProposals: 1 },
    });
  
    res.status(201).json({
      success: true,
      data: proposal,
    });
  });
  
// @desc    Get all proposals for a project
// @route   GET /api/v1/proposals/:projectId
// @access  Client
export const getProjectProposals = catchAsyncErrors(async (req, res, next) => {
  const project = req.params.projectId;

  const proposals = await Proposal.find({ project });

  res.status(200).json({
    success: true,
    data: proposals,
  });
});

// @desc    Get all proposals submitted by a freelancer
// @route   GET /api/v1/proposals/freelancer
// @access  Freelancer
export const getFreelancerProposals = catchAsyncErrors(async (req, res, next) => {
  const freelancer = req.user._id;

  const proposals = await Proposal.find({ freelancer });

  res.status(200).json({
    success: true,
    data: proposals,
  });
});
