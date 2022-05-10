const TopicImg = require('../models/topicImgModel')

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
})

const topicImgCtrl = {
    getTopicImgs:async(req,res)=>{
        try {
            const topicImgs = await TopicImg.find()
            return res.status(200).json(topicImgs)
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },
    postTopicImg:async(req,res)=>{
        try {
            const {name,img} = req.body
            if(!img) return res.status(400).json({msg:"No images upload"})
            const newTopicImg = new TopicImg({
                name,img
            })
            await newTopicImg.save()
            return res.status(200).json({msg:"Create successfully a Topic Image"})
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    deleteTopicImg:async(req,res)=>{
        try {
            const {topicImgId:_id} = req.body

            const topicImg = await TopicImg.findOne({_id:_id})
            const urlImage = topicImg.img.public_id
            cloudinary.uploader.destroy(urlImage,async(err,result)=>{
                if(err) throw err
            })
            await TopicImg.findByIdAndDelete(_id)
            return res.status(200).json({msg:"Delete successfully"})
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    }
}

module.exports = topicImgCtrl