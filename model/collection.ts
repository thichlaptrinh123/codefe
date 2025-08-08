// file: model/collection.ts
import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  thumbnail_url: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  description: { type: String },
}, { timestamps: true });

export default mongoose.models.Collection || mongoose.model("Collection", CollectionSchema);
