const Categories = require('../models/categoryModel');
const Products = require('../models/productModel');

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
        try {
            // Only admin can create, delete and update category
            const {name} = req.body;
            const category = await Categories.findOne({name});
            if(category) return res.status(400).json({msg:"This category already exists"})
            const newCategory = new Categories({name})
            await newCategory.save();
            return res.status(200).json({msg:"Create Successfull"})
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    deleteCategory: async(req,res)=>{
        try {
            await Categories.findByIdAndDelete(req.params.id)
            return res.json({msg:"Delete Successfull"})
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    updateCategory: async(req,res)=>{
      try {
          const {name} = req.body;

          const oldCategory = await Categories.findById({_id:req.params.id})
          const newCategory = await Categories.findByIdAndUpdate({_id:req.params.id},{name})
          console.log(newCategory)
          const oldCategoryName = oldCategory.name
          console.log()
          const resUpdateProducts = await Products.updateMany({category:oldCategoryName},{$set:{"category": name}})
          console.log(resUpdateProducts)
          return res.json({msg:"Update Successfull"})
      } catch (err) {
          return res.status(500).json({msg:err.message})
      }  
    },
}

module.exports = categoryCtrl;