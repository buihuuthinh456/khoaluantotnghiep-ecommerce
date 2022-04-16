const Products = require('../models/productModel');
const Categories = require('../models/categoryModel');
const homeCtrl = {
    getHome: async(req,res)=>{
        try {
            const listproduct = Products.find().sort('createdAt').limit(20);
            const productsBestViews = Products.find().sort('-views').limit(20);
            const productsLastest = Products.find().sort('-createdAt').limit(20);
            const listCategory = Categories.find().sort('-createdAt')

            const result = await Promise.all([listproduct,productsBestViews,productsLastest,listCategory])

            const response = {
                allProduct: result[0],
                hotProduct: result[1],
                newProduct: result[2],
                categories:result[3]
            }

            console.log(response)

            return res.status(200).json(response)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
}

module.exports = homeCtrl;