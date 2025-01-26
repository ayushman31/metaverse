import { Router } from "express";
import { UpdateMetadataSchema } from "../../types/index.js";
import { userMiddleware } from "../../middleware/user.js";
import { client } from "@repo/db/client";

export const userRouter = Router();

//@ts-ignore
userRouter.post("/metadata" , userMiddleware , async (req , res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body);
    
    if(!parsedData.success){
        res.status(400).json({
            message: "Validation failed"
        });
        return;
    }

    try {
        await client.user.update({
            where: {
                id: req.userId
            },
            data : {
                avatarId: parsedData.data.avatarId
            }
        })

        res.status(200).json({
            message: "Avatar Updated"
        })
    } catch(e){
        res.status(400).json({
            message: "Internal Server Error"
        })
    };
});

//@ts-ignore
userRouter.get("/metadata/bulk"  ,  async (req , res) => {
    const userIdStr = (req.query.ids ?? "[]") as string;
    const userIds = JSON.parse(userIdStr);
    
    try{
        const metadata = await  client.user.findMany({
            where : {
                id: {
                    in : userIds
                }
            },
            select: {
                avatar: true,
                id: true
            }
        });
        res.status(200).json({
            //@ts-ignore
            avatars : metadata.map( x => ({
                userId: x.id,
                avatarId : x.avatar?.imageUrl
            }))
        })
    } catch(e){
        res.json({
            message: "Error"
        })
    }

});

