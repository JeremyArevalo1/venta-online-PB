import ShoppingCart from './shoppingCart.model.js';
import User from '../users/user.model.js';
import Product from '../products/product.model.js'


export const getShoppingCarts = async (req, res) =>{
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, shoppingcarts] = await Promise.all([
            ShoppingCart.countDocuments(query),
            ShoppingCart.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            shoppingcarts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener los carritos de compras de los clientes',
            error
        })
    }
};

export const getShoppingCartById = async (req, res) => {
    try {
        const { id } = req.params;
        const shoppingcarts = await ShoppingCart.findById(id);
 
        if(!shoppingcarts){
            return res.status(404).json({
                success: false,
                msg: 'Carrito de compras no encontrado'
            })
        }
 
        res.status(200).json({
            success: true,
            shoppingcarts
        })
 
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener el carrito de compras',
            error
        })
    }
};

export const addShoppingCarts = async (req, res) => {
    try {
        const data = req.body;
        const client = await User.findOne({ name: data.client });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        const existingCart = await ShoppingCart.findOne({ client: client._id });

        if (existingCart) {
            return res.status(400).json({
                success: false,
                message: 'Este cliente ya tiene un carrito de compras'
            });
        }

        const productsArray = [];
        for (let item of data.products) {
            const product = await Product.findOne({ nameProduct: item.nameProduct.toLowerCase(), estado: true });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Producto '${item.nameProduct}' no encontrado o esta desactivado (estado: false)`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `No hay suficiente stock para el producto '${item.nameProduct}'`
                });
            }

            product.stock -= item.quantity;
            await product.save();

            productsArray.push({ product: product._id, quantity: item.quantity });
        }

        const cart = new ShoppingCart({
            client: client._id,
            products: productsArray
        });

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Carrito creado con productos agregados',
            cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al agregar el carrito',
            error
        });
    }
};

export const updateShoppingCart = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const cart = await ShoppingCart.findById(id);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Carrito no encontrado'
            });
        }

        if (cart.client.toString() !== req.usuario.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Solo el dueño del carrito puede manipular su carrito de compras',
            });
        }

        const currentProducts = cart.products;

        const updatedProducts = [];
        for (let item of data.products) {
            const product = await Product.findOne({ nameProduct: item.nameProduct.toLowerCase() });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Producto '${item.nameProduct}' no encontrado`
                });
            };

            const existingProduct = currentProducts.find(p => p.product.toString() === product._id.toString());
            if (existingProduct) {
                const quantityDifference = existingProduct.quantity - item.quantity;

                if (quantityDifference > 0) {
                    product.stock += quantityDifference; 
                    await product.save();
                } else if (quantityDifference < 0) {
                    const increaseQuantity = Math.abs(quantityDifference);
                    if (product.stock < increaseQuantity) {
                        return res.status(400).json({
                            success: false,
                            message: `No hay suficiente stock para el producto '${item.nameProduct}'`
                        });
                    }

                    product.stock -= increaseQuantity;
                    await product.save();
                }
            } else {
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `No hay suficiente stock para el producto '${item.nameProduct}'`
                    });
                }

                product.stock -= item.quantity;
                await product.save();
            }

            updatedProducts.push({ product: product._id, quantity: item.quantity });
        }

        cart.products = updatedProducts;

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Carrito actualizado correctamente',
            cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el carrito',
            error
        });
    }
};

export const deleteShoppingCart = async (req, res) => {
    try {
        const { id } = req.params;

        const cart = await ShoppingCart.findById(id);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Carrito no encontrado'
            });
        }

        if (cart.client.toString() !== req.usuario.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Solo el dueño del carrito puede eliminar su carrito de compras',
            });
        }

        for (let item of cart.products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Producto con id '${item.product}' no encontrado`
                });
            }

            product.stock += item.quantity;
            await product.save();
        }

        await ShoppingCart.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Carrito eliminado correctamente y se regresaron los productos'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el carrito',
            error
        });
    }
};

// ////////////////////////////////////////////////////////////////////////////////////////////////

export const getShoppingCartByClient = async (req, res) => {
    try {
        const { id } = req.params;

        const client = await User.findById(id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        const shoppingCart = await ShoppingCart.findOne({ client: client._id });

        if (!shoppingCart) {
            return res.status(404).json({
                success: false,
                message: 'Este cliente no tiene carrito de compras'
            });
        }

        res.status(200).json({
            success: true,
            shoppingCart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el carrito del cliente',
            error
        });
    }
};