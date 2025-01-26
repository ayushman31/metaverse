import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


export const adminMiddleware = (req: Request , res: Response , next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];


    if(!token){
        res.status(403).json({
            message: "Unauthorized"
        })
        return;
    };
    
    try{
        const decodedData = jwt.verify(token ,"JWTPASS123") as {role: string , userId: string};
        if(decodedData.role != "Admin"){
            res.status(403).json({
                message: "Unauthorized"
            })
            return;
        }  
        req.userId = decodedData.userId;
        next();
    } catch(e){
        res.status(401).json({
            message: "Unauthorized"
        })
        return;
    }


}