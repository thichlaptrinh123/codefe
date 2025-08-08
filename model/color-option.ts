import mongoose from "mongoose";

const ColorOptionSchema = new mongoose.Schema({
  categoryType: { type: String, required: true },
  colors: [
    {
      name: { type: String, required: true },
      hex: { type: String, required: true },
    },
  ],
  isActive: { type: Boolean, default: true },
});

export default mongoose.models.ColorOption ||
  mongoose.model("ColorOption", ColorOptionSchema);
