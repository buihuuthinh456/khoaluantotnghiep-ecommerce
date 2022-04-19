const Categories = require('../models/categoryModel');
const {Base64} = require('js-base64')

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
        console.log(req.body.extraData)
        const dataString = Base64.decode(req.body.extraData)
        console.log(dataString)
        const objReturn = {...req.body,extraData:JSON.parse(dataString)}
        console.log(objReturn)
        return res.status(200).json(objReturn)
    },
}

module.exports = categoryCtrl;