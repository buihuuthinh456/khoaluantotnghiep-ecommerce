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
        const {amount,extraData,orderId,orderInfo,requestId,requestType,signature,resultCode} = req.body
        const dataString = Base64.decode(req.body.extraData)
        const objReturn = {...req.body,extraData:JSON.parse(dataString)}
        console.log(objReturn)

        const partnerCode = "MOMOGBTS20220418";
        const accessKey = "KGDQTLnO7joW8VLr";
        const secretkey = "TvNolIYyB2VtU586qksVtSnRlGGZhAIw";
        const ipnUrl = "https://khoaluantotnghiep-ecommerce.herokuapp.com/api/payment/ipn";
        const redirectUrl = "http://localhost:3000/login";


        const rawSignature = "accessKey="+accessKey+"&amount=" + amount+"&extraData=" + extraData+"&ipnUrl=" + ipnUrl+"&orderId=" + orderId+"&orderInfo=" + orderInfo+"&partnerCode=" + partnerCode +"&redirectUrl=" + redirectUrl+"&requestId=" + requestId+"&requestType=" + requestType
        const signatureVerify = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');
        if(signature===signatureVerify){
            if(resultCode=0){
                console.log('Thành công mĩ mãn')
            return res.status(200).json(objReturn)
            }
            else{
                console.log('Đúng chữ ký nhưng có vẻ gì đó sai sai')
            return res.status(400).json("Sai sai")
            }
        }
        else{
            console.log('Thất bại hoàn toàn')
            return res.status(400).json("Sai hoàn toàn")
        }


    },
}

module.exports = categoryCtrl;