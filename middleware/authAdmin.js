const Users = require('../models/userModel');

const authAdmin = async (req,res,next)=>{
    try {
        const user = await Users.findOne({
            _id:req.user.id
        });
        if(user.isAdmin === false) return res.status(400).json({msg:"Tài nguyên này chỉ có admin mới được sử dụng"});

        next();
    } catch (err) {
        return res.status(500).json({msg:err.message});
    }
}


module.exports = authAdmin