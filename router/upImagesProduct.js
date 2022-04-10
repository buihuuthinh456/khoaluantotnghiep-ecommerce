const router = require('express').Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const fs = require('fs');


const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
})


// Route Upload Images
// Only Admin can upload
router.post('/upload',auth,authAdmin,(req,res)=>{
    try {
        if(!req.files || Object.keys(req.files).length===0)
            return res.status(400).json({msg:"No file were upload"});
        const fileUpload = req.files.fileUpload;
        console.log(fileUpload)
        // 1024*1024*2 = 2MB
        // Only upload file lower than 2MB
        if(fileUpload.size > 1024*1024*2){
            removeTmp(fileUpload.tempFilePath)
            return res.status(400).json({msg:"Size too large. Please use max size lower than 2MB"})
        }

        // Check type file , only admit image
        if(fileUpload.mimetype !== 'image/jpeg' && fileUpload.mimetype !== 'image/png'){
            removeTmp(fileUpload.tempFilePath)
            return res.status(400).json({msg:"This file isn't image"})
        }

        cloudinary.uploader.upload(fileUpload.tempFilePath,{folder:'Ecommerce'},async(err,result)=>{
            if(err) throw err

            removeTmp(fileUpload.tempFilePath)

            return res.status(200).json({
                public_id: result.public_id,
                url:result.url,
            })
        })
    } catch (err) {
        return res.status(500).json({msg:err.message})
    }
})


const removeTmp = (path) => {
    fs.unlink(path,err=>{
        if(err) throw err
    })
}

module.exports = router
