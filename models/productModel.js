const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    images:{
        type:Array,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    quantity:{
        type:Number,
        default:0,
    },
    description:{
        type:String,
        required:true,
    }
    
})

module.exports = mongoose.model("products",productSchema);