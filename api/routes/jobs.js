const express = require("express");
const router=express.Router();
const Job=require("../models/Job");
const {sendEmail}=require("../services/emailService");

router.post("/",async(req,res)=>{
    if (req.app.get("maintenance_mode") === true) {
		// Return a "service unavailable" error
		return res.status(503).json({
			error: "Service is temporarily down for maintenance. Please try again later.",
		});
	}
    const {profile_url,user_email}=req.body;
    if(!profile_url||!user_email){
        return res.status(400).json({error:"profile_url and user_email are required"});
    }
    try{
        const twentyFourHoursAgo=new Date(Date.now()-24*60*60*1000);
        const cachedJob=await Job.findOne({
            profile_url,
            status:"completed",
            created_at:{$gte:twentyFourHoursAgo}
        });
        if(cachedJob){
            console.log("Returning cached job result for profile_url:",profile_url);
            return res.status(200).json({
                message:"Job completed (from cache)",
                result_id:cachedJob.result_id,
                status:complete,
            });
        }
        console.log("Creating new job for profile_url:",profile_url);
        const newJob=new Job({
            profile_url,
            user_email,
            status:"pending",
        });
        await newJob.save();

        return res.status(201).json({
            message:"Job created successfully. You will be notified via email once the scraping is complete.",
            result_id:newJob.result_id,
            status:newJob.status,
        });

    }catch(err){
        console.error("Error creating job:",err);
        return res.status(500).json({error:"Internal server error"});
    }
})


router.get("/:result_id",async(req,res)=>{
    try{
        const job=await JSON.findOne({result_id:req.params.result_id});
        if(!job){
            return res.status(404).json({error:"Job not found"});
        }
         const response ={
            status:job.status,
            profile_url:job.profile_url,
            results:null,
            error:null
        }
        if(JSON.status==="complete"){
            response.results=JSON.parse(job.result_json);
        }else if(JSON.status==="failed"){
            response.error=job.error_message;
        }
        return res.status(200).json(response);
    }catch(err){
        console.error("Error fetching job:",err);
        return res.status(500).json({error:"Internal server error"});
    }
})

module.exports=router;