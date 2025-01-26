import { Router } from "express";
import { AddElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../../types/index.js";
import { userMiddleware } from "../../middleware/user.js";
import { client } from "@repo/db/client";

export const spaceRouter = Router();

//@ts-ignore
spaceRouter.post("/", userMiddleware, async (req, res) => {
    
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed",
            error: parsedData.error.errors // Log detailed validation errors
        });
    }

    try {
        if (!parsedData.data.mapId) {
            const space = await client.space.create({
                data: {
                    name: parsedData.data.name,
                    width: parseInt(parsedData.data.dimensions.split('x')[0]),
                    height: parseInt(parsedData.data.dimensions.split('x')[1]),
                    creatorId: req.userId,
                }
            });

            return res.status(200).json({
                spaceId: space.id
            });
        }

        const map = await client.map.findFirst({
            where: {
                id: parsedData.data.mapId,
            },
            select: {
                mapElements: true,
                width : true,
                height : true
            }
        });

        if (!map) {
            return res.status(400).json({
                message: "Map does not exist"
            });
        }

        let space = await client.$transaction(async () => {
            const space = await client.space.create({
                data: {
                    name: parsedData.data.name,
                    width: map.width,
                    height: map.height,
                    creatorId: req.userId,
                }
            });

            await client.spaceElements.createMany({
                //@ts-ignore
                data: map.mapElements.map(m => ({
                    spaceId: space.id,
                    elementId: m.elementId,
                    x: m.x,
                    y: m.y,
                }))
            });

            return space;
        });

        res.status(200).json({
            spaceId: space.id
        });
    } catch (e) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});


//@ts-ignore
spaceRouter.delete("/:spaceId" ,userMiddleware, async (req , res) => {
    const spaceId = req.params.spaceId;
    console.log("user token : " , req.userId);
   
    
    
    const space = await client.space.findUnique({
        where : {
            id : spaceId
        }
    });

    console.log("creator id : " , space.creatorId);
    
    
    if(!space) {
        res.status(400).json({
            message : "Space does not exist"
        });
        return;
    }
    if(space.creatorId != req.userId) {
        res.status(403).json({
            message : "Unauthorized"
        });
        return;
    }

    try {
        await client.spaceElements.deleteMany({
            where: {
                spaceId: spaceId
            }
        });
        await client.space.delete({
            where : {
                id : spaceId,
                creatorId: req.userId
            }
        });

        res.status(200).json({
            message : "Space deleted"
        })
    } catch(e){
        res.status(400).json({
            message : "Validation failed."
        })
    }
});


//@ts-ignore
spaceRouter.get("/all" ,userMiddleware, async (req , res) => {
    try{
        const spaces = await client.space.findMany({
            where: {
                creatorId: req.userId
            }
        });

        res.status(200).json({
            //@ts-ignore
            spaces : spaces.map(s => ({
                id : s.id,
                name : s.name,
                dimensions : `${s.width}x${s.height}`,
                thumbnail : s.thumbnail
            }))
        })
    } catch(e) {
        res.status(400).json({
            message: "You have not created any space yet."
        })
    }
});


//@ts-ignore
spaceRouter.post("/element" ,userMiddleware , async(req , res) => {
    const parsedData = AddElementSchema.safeParse(req.body);
    
    if(!parsedData.success){
        res.status(400).json({
            message : "Validation failed."
        });
        return;
    };

    const space = await client.space.findUnique({
        where : {
            id: parsedData.data?.spaceId,
            creatorId : req.userId
        } , 
        select : {
            width : true,
            height : true
        }
    });

    if(!space){
        res.status(400).json({
            message : "Validation failed."
        });
        return
    };

    if(parsedData.data?.x < 0 || parsedData.data?.y < 0 || parsedData.data?.x > space.width || parsedData.data?.y > space.height){
        res.status(400).json({
            message : "Validation failed."
        })
    }


    try {
        const element = await client.spaceElements.create({
            data: {
                elementId : parsedData.data.elementId,
                spaceId : parsedData.data.spaceId,
                x : parsedData.data.x,
                y : parsedData.data.y,
            }
        });

        res.status(200).json({
            message: "Element added."
        })
    } catch (error) {
        res.status(400).json({
            message : error
        })
    }
});


//@ts-ignore
spaceRouter.delete("/element" , userMiddleware ,async(req , res) => {
    const parsedData = DeleteElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message : "Validation failed"
        })
    };

    const spaceElement = await client.spaceElement.findFirst({  // doubt : why findFirst ?
        where: {
            id: parsedData.data?.id,
        } , 
        include : {
            space : true
        }
    });

    if(!spaceElement.space.creatorId || spaceElement.space.creatorId != req.userId ){
        res.status(403).json({
            message : "Unauthorized"
        })
    }

    try{
        await client.spaceElement.delete({
            where : {
                id: parsedData.data?.id
            }
        });

        res.status(200).json({
            message: "Element deleted"
        })
    }  catch(e){
        res.status(400).json({
            message : e
        })
    }
});


spaceRouter.get("/:spaceId" , async (req , res) => {
    const spaceId = req.params.spaceId;

    const space = await client.space.findUnique({
        where : {
            id: spaceId
        } , 
        include: {
            elements : {
                include: {
                    element : true
                }
            }
        },
    });

    if(!space){
        res.status(400).json({
            message : "Space does not exist"
        });
        return;
    };

    res.status(200).json({
        dimensions: `${space.width}x${space.height}`,
        //@ts-ignore
        elements : space.elements.map(s => ({
            id: s.id,
            element : {
                id: s.element.id,
                imageUrl : s.element.imageUrl,
                static : s.element.static,
                width : s.element.width,
                height : s.element.height
            },
            x : s.x,
            y: s.y
        }))
    })
});