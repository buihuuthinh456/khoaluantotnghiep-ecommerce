const Order = require('../models/oderModel');
const {Base64} = require('js-base64');
const crypto = require('crypto');

const paymentCtrl = {
    getOrders: async(req,res)=>{
        try {
            const order = await Order.find();
            res.json(order)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    createOrder: async(req,res)=>{
        const {amount,responseTime,message,extraData,orderId,orderInfo,requestId,signature,resultCode,orderType,payType,transId} = req.body
        const dataString = Base64.decode(req.body.extraData)
        const objReturn = {
            amount,
            requestId,
            orderId,
            orderInfo,
            orderType,
            transId,
            extraData:JSON.parse(dataString)
        }
        // console.log(objReturn)
        const partnerCode = "MOMOGBTS20220418";
        const accessKey = "KGDQTLnO7joW8VLr";
        const secretkey = "TvNolIYyB2VtU586qksVtSnRlGGZhAIw";

        const rawSignature = "accessKey="+accessKey +"&amount="+amount +"&extraData="+extraData+"&message="+message+"&orderId="+orderId+"&orderInfo="+orderInfo+"&orderType="+orderType+"&partnerCode="+partnerCode+"&payType="+payType+"&requestId="+requestId+"&responseTime="+responseTime+"&resultCode="+resultCode+"&transId="+transId
        const signatureVerify = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');
        if(signature===signatureVerify){
            if(resultCode===0){
                console.log('Thành công mĩ mãn')
                // objReturn
                // Lưu dữ liệu vào Database
                const newOrder = new Order(objReturn)
                await newOrder.save();
                console.log('Thanh toán thành công')
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

module.exports = paymentCtrl;