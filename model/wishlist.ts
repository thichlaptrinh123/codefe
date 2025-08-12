import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
    id_product: {type: mongoose.Schema.Types.ObjectId,ref: "Product",required: true,},
    id_user: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,}
  },
  { timestamps: true } 
);

export default mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
