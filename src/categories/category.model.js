import { Schema, model } from "mongoose";

const CategorySchema = Schema({
    nameCategory: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
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

export default model('category', CategorySchema);