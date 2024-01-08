// models/proposalModel.js

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const proposalSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }, // Reference to the project for which the proposal is submitted
  freelancer: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the freelancer submitting the proposal
  coverLetter: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  deliveryTime: { type: Number, required: true }, // Estimated delivery time in days
  milestones: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      amount: { type: Number, required: true },
      dueDate: { type: Date },
      status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
    },
  ],
  attachments: [{ type: String }], // URLs or paths to attached files
  status: { type: String, enum: ['Submitted', 'Accepted', 'Rejected'], default: 'Submitted' },
  submittedAt: { type: Date, default: Date.now },
});

const Proposal = mongoose.model('Proposal', proposalSchema);

export default Proposal;
