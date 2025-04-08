import mongoose from 'mongoose';

const PriceVariationSchema = new mongoose.Schema({
    price: { type: Number, required: true },
    discount_price: { type: Number, default: 0 },
    offer_price: { type: Number, default: 0 }
});

export const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    featured_img: { type: String, required: true },
    route: { type: String, required: true, unique: true },
    price_variation: [PriceVariationSchema],
    category: {
        name: { type: String, required: true },
        description: { type: String, required: true }
    },
    sub_category: { type: String, required: true },
    brands: { type: String, required: true }
}, { timestamps: true });

const beerProducts = mongoose.model('beerProducts', ProductSchema);
export default beerProducts
