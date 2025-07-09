import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"

export const signUp = async(req,res)=>{
    try{
    const {name,email,password} = req.body;
    const existEmail = await User.findOne({email});
    if(existEmail){
        console.log("email exist")
        return res.status(400).json({message:"Email already exist!"});
        }
    if(password.length<6){
        console.log("password size error")
        return res.status(400).json({message:"Password must be at least 6 characters"});
        }
    const hashedPassword = await bcrypt.hash(password,10)
    const user = await User.create({name,email,password:hashedPassword});
    const token = await genToken(user._id)
    res.cookie("token",token,{
        httpOnly:true,
        maxAge: 10*24*60*60*1000,
        sameSite:"none",
        secure:true
    })
    console.log(user);
    res.status(200).json({message:`User created successfully ${user}`});

    }
    catch(err){
         console.log(err);
        return res.status(500).json({message:`sign up error ${err}`});
       
       
        }
}

export const logIn = async(req,res)=>{
    try{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({message:"Invalid email"});
        }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({message:"Invalid password"});
        }
    
    const token = await genToken(user._id)
    res.cookie("token",token,{
        httpOnly:true,
        maxAge: 10*24*60*60*1000,
        sameSite:"none",
        secure:true
    })
    console.log(user);
    res.status(200).json({message:`User login successfully ${user}`});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:`sign in error ${err}`});
       
        }
}
export const logOut = async(req,res)=>{
    try{
        res.clearCookie("token");
        res.status(200).json({message:`User logged out successfully`});
    }
    catch(err){
        return res.status(500).json({message:`log out error ${err}`});
    }
}
