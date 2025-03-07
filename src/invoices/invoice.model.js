import { Schema, model } from 'mongoose';

const InvoiceSchema = Schema({
    shoppingCart: {
        type: Schema.Types.ObjectId,
        ref: 'shoppingCart',
        required: true
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'product'
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
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

export default model('invoice', InvoiceSchema);