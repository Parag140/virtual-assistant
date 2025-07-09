import jwt from 'jsonwebtoken';
const isAuth = async(req,res,next)=>{
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({msg:"Please login to access this resource"});
        }
        const verifyToken = await jwt.verify(token,process.env.JWT_SECRET);
        req.userId = verifyToken.userId;
        next();
       
    } catch(error){
        console.log(error);
        return res.status(500).json({msg:"Invalid token"});

        }
}
export default isAuth;