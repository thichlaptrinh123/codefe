  // models/SizeOption.ts
  import mongoose from "mongoose";

  const SizeOptionSchema = new mongoose.Schema({
    categoryType: { type: String, required: true },
    sizes: [String],
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });

  export default mongoose.models.SizeOption || mongoose.model("SizeOption", SizeOptionSchema);