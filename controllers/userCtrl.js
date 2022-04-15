const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userCtrl = {
    register:async(req,res)=>{
        try {
            const {name,email,password} = req.body;
            const user = await Users.findOne({email});

            if(user) return res.status(400).json({msg:"The email already exists"});
            
            if(password.length < 6) return res.status(400).json({msg:"Password is at least 6 characters"});

            // Password Encrytion

            const passwordHash = await bcrypt.hash(password,10);
            
            const newUser = new Users({
                name,email,password:passwordHash
            });

            // Save MongoDB

            await newUser.save();


            res.json("Register Successfull")

        } catch (err) {
            res.status(500).json({msg:err})
        }
    },
    login:async(req,res)=>{
        try {
            const {email,password} = req.body;

            const user = await Users.findOne({email});
            if(!user) return res.status(400).json({msg:"User does not exist"});

            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch) return res.status(400).json({msg:"Password is Wrong"});

            // If login success is create Token

            const accessToken = createAccessToken({id:user._id});
	        const {password:pass,...userInfo}=user._doc;

            res.json({accessToken,...userInfo});
        } catch (err) {
            return res.status(500).json({msg:err})
        }
    },
    getUser:async(req,res)=>{
        try {
            const user = await Users.findById(req.user.id).select('-password');
            if(!user) return res.status(400).json({msg:"User does not exists"});
            res.json(user)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    getAllUser: async(req,res)=>{
        try {
            const users = await Users.find().select('-password');
            
            res.status(200).json(users)
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    }
}


const createAccessToken = (user) => {
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}

module.exports = userCtrl