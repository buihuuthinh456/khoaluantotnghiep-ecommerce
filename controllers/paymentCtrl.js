const Order = require('../models/oderModel');
const User = require('../models/userModel')
const {Base64} = require('js-base64');
const crypto = require('crypto');




const paymentCtrl = {
    getOrders: async(req,res)=>{
        try {
            if(req.query?.dateStart && req.query?.dateEnd){
                const dateStart = moment(req.query.dateStart).format("YYYY-MM-DD")
                const dateEnd = moment(req.query.dateEnd).format("YYYY-MM-DD")
                const orders = await Orders.find({
                    createdAt:{
                        $gte:dateStart,$lte:dateEnd
                    }
                })
                return req.status(200).json(orders);
            }else{
                const orders = await Order.find();
                return res.status(200).json(orders)
            }
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    getHistoryPayment:async(req,res)=>{
        try {
            const userId = req.user.id
            const orders = await Order.find({userId})
            return res.status(200).json(orders)
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },
    getHistoryByUserId:async(req,res)=>{
        try {
            const {id} = req.params
            const orders = await Order.find({userId:id})
            return res.status(200).json(orders)
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },
    createPayment: async (req,res)=>{
        const _id = req.user.id
        const {cart,address} = req.body
        // const cart = [
        //     {
        //         id:1,
        //         name:"222"
        //     }
        // ]
        // const address = "xã Tân Mỹ , huyện Lấp Vò, tỉnh Đồng Tháp"


        const data = {
            userId:_id,
            cart:cart,
            address:address
        }
        const dataString = JSON.stringify(data)
        const partnerCode = process.env.PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretkey = process.env.MOMO_SECRET_KEY;
        const requestId = partnerCode + new Date().getTime();
        const orderId = requestId;
        const orderInfo = "pay with MoMo";
        const redirectUrl = "https://tshopic.netlify.app/successful";
        const ipnUrl = "https://khoaluantotnghiep-ecommerce.herokuapp.com/api/payment/ipn";
        const {amount} = req.body
        const requestType = "captureWallet"
        const extraData = Base64.encode(dataString)
        const rawSignature = "accessKey="+accessKey+"&amount=" + amount+"&extraData=" + extraData+"&ipnUrl=" + ipnUrl+"&orderId=" + orderId+"&orderInfo=" + orderInfo+"&partnerCode=" + partnerCode +"&redirectUrl=" + redirectUrl+"&requestId=" + requestId +"&requestType="+requestType
        const signature = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');
        const requestBody = JSON.stringify({
            partnerCode : partnerCode,
            accessKey : accessKey,
            requestId : requestId,
            amount : amount,
            orderId : orderId,
            orderInfo : orderInfo,
            redirectUrl : redirectUrl,
            ipnUrl : ipnUrl,
            extraData : extraData,
            requestType : requestType,
            signature : signature,
            lang: 'vi'
        });

        const https = require('https');
        const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        }
        //Send the request and get the response
        const request = https.request(options, response => {
            // console.log(`Status: ${res.statusCode}`);
            // console.log(`Headers: ${JSON.stringify(response.headers)}`);
            response.setEncoding('utf8');
            response.on('data', (body) => {
                const obj = {
                    body:body,
                    payUrl:JSON.parse(body).payUrl
                }
                return res.json(obj)
            });
            response.on('end', () => {
                console.log('No more data in response.');
            });
        })
        request.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
        });
        // write data to request body
        // console.log("Sending....")
        request.write(requestBody);
        request.end();
    },
    createOrder: async(req,res)=>{
        const {amount,responseTime,message,extraData,orderId,orderInfo,requestId,signature,resultCode,orderType,payType,transId} = req.body
        const dataString = Base64.decode(req.body.extraData)
        const {userId}=JSON.parse(dataString)
        const objReturn = {
            amount,
            requestId,
            orderId,
            orderInfo,
            orderType,
            transId,
            extraData:JSON.parse(dataString),
            userId
        }
        // console.log(objReturn)
        const partnerCode = process.env.PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretkey = process.env.MOMO_SECRET_KEY;

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
                // console.log('Thanh toán thành công')

                const {userId} = JSON.parse(dataString)
                await User.findByIdAndUpdate(userId,{cart:[]})
                return res.status(200).json(objReturn)
            }
            else{
                // console.log('Đúng chữ ký nhưng có vẻ gì đó sai sai')
                return res.status(400).json("Sai sai")
            }
        }
        else{
                // console.log('Thất bại hoàn toàn')
                return res.status(400).json("Sai hoàn toàn")
        }
    },
    createOrderCash:async(req,res)=>{
        const {amount,cart,address} = req.body
        const {id:_id} = req.user
        // Extradata sẽ bao gồm {userId, cart, address}
        const extraData = {
            userId:_id,
            cart,
            address,
        }
        const orderId = "CASH" +Math.floor(Math.random() * Math.pow(10,6)) + new Date().getTime()
        const orderInfo = "pay with cash"
        const requestId = orderId
        const orderType = "direct payment"
        const transId = Math.floor(Math.random() * Math.pow(10,8));
        const objectReturn = {
            amount,
            extraData,
            orderId,
            orderInfo,
            orderType,
            requestId,
            transId,
            userId:_id
        }
        const extraDataString = Base64.encodeURI(JSON.stringify(extraData))
        const url_return = 'https://tshopic.netlify.app/successful'
        const payment_Url = `${url_return}?amount=${amount}`
                                        +`&orderId=${orderId}`
                                        +`&orderInfo=${orderInfo}`
                                        +`&orderType=${orderType}`
                                        +`&requestId=${requestId}`
                                        +`&transId=${transId}`
                                        +`&extraData=${extraDataString}`
        const newOrder = new Order(objectReturn)
        await newOrder.save();
        await User.findByIdAndUpdate(extraData.userId,{cart:[]})
        return res.status(200).json({data:objectReturn, payment_Url:payment_Url})
    },
    updateStatusTrans:async(req,res)=>{
       try {
            const {_id,stateTrans} = req.body;
            const newOrder = await Order.findByIdAndUpdate(_id,{
                stateTrans
            },{new:true});
            
            return res.status(200).json(newOrder)
       } catch (error) {
           return res.status(500).json({msg:error.message})
       }
        
    },
    updateOrder:async(req,res)=>{
        try {
            // const discount = {
            //     type:"number",
            //     value:50000
            // }
            // const discount = {
            //     type:"rate%",
            //     value:10
            // }
             const {_id,discount} = req.body;
             const newOrder = await Order.findByIdAndUpdate(_id,{
                 discount
             },{new:true});
             
             return res.status(200).json(newOrder)
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
         
     },
}

module.exports = paymentCtrl;