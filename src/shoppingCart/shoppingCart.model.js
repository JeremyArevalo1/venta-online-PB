import { Schema, model } from "mongoose";

const ShoppingCartSchema = Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [ 1, 'la cantidad debe ser al menos 1' ]
        }
    }],
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
export default model('shoppingCart', ShoppingCartSchema);