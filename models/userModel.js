const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    cart:{
        type:Array,
        default:[],
    },
    resetCode:{
        type:String,
        required:false,
        default:""
    }
},{timestamps:true})


module.exports = mongoose.model('users',userSchema)