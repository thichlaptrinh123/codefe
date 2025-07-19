// File: model/blogs.ts
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subcontent: { type: String },
  content: { type: String, required: true },
  image: { type: String },
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  isHidden: { type: Boolean, default: false },
  isScheduled: { type: Boolean, default: false },
  scheduled_at: { type: Date },
});

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
