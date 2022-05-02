const mongoose = require('mongoose');

const topicImgModel = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    img:{
        type:Object,
        require:true
    }
},{timestamps:true})

module.exports = mongoose.model('topicImg',topicImgModel)
