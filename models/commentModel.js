const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    productId:{
        type:String,
        required:true,
    },
    content:{
        type:String,
        required:true,
    }
},{timestamps:true})


module.exports = mongoose.model("comments",commentSchema);