import Product from "./product.model.js";
import Category from "../categories/category.model.js";

export const getProducts = async (req, res) =>{
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            products
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener el producto',
            error
        })
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await Product.findById(id);
 
        if(!products){
            return res.status(404).json({
                success: false,
                msg: 'Producto no encontrado'
            })
        }
 
        res.status(200).json({
            success: true,
            products
        })
 
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener el producto',
            error
        })
    }
};

export const addProduct = async (req, res) => {
    try {
        const data = req.body;
        const { nameProduct } = req.body;
        const buscarCategory = await Category.findOne({ nameCategory: data.category.toLowerCase() });

        if (!buscarCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        };

        if (req.usuario.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden agregar productos.',
            });
        }

        const normalizedProductName = nameProduct.trim().toLowerCase();
        const existingProduct = await Product.findOne({ nameProduct: normalizedProductName });
        
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un producto con este nombre.'
            });
        }

        const addProduct = new Product({
            ...data,
            nameProduct: normalizedProductName,
            category: buscarCategory._id
        });

        await addProduct.save();

        buscarCategory.products.push(addProduct._id);
        await buscarCategory.save();

        res.status(200).json({
            success: true,
            product: addProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al agregar el producto',
            error
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const { nameProduct } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
            });
        }

        if (req.usuario.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden editar productos.',
            });
        }

        const normalizedProductName = nameProduct.trim().toLowerCase();
        const existingProduct = await Product.findOne({ nameProduct: normalizedProductName });

        if (existingProduct && existingProduct._id.toString() !== id) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un producto con este nombre.',
            });
        }

        const buscarCategory = await Category.findOne({ nameCategory: data.category.toLowerCase() });

        if (!buscarCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada',
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                ...data,
                nameProduct: normalizedProductName,
                category: buscarCategory._id,
            },
            { new: true }
        );
        res.status(200).json({
            success: true,
            message: 'Producto actualizado correctamente',
            product: updatedProduct,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al editar el producto',
            error,
        });
    }
};

export const deleteProduct = async (req, res = response) => {
    try {
        const { id } = req.params;
        const buscarproducto = await Product.findById(id);

        if (!buscarproducto) {
            return res.status(404).json({
                success: false,
                message: 'producto no encontrado'
            });
        };

        if (req.usuario.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar los productos.',
            });
        };

        const updatedProduct = await Product.findByIdAndUpdate(id, { estado: false }, { new: true });

        res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente',
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error
        });
    }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////// //

export const searchProductsByName = async (req, res) => {
    try {
        const { name } = req.params;
        const product = await Product.findOne({ nameProduct: name });

        if (!product) {
            return res.status(404).json({
                success: false,
                msg: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener el producto',
            error
        });
    }
};

export const searchProductsByCategoryName = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const { categoryName } = req.params;

        const category = await Category.findOne({ nameCategory: categoryName });

        if (!category) {
            return res.status(404).json({
                success: false,
                msg: 'Categoría no encontrada'
            });
        }

        const query = { estado: true, category: category._id };

        const [total, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'No se encontraron productos en esta categoría'
            });
        }

        res.status(200).json({
            success: true,
            total,
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener los productos de la categoría',
            error
        });
    }
};

export const searchTopSellingProducts = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
                .sort({ sold: -1 })
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            products
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener el producto',
            error
        })
    }
};

// Productos agotados

export const getOutOfStockProducts = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { estado: true, stock: 0 }; // Solo productos con stock 0

        const [total, products] = await Promise.all([
            Product.countDocuments(query), // Contamos solo los productos sin stock
            Product.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.status(200).json({
            success: true,
            total,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener los productos agotados',
            error
        });
    }
};