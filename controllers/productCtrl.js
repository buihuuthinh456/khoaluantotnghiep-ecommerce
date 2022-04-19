const Products = require('../models/productModel');
const Comments = require('../models/commentModel');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
})



class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }
    filtering(){
        const queryObj = {...this.queryString} //queryString = req.query

        const excludedFields = ['page','sort','limit']
        excludedFields.forEach(el=>delete(queryObj[el]))

        let queryStr = JSON.stringify(queryObj)

        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)

        //    gte = greater than or equal
        //    lte = lesser than or equal
        //    lt = lesser than
        //    gt = greater than

        this.query.find(JSON.parse(queryStr))

        return this
    }
    sorting(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        }else{
            this.query = this.query.sort('-createdAt')
        }

        return this;

    }
    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 10
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)
        return this;

    }
}


const productCtrl = {
    getProducts: async(req,res)=>{
        try {
            // return res.status(200).json(products)
            const {limit,page} = req.query 
            const features = new APIfeatures(Products.find(),req.query)
            .filtering()
            const featureHavePaginate = new APIfeatures(Products.find(),req.query)
            .filtering().sorting().paginating()
            // const products = await featureHavePaginate.query
            // const totalProduct = await features.query
            const result = await Promise.all([featureHavePaginate.query,features.query])
            const products = result[0]
            if(products.length < limit){
                const totalPage = Number(page)
                return res.status(200).json({
                    status: 'success',
                    result: products.length,
                    products: products,
                    totalPage
                })
            }
            else{
                const totalProduct = result[1]
                const totalPageFloat = totalProduct.length/products.length
                let totalPage = Math.floor(totalPageFloat)
                let float = totalPageFloat - totalPage
                if(float>0){
                    totalPage = totalPage + 1;
                } 
                return res.status(200).json({
                    status: 'success',
                    result: products.length,
                    products: products,
                    totalPage
                })
            }
            
           
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    getProduct: async(req,res)=>{
        try {
            const productId = req.params.id;
            const product = await Products.findById(productId)
            if(!product) return res.status(400).json({msg:"Product doesn't exist"})
            res.status(200).json(product)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    getProductById: async(req,res)=>{
        try {
            const productId = req.body.id;
            const product = await Products.findById(productId)
            if(!product) return res.status(400).json({msg:"Product doesn't exist"})
            res.status(200).json(product)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    createProduct:async(req,res)=>{
        try {
            const {productId,name,images,category,price,description,quantity} = req.body
            
            const product = await Products.findOne({productId})

            if(product) return res.status(400).json({msg:"Product already exists"})

            if(!images) return res.status(400).json({msg:"No images upload"})

            const newProduct = new Products({
                productId,name,images:images,category,price,description,quantity
            })

            await newProduct.save()

            return res.status(200).json({msg:"Create successfully a product"})



        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    deleteProduct:async(req,res)=>{
       try {
            const productId = req.params.id;
            const product = await Products.findOne({_id:productId})
            const urlImages = product.images[0].public_id
            
            cloudinary.uploader.destroy(urlImages,async(err,result)=>{
                if(err) throw err
                
                console.log(result)
            })

            await Products.deleteOne({_id:productId})

            return res.status(200).json({msg:"Delete successfully this product"})
       } catch (err) {
           return res.status(500).json({msg:err.message})
       }
    },
    updateProduct:async(req,res)=>{
        try {
            const productId = req.params.id;
            const {name,description,price,quantity,category,images} = req.body;
            if(!images) return res.status(400).json({msg:"No images upload"})

            await Products.findOneAndUpdate({_id:productId},{
                name,description,images:images,price,quantity,category
            })

            return res.status(200).json({msg:"Product update successfully"})


        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    getComments:async(req,res)=>{
        try {
            const productId = req.params.id;
            const comments = await Comments.find({productId:productId})

            return res.status(200).json(comments)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    createComment:async(req,res)=>{
        try {
            const productId = req.params.id;
            const {userId,content} = req.body;
            const newComment = new Comments({
                productId,userId,content
            })

            await newComment.save()

            return res.status(200).json({msg:"Comment is created"})
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    updateComment:async(req,res)=>{
        try {
            const productId = req.params.id;
            const commentId = req.params.idComment;
            const {userId,content}=req.body;
            if(content.length===0) return res.status(400).json({msg:"Comment is empty?"})
               
            await Comments.findByIdAndUpdate({_id:commentId,userId:userId},{
                productId,userId,content
            })

            return res.status(400).json({msg:"Comment is updated"});
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    deleteComment:async(req,res)=>{
        try {
            const commentId = req.params.idComment;
            const {userId}=req.body;
        
            await Comments.findByIdAndDelete({_id:commentId,userId:userId})
            return res.status(200).json({msg:"Comment is deleted"})
 
            
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },

    increaseViews:async(req,res)=>{
        try {
            const productId = req.params.id;
            const product = Products.findById(productId)
            const {views,...info} = product;

            const updateProduct = new Products({
                ...info, views: views + 1
            })

            await updateProduct.save()

            return res.status(200).json({msg:"Increase Views Successfull"})
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
}


module.exports = productCtrl;