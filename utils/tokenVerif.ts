import jwt from "jsonwebtoken"
import User from "../models/user";
import { Request, Response, NextFunction} from "express"

interface JwtPayload {
    user: {
        _id: string;
        email: string;
        name: string
    }
}
export const verifyRefreshToken = async(req: Request,res: Response,next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(" ")[1];

        if(!token)  {
            res.status(401).json({message: "No token provided"});
            return;
        }
    
        //Verify token validity
        const decoded = jwt.verify(token, process.env.SECRET as string) as JwtPayload;
        const foundUser = await User.findById(decoded.user._id);

        if(!foundUser) {
             res.status(404).json({
                message: "No user found with token", user:decoded.user._id
            });
            return;
        }

        //Generate new token
        const accessToken = jwt.sign(
            { user: foundUser, iat: Date.now()},
            process.env.SECRET as string,
            {expiresIn: "24h"} 
        )

        //Attach token and user on request
        req.user = foundUser;
        req.token = accessToken;
        next();
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            res.status(401).json({ message: "Token expired" });
            return;    
        }
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};