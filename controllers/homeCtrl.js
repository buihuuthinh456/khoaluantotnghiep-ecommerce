const Products = require('../models/productModel');
const Categories = require('../models/categoryModel');
const AnalysisData = require('../models/analysisDataModel');
const requestIp = require('request-ip');


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
            return res.status(200).json(response)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    postDataAccess: async(req,res)=>{
        try {
            const day = new Date().getDay()
            const month = new Date().getMonth()
            const year = new Date().getFullYear()
            const userId = req.body.userId || requestIp.getClientIp(req)
            const timeStructure = `${day}/${month}/${year}`
            let regex = new RegExp(`${day}\S*`)
            const data = await AnalysisData.findOne({time:{$regex:regex}})
            if(data){
                console.log("IP just access ",userId)
                const users = data.users
                const userAccessed = users.some((el)=>el===userId)
                if(userAccessed){
                    return res.status(200).json(data)
                }
                else{
                    data.count = data.count + 1
                    data.users = [...users,userId]
                    await data.save()
                }
                return res.status(200).json(data)
            }
            else{
                const newData = new AnalysisData({
                    time:timeStructure,
                    users:[userId],
                    count:1
                })

                await newData.save()
                return res.status(200).json({msg:"Đã lưu"})
            }
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },

    getDataAccess:async(req,res)=>{
        try {
            const Data = await AnalysisData.find()
            return res.status(200).json(Data)
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    }
}

module.exports = homeCtrl;