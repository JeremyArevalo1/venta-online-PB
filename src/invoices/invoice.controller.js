import Invoice from './invoice.model.js';
import ShoppingCart from '../shoppingCart/shoppingCart.model.js';
import User from '../users/user.model.js';

export const getInvoices = async (req, res) =>{
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, invoices] = await Promise.all([
            Invoice.countDocuments(query),
            Invoice.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            invoices
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener usuario',
            error
        })
    }
};

export const getInvoiceById = async (req, res) => {
    try {
 
        const { id } = req.params;
 
        const invoices = await Invoice.findById(id);
 
        if(!invoices){
            return res.status(404).json({
                success: false,
                msg: 'Usuario not found'
            })
        }
 
        res.status(200).json({
            success: true,
            invoices
        })
 
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener usuarios',
            error
        })
    }
};

export const createInvoice = async (req, res) => {
    try {
        const { shoppingCart } = req.body;

        const cart = await ShoppingCart.findById(shoppingCart)
            .populate('client')  
            .populate('products.product'); 

        if (!cart) {
            return res.status(404).json({
                success: false,
                msg: 'Carrito de compras no encontrado'
            });
        }

        const total = cart.products.reduce((acc, item) => {
            const product = item.product;
            if (!product || typeof product.price !== 'number') return acc;
            return acc + (product.price * item.quantity);
        }, 0);

        const invoice = new Invoice({
            shoppingCart,
            client: cart.client._id,
            products: cart.products.map(item => ({
                product: item.product._id, 
                quantity: item.quantity
            })),
            total
        });

        await invoice.save();

        await ShoppingCart.findByIdAndDelete(shoppingCart);

        res.status(201).json({
            success: true,
            msg: 'Factura creada exitosamente',
            msg: 'Gracias por su compras :)',
            invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al crear la factura',
            error
        });
    }
};

// /////////////////////////////////////////////////////////////////////

export const getInvoicesByClientName = async (req, res) => {
    try {
        const { clientName } = req.params;

        const client = await User.findOne({ name: clientName });

        if (!client) {
            return res.status(404).json({
                success: false,
                msg: `Cliente '${clientName}' no encontrado`
            });
        }

        const query = { client: client._id, estado: true };

        const [total, invoices] = await Promise.all([
            Invoice.countDocuments(query),
            Invoice.find(query) 
        ]);

        if (invoices.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Este cliente no tiene facturas'
            });
        }

        res.status(200).json({
            success: true,
            total,
            invoices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener facturas del cliente',
            error
        });
    }
};