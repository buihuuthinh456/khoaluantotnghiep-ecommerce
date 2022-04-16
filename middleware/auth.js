const jwt = require('jsonwebtoken');

const auth = (req,res,next) => {
    try {
        const token = req.header("Authorization");
        if(!token) return res.status(400).json({msg:"Invalid Authetication"});

        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
            if(err){
                if(err.message==='jwt expired'){
                    return res.status(400).json({msg:"Invalid Authetication",errorExpiredAt:true});
                }
                else{
                    return res.status(400).json({msg:"Invalid Authetication"});
                }
            }
            req.user = user;
            next();
        })
    } catch (err) {
        return res.status(500).json({msg:err.message})
    }
}

module.exports = auth