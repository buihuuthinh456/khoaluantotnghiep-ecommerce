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
    },
    views:{
        type:Number,
        required:false,
        default:0,
    }
},{timestamps:true})

module.exports = mongoose.model("products",productSchema);