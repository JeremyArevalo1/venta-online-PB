import { Router } from 'express';
import { check } from 'express-validator';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from './category.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';


const router = Router();

router.get(
    '/',
    getCategories
);

router.get(
    '/:id',
    [
        check('id', 'No es un ID valido').isMongoId(),
        validarCampos
    ],
    getCategoryById
);

router.post(
    '/',
    [
        validarJWT,
        validarCampos
    ],
    createCategory
);

router.put(
    "/:id",
    [
        validarJWT,
        check("id", "No es un ID valido").isMongoId(),
        validarCampos
    ],
    updateCategory
);

router.delete(
    '/:id',
    [
        validarJWT,
        check("id", "No es un id valido"),
        validarCampos
    ],
    deleteCategory
);

export default router;
