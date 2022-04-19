const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    amount:{
        type:Number,
        required:true,
    },
    requestId:{
        type:String,
        required:true,
    },
    orderId:{
        type:String,
        required:true,
    },
    orderInfo:{
        type:String,
        required:true,
    },
    orderType:{
        type:String,
        required:true
    },
    transId:{
        type:Number,
        required:true,
    },
    extraData:{
        type:Object,
        required:true,
    }
},{timestamps:true})

module.exports = mongoose.model('orders',orderSchema);