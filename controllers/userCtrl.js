const Users = require('../models/userModel');
const Products = require('../models/productModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport');


const userCtrl = {
    register:async(req,res)=>{
        try {
            const {name,email,password} = req.body;
            const user = await Users.findOne({email});

            if(user) return res.status(400).json({msg:"Email này đã có người sử dụng"});
            
            if(password.length < 6) return res.status(400).json({msg:"Mật khẩu ít nhất phải có 6 ký tự"});

            // Password Encrytion

            const passwordHash = await bcrypt.hash(password,10);
            
            const newUser = new Users({
                name,email,password:passwordHash
            });

            // Save MongoDB

            await newUser.save();


            res.json("Đăng ký thành công")

        } catch (err) {
            res.status(500).json({msg:err.message})
        }
    },
    requestResetPassword: async(req,res)=>{
        try {
            const {email} = req.body;
            const user = await Users.findOne({email});
            if(!user) 
                return res.status(400).json({msg:"Email này không phải thành viên của website chúng tôi"});
            else{
                let testAccount = await nodeMailer.createTestAccount();
                const adminEmail = 'swordartonlinethinh@gmail.com'
                const adminPassword = 'hpobvylpluhttrcl'
                // Mình sử dụng host của google - gmail
                // const mailHost = 'smtp.gmail.com'
                // // 587 là một cổng tiêu chuẩn và phổ biến trong giao thức SMTP
                // const mailPort = 587

                const transporter = nodeMailer.createTransport(smtpTransport({
                        // host: mailHost,
                        // port: mailPort,
                        service: 'gmail',
                        secure: false, // true for 465, false for other ports
                        auth: {
                          user: adminEmail, // generated ethereal user
                          pass: adminPassword, // generated ethereal password
                        },
                }));
                const resetCode = await bcrypt.hash(testAccount.pass,10);
                await Users.findOneAndUpdate({email},{resetCode});
                console.log(resetCode)
                const urlConfirm = `http://localhost:3000/resetPassword?resetCode=${testAccount.pass}&email=${user.email}`
                const options = {
                    from: adminEmail, // địa chỉ admin email bạn dùng để gửi
                    to: user.email, // địa chỉ gửi đến
                    subject: "Bạn đã quên mật khẩu thành viên của TShop", // Tiêu đề của mail
                    text:`Nhấn vào link bên dưới để reset password:`,
                    html:`<a href=${urlConfirm}>Nhấn vào đấy để đặt lại password</a>`
                }

                await transporter.sendMail(options)

                return res.status(200).json({msg:"Gửi request thành công"})
            }

        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },
    confirmResetPassword: async(req,res)=>{
        try {
            const {resetCode,email} = req.query
            const {password} = req.body
            const user = await Users.findOne({email})
            console.log(user)
            if(user){
                const check = await bcrypt.compare(resetCode,user.resetCode)
                if(check){
                    const passwordHash = await bcrypt.hash(password,10);
                    const user = await Users.findOneAndUpdate({email},{password:passwordHash, resetCode:""})
                    return res.status(200).json({msg:"Thay đổi mật khẩu thành công"})
                }
                else{
                    return res.status(400).json({msg:"ResetCode không hợp lệ"})
                }
            }else{
                return res.status(400).json({msg:"Email này không phải là thành viên của website chúng tôi"})
            }
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },
    changePassword: async(req,res)=>{
        try {
            const _id = req.user.id
            const {password, newPassword} = req.body
            const newPasswordHash = await bcrypt.hash(newPassword,10)
            const user = await Users.findById(_id)
            if(!user) return res.status(400).json({msg:"Không hợp lệ"})
            const isMatch = await bcrypt.compare(password, user.password)
            if(isMatch){
                await Users.findByIdAndUpdate(_id,{
                    password:newPasswordHash
                })
            }else{
                return res.status(400).json({msg:"Mật khẩu hiện tại không đúng"})
            }
            return res.status(200).json({msg:"Thay đổi mật khẩu thành công"})
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },
    login:async(req,res)=>{
        try {
            const {email,password} = req.body;

            const user = await Users.findOne({email});
            if(!user) return res.status(400).json({msg:"Tài khoản này không tồn tại"});

            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch) return res.status(400).json({msg:"Bạn đã sai mật khẩu"});

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
    },
    addProductIntoCart: async(req,res)=>{
        try {
            const userId = req.user.id
            const item = req.body
            const user = await Users.findOne({_id:userId}).select('-password');
            if(user){
                let {cart} = user
                cart = [...cart,item]
                // Check những item trùng trong cart để cộng dồn
                const newCart = cart.reduce((previousValue,currentValue)=>{
                    if(previousValue.length!==0 && currentValue){
                        let index = previousValue.findIndex(data => data._id === currentValue._id);
                        if(index!==-1){
                            if(previousValue[index]["quantity"] + currentValue["quantity"]>0){
                                previousValue[index]["quantity"] = currentValue["quantity"] 
                                // + previousValue[index]["quantity"] 
                                return [...previousValue] 
                            }else{
                                [previousValue[index],...value] = previousValue
                                return value
                            }
                        }
                        else{
                            if(currentValue["quantity"]<=0) return [...previousValue]
                            else return [...previousValue,currentValue] 
                        }
                    }
                    else{
                        return [...previousValue,currentValue]
                    }
                },[])
                const newUser = await Users.findOneAndUpdate({_id:userId},{cart:newCart},{
                    new:true,
                }).select('-password')
                return res.status(200).json(newUser)
            }else{
                return res.status(400).json('Người dùng không tồn tại')
            }
            
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },
    newCart: async(req,res)=>{
        try {
            const userId = req.user.id
            const cart = req.body
            const user = await Users.findOne({_id:userId}).select('-password');
            if(user){
                const newUser = await Users.findOneAndUpdate({_id:userId},{cart:cart},{
                    new:true,
                }).select('-password')
                return res.status(200).json(newUser)

            }
            else{
                return res.status(400).json('Người dùng không tồn tại')
            }
            
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    },
    deleteProductInCart:async(req,res)=>{
        try {
            const {id:userId} = req.user
            const {productId} = req.body
            const user = await Users.findOne({_id:userId}).select('-password');
            if(user){
                let {cart} = user
                // Find item
                const newCart = cart.filter((el,index)=>{
                    return el._id !== productId
                })
                const newUser = await Users.findOneAndUpdate({_id:userId},{cart:newCart},{
                    new:true,
                }).select('-password')
                return res.status(200).json(newUser)
            }else{
                return res.status(400).json('Người dùng không tồn tại')
            }
        } catch (error) {
           return res.status(500).json({msg:error.message}) 
        }

    }
}

const createAccessToken = (user) => {
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}

module.exports = userCtrl