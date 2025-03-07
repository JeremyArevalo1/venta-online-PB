import { Router } from "express";
import { check } from "express-validator";
import { getInvoices, getInvoiceById, createInvoice, getInvoicesByClientName } from "./invoice.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router();

router.get(
    "/",
    getInvoices
);

router.get(
    "/:id",
    [
        check("id", "no es un id valido"),
        validarCampos
    ],
    getInvoiceById
);

router.post(
    "/",
    [
        validarCampos
    ],
    createInvoice
);

router.get(
    "/facturasdeuncliente/:clientName",
    [
        check("id", "no es un id valido"),
        validarCampos
    ],
    getInvoicesByClientName
);

export default router;