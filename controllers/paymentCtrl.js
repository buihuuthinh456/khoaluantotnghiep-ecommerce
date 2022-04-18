const Categories = require('../models/categoryModel');
const base64 = require('base-64')

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
        console.log('12321',req.body)
        console.log(JSON.parse(req.body))
        return res.status(200).json(req.body)
    },
}

module.exports = categoryCtrl;