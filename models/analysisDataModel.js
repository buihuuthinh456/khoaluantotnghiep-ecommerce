const mongoose = require('mongoose')

const analysisDataSchema = new mongoose.Schema({
    count:{
        type:Number,
        required:false,
        default:0
    },
    time:{
        type:String,
        required:true
    },
    users:{
        type:Array,
        required:true,
        default:[]
    }
})

module.exports = mongoose.model("analysisData",analysisDataSchema)