import { Router } from "express";
import { check } from "express-validator";
import { getShoppingCarts, getShoppingCartById, addShoppingCarts, updateShoppingCart, deleteShoppingCart, getShoppingCartByClient } from "./shoppingCart.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.get(
    "/",
    getShoppingCarts
);

router.get(
    "/:id",
    [
        check("id", "no es un id valido"),
        validarCampos
    ],
    getShoppingCartById
);

router.post(
    "/",
    [
        validarCampos
    ],
    addShoppingCarts
);

router.put(
    "/:id",
    [
        validarJWT,
        check("id", "No es un id válido").isMongoId(),
        validarCampos
    ],
    updateShoppingCart
);

router.delete(
    '/:id',
    [
        validarJWT,
        check("id", "No es un id valido"),
        validarCampos
    ],
    deleteShoppingCart
);

router.get(
    "/getShoppingCartByClient/:id",
    [
        check("id", "no es un id valido"),
        validarCampos
    ],
    getShoppingCartByClient
);

export default router;