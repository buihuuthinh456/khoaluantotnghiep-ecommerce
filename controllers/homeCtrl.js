const Products = require('../models/productModel');
const Categories = require('../models/categoryModel');
const AnalysisData = require('../models/analysisDataModel');
const Orders = require('../models/oderModel');
const requestIp = require('request-ip');
const moment = require('moment');

class APIfeatures {
    constructor(query, queryString){
        this.query = query
        this.queryString = queryString
    }

    filtering(){
        const queryObj = {...this.queryString}
        if(queryObj.dateStart&&queryObj.dateEnd){
            const dateStart = moment(queryObj.dateStart).format("YYYY-MM-DD")
            const dateEnd = moment(queryObj.dateEnd).format("YYYY-MM-DD")
            this.query.find({time:{"$gte":dateStart,"$lte":dateEnd}})
        }
        return this
    }
}

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
            const userId = req.body.userId || requestIp.getClientIp(req)
            let timeStructure = moment(new Date()).format("YYYY-MM-DD");
            console.log(timeStructure)
            const data = await AnalysisData.findOne({time:{$regex:timeStructure}})
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
            const features = new APIfeatures(AnalysisData.find(),req.query).filtering()
            const Data = await features.query.sort("time")


            const dateStart = moment(req.query.dateStart).format("YYYY-MM-DD")
            const dateEnd = moment(req.query.dateEnd).format("YYYY-MM-DD")

            const paymentData = await Orders.find({
                createdAt:{
                    $gte:dateStart,$lte:dateEnd
                }
            })

            const result = {
                accessData: Data,
                paymentData: paymentData
            }
            return res.status(200).json(result)
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    }
}

module.exports = homeCtrl;