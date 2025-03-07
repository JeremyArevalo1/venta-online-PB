import { Router } from "express";
import { check } from "express-validator";
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct, searchProductsByName, searchProductsByCategoryName, searchTopSellingProducts, getOutOfStockProducts } from "./product.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.get(
    "/productoMasVendido",
    searchTopSellingProducts
);

router.get(
    "/productosAgotados",
    getOutOfStockProducts
);


router.get(
    "/",
    getProducts
);

router.get(
    "/:id",
    [
        check("id", "no es un id valido"),
        validarCampos
    ],
    getProductById
);

router.post(
    "/",
    [
        validarJWT,
        validarCampos
    ],
    addProduct
);

router.put(
    "/:id",
    [
        validarJWT,
        check("id", "No es un id válido").isMongoId(),
        validarCampos
    ],
    updateProduct
);

router.delete(
    '/:id',
    [
        validarJWT,
        check("id", "No es un id valido"),
        validarCampos
    ],
    deleteProduct
);

router.get(
    "/buscarProductoPorNombre/:name",
    searchProductsByName
);

router.get(
    "/buscarProductoPorCategoria/:categoryName",
    searchProductsByCategoryName
);



export default router;