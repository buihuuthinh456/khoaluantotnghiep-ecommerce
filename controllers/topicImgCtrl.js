const TopicImg = require('../models/topicImgModel')

const topicImgCtrl = {
    getTopicImgs:async(req,res)=>{
        try {
            const topicImgs = TopicImg.find()

            return res.status(200).json(topicImgs)
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },
    postTopicImg:async(req,res)=>{
        try {
            const {name,image} = req.body
            if(!image) return res.status(400).json({msg:"No images upload"})
            const newTopicImg = new TopicImg({
                name,image
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
            await TopicImg.findByIdAndDelete(_id)
            return res.status(200).json({msg:"Delete successfully"})
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    }
}

module.exports = topicImgCtrl