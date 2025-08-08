// model/collection_product.ts
import mongoose from "mongoose";

const collectionProductSchema = new mongoose.Schema({
  id_product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  id_collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Ràng buộc 1 sản phẩm không nằm 2 lần trong cùng 1 collection
collectionProductSchema.index({ id_product: 1, id_collection: 1 }, { unique: true });

export default mongoose.models.CollectionProduct ||
  mongoose.model("CollectionProduct", collectionProductSchema);
