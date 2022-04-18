const Categories = require('../models/categoryModel');

const categoryCtrl = {
    getCategories: async(req,res)=>{
        try {
            const categories = await Categories.find();
            res.json(categories)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    createCategory: async(req,res)=>{
        console.log(req.body)
        return res.status(200).json("Hay")
    },
}

module.exports = categoryCtrl;