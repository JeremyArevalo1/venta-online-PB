'use strict'

import mongoose from "mongoose";
import Category from '../src/categories/category.model.js'

export const dbConnection = async() => {
    try {
        mongoose.connection.on('error', () => {
            console.log("MongoDB | could not be connected to MongoDB");
            mongoose.disconnect();
        });
        mongoose.connection.on('connecting', () => {
            console.log("Mongo | Try connection")
        });
        mongoose.connection.on('connected', () => {
            console.log("Mongo | connected to MongoDB")
        });
        mongoose.connection.on('open', () => {
            console.log("Mongo | connected to database")
        });
        mongoose.connection.on('reconnected', () => {
            console.log("Mongo | reconnected to MongoDB")
        });
        mongoose.connection.on('disconnected', () => {
            console.log("Mongo | disconnected")
        });

        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50,
        });

        await createCategoryDefault();

    } catch (error) {
        console.log('Database connection failed', error);
    }
};

const createCategoryDefault = async () => {
    try {
        const category = await Category.findOne({ nameCategory: 'UNIVERSAL'.toLowerCase() });

        if (!category) {
            const categoryDefault = new Category({
                nameCategory: 'UNIVERSAL'.toLowerCase(),
                description: 'un poco de todo'
            });

            await categoryDefault.save();
            console.log('Categoria predeterminada creada exitosamente');
        } else {
            console.log("La categoria ya existe");
        }
    } catch (error) {
        console.log('Error creating category', error);
    }
}