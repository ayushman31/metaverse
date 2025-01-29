import { Router } from "express";
import { CreateElementSchema, CreateMapSchema, CreaterAvatarSchema, UpdateElementSchema } from "../../types/index.js";
import { client } from "@repo/db/client";
import { adminMiddleware } from "../../middleware/admin.js";

export const adminRouter = Router();
adminRouter.use(adminMiddleware);


adminRouter.post("/element" , async (req , res) => {
    const parsedData = CreateElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message : "Validation failed "
        });
        return;
    }

    try{
        const element = await client.element.create({
            data: {
                imageUrl : parsedData.data.imageUrl,
                width : parsedData.data.width,
                height : parsedData.data.height,
                static : parsedData.data.static
            }
        });

        res.status(200).json({
            id : element.id
        })
    } catch (e){
        res.status(400).json({
            message : "Validation failed"
        })
    }

}); 

adminRouter.put("/element/:elementId" , async (req , res) => {
    console.log("----------------------------------------");
    
    const parsedData = UpdateElementSchema.safeParse(req.body);

    console.log(parsedData.data);
    
    if(!parsedData.success){
        res.status(400).json({
            message : "Validation failed"
        });
        return;
    }
    
    try{
        await client.element.update({
            where : {
                id : req.params.elementId
            },
            data : {
                imageUrl : parsedData.data.imageUrl
            }
        });

        res.status(200).json({
            message : "Element updated"
        })
    } catch (e) {
        res.status(400).json({
            message : "Validation failed"
        })
    }
}); 

adminRouter.post("/avatar" , async(req , res) => {
    const parsedData = CreaterAvatarSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message : "Validation failed"
        });
        return
    };

    try{
        const avatar = await client.avatar.create({
            data : {
                imageUrl: parsedData.data.imageUrl,
                name : parsedData.data.name
            }
        });

        res.status(200).json({
            avatarId : avatar.id
        });
        } catch (e) {
            res.status(400).json({
                message : "Validation failed"
            })
        }

}); 

adminRouter.post("/map" , async (req , res) => {
    const parsedData = CreateMapSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message : "Validation failed"
        });
        return
    };
    console.log("parsed data : " , parsedData.data);
    
    try {
        const map = await client.map.create({
            data: {
                thumbnail : parsedData.data.thumbnail,
                width : parseInt(parsedData.data.dimensions.split("x")[0]),
                height : parseInt(parsedData.data.dimensions.split("x")[1]),
                name : parsedData.data.name,
                mapElements : {
                    create : parsedData.data.defaultElements.map( e => ({
                                elementId : e.elementId,
                                x : e.x,
                                y : e.y,
                        }))
                    
                }
            }
        });

        console.log("map : " , map);
        

        res.status(200).json({
            id : map.id
        })
    } catch(e){
        console.log("error");
        
    res.status(400).json({
            message : "Validation failed"
        })
    }
}); 
