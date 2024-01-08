import mongoose from 'mongoose';

const { Schema } = mongoose;

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skillsRequired: [String],
  budget: { type: Number, required: true },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (userId) {
        // Check if the user has the role of 'client'
        const user = await mongoose.model('User').findById(userId);
        return user && user.role === 'client';
      },
      message: 'Only clients can create projects.',
    },
  },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['open', 'in progress', 'completed'], default: 'open' },
  deadline: 
  { type: Date },
  location: { type: String },
  category: { type: String },
  images: [String], // URLs or references to project images/attachments
  proposals: [{ type: Schema.Types.ObjectId, ref: 'Proposal' }],
  isFeatured: { type: Boolean, default: false },
  client: { type: Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['public', 'private', 'specificUsers'], default: 'public' },
  paymentDetails: {
    type: { type: String },
    amount: { type: Number },
  },
  entryLevel:{type:String},
  numProposals: { type: Number, default: 0 },
  tags: [String],
  duration: { type: String }, // Project duration
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
