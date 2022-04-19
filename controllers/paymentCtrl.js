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
    createPayment: async (req,res)=>{
        console.log(req.body)
        // const {data} = req.body
        const data = {
            userId:"1232323",
            cart:[
                {
                    id:1,
                    name:"222"
                }
            ]
        }
        const dataString = JSON.stringify(data)
        const partnerCode = process.env.PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretkey = process.env.MOMO_SECRET_KEY;
        const requestId = partnerCode + new Date().getTime();
        const orderId = requestId;
        const orderInfo = "pay with MoMo";
        const redirectUrl = "http://localhost:3000/login";
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