import Category from './category.model.js';
import Product from '../products/product.model.js';

export const getCategories = async (req, res) =>{
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, categories] = await Promise.all([
            Category.countDocuments(query),
            Category.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
                .populate({
                    path: 'products', // Campo que hace referencia a los productos
                    select: 'nameProduct description price stock sold', // Seleccionamos los campos que queremos de los productos
                    match: { estado: true } // Solo productos activos
                })
        ])

        res.status(200).json({
            success: true,
            total,
            categories
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener usuario',
            error
        })
    }
};

export const getCategoryById = async (req, res) => {
    try {
 
        const { id } = req.params;
 
        const categories = await Category.findById(id);
 
        if(!categories){
            return res.status(404).json({
                success: false,
                msg: 'Usuario not found'
            })
        }
 
        res.status(200).json({
            success: true,
            categories
        })
 
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener usuarios',
            error
        })
    }
};

export const createCategory = async (req, res) => {
    try {      
        const data = req.body;
        const { nameCategory } = req.body;

        if (!nameCategory) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es obligatorio.'
            });
        };

        if (req.usuario.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden agregar categorias.',
            });
        }

        const normalizedCategoryName = nameCategory.trim().toLowerCase();
        const existingCategory = await Category.findOne({ nameCategory: normalizedCategoryName });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre.'
            });
        }

        const category = new Category({
            ...data,
            nameCategory: normalizedCategoryName
        });

        await category.save();

        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la categoría',
            error
        });
    }
};

export const updateCategory = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { _id, nameCategory, ...data } = req.body;

        const buscarCategory = await Category.findById(id);

        if (!buscarCategory) {
            return res.status(404).json({
                success: false,
                msg: 'Categoria no encontrada'
            });
        };

        if (buscarCategory.nameCategory === 'UNIVERSAL'.toLocaleLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'La categoría predeterminada no se puede editar.'
            });
        }

        if (req.usuario.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden editar las categorias.',
            });
        };

        if (nameCategory) {
            const normalizedCategoryName = nameCategory.trim().toLowerCase();
            const existingCategory = await Category.findOne({
                nameCategory: normalizedCategoryName,
                _id: { $ne: id }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una categoría con este nombre.'
                });
            }

            data.nameCategory = normalizedCategoryName;
        }

        const category = await Category.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Se edito la categoria con exito',
            category
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error al editar la categoria',
            error
        });
    }
};

export const deleteCategory = async (req, res = response) => {
    try {
        const { id } = req.params;
        const buscarCategory = await Category.findById(id);

        if (!buscarCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        };

        if (req.usuario.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar categorías.',
            });
        };

        if (buscarCategory.nameCategory === 'UNIVERSAL'.toLocaleLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'La categoría predeterminada no se puede eliminar.'
            });
        };

        const categoryDefault = await Category.findOne({ nameCategory: 'UNIVERSAL'.toLowerCase() });

        if (!categoryDefault) {
            return res.status(404).json({
                success: false,
                message: 'Categoría predeterminada no encontrada.'
            });
        };

        await Product.updateMany(
            { category: id },
            { category: categoryDefault._id }
        );

        const updatedCategorie = await Category.findByIdAndUpdate(id, { estado: false }, { new: true });

        res.status(200).json({
            success: true,
            message: 'Categoría eliminada exitosamente y productos reasignados a la categoría predeterminada.',
            categorie: updatedCategorie
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la categoría',
            error: error.message || error
        });
    }
}
