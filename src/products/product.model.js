import { Schema, model } from "mongoose";

const ProductSchema = Schema({
    nameProduct: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio']
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: [true, 'Ingresa un precio al producto']
    },
    stock: {
        type: Number,
        required: [true, 'La cantidad del producto es necesaria']
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    sold: {
        type: Number,
        default: 0
    },
    estado: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);

export default model('product', ProductSchema);