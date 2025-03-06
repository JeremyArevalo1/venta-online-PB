import Usuario from '../users/user.model.js';
import { hash, verify } from 'argon2';
import { generarJWT } from '../helpers/generate-jwt.js';

export const loginAdmin = async (req, res) => {

    const { email, password, username } = req.body;


    try {
        const user = await Usuario.findOne({
            $or: [{ email }, { username }]
        });

        if (!user) {
            return res.status(400).json({
                msg: 'Credencial incorrecta, correo o username no existe en la base de datos'
            })
        }

        if (!user.estado) {
            return res.status(400).json({
                msg: 'El usuario no existe en la base de datos'
            })
        }

        const validPassword = await verify(user.password, password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'La contraseña es incorrecta'
            })
        }
        const token = await generarJWT(user.id);

        res.status(200).json({
            msg: 'Inicio de sesion exitoso',
            userDetails: {
                username: user.username,
                role: user.role,
                token: token,
            }
        });


    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'server error',
            error: e.message
        });
    }
}

export const loginClient = async (req, res) => {

    const { email, password, username } = req.body;


    try {
        const user = await Usuario.findOne({
            $or: [{ email }, { username }]
        });

        if (!user) {
            return res.status(400).json({
                msg: 'Credencial incorrecta, correo o username no existe en la base de datos'
            })
        }

        if (!user.estado) {
            return res.status(400).json({
                msg: 'El usuario no existe en la base de datos'
            })
        }

        const validPassword = await verify(user.password, password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'La contraseña es incorrecta'
            })
        }
        const token = await generarJWT(user.id);

        res.status(200).json({
            msg: 'Inicio de sesion exitoso',
            userDetails: {
                username: user.username,
                role: user.role,
                token: token,
            }
        });


    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'server error',
            error: e.message
        });
    }
}

export const registerAdmins = async (req, res) => {
    try {
        const data = req.body;

        const encryptedPassword = await hash(data.password);

        const user = await Usuario.create({
            name: data.name,
            username: data.username,
            email: data.email,
            password: encryptedPassword,
            phone: data.phone,
            role: 'ADMIN_ROLE'
        });

        return res.status(201).json({
            message: "User registered successfully",
            userDetails: {
                name: user.name,
                user: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "User registration failed",
            error: error.message
        });
    }
}

export const registerClient = async (req, res) => {
    try {
        if (req.usuario.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para agregar clientes.',
            });
        }

        const data = req.body;

        const encryptedPassword = await hash(data.password);

        const user = await Usuario.create({
            name: data.name,
            username: data.username,
            email: data.email,
            password: encryptedPassword,
            phone: data.phone,
            role: 'CLIENT_ROLE'
        });

        return res.status(201).json({
            message: "User registered successfully",
            userDetails: {
                name: user.name,
                user: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "User registration failed",
            error: error.message
        });
    }
}