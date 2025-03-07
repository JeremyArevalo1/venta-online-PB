'use strict';

import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from './mongo.js';
import limiter from '../src/middlewares/validar-cant-peticiones.js';
import authRoutes from '../src/auth/auth-router.js';
import authUsers from '../src/users/user.routes.js';
import authCategoy from '../src/categories/category.routes.js';
import authProduct from '../src/products/product.routes.js';
import authShoppingCart from '../src/shoppingCart/shoppingCart.routes.js';
import authInvoice from '../src/invoices/invoice.routes.js';
 

const middlewares = (app) => {
    app.use(express.urlencoded({ extended : false }));
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(limiter);
}

const routes = (app) => {
    app.use('/ventaOnline/v1/auth', authRoutes);
    app.use('/ventaOnline/v1/users', authUsers);
    app.use('/ventaOnline/v1/categories', authCategoy);
    app.use('/ventaOnline/v1/products', authProduct);
    app.use('/ventaOnline/v1/shoppingcarts', authShoppingCart);
    app.use('/ventaOnline/v1/invoices', authInvoice);
}

const conectarDB = async () => {
    try {
        await dbConnection();
        console.log('Se ha establecido la conexión con la base de datos.');
    } catch (error) {
        console.log('Error al conectar con la base de datos', error);
    }
}

export const initserver = async () => {
    const app = express();
    const port = process.env.PORT || 3002;

    try {
        middlewares(app);
        conectarDB();
        routes(app);
        app.listen(port)
        console.log(`Server running on port ${port}`)
    } catch (err) {
        console.log(`Server init failed: ${err}`);
    }

}