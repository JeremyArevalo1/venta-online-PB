import { Router } from "express";
import { loginAdmin, loginClient, registerAdmins, registerClient } from "./auth.controller.js";
import { registerValidator, loginValidator } from "../middlewares/validator.js";
import { deleteFileOnError } from "../middlewares/deleteFileOnError.js";
import { validarJWT } from "../middlewares/validar-jwt.js";


const router = Router();

router.post(
    '/loginAdministrador',
    loginValidator,
    deleteFileOnError,
    loginAdmin
);

router.post(
    '/loginClientes',
    loginValidator,
    deleteFileOnError,
    loginClient
);

router.post(
    '/registerAdministrador',
    registerValidator,
    deleteFileOnError,
    registerAdmins
);

router.post(
    '/registerClientes',
    registerValidator,
    validarJWT,
    deleteFileOnError,
    registerClient
);

export default router;