// api/routes/jobs.js
const express = require("express");
const router = express.Router();
const Job = require("../models/Job"); // This was correct

router.post("/", async (req, res) => {
    // Maintenance check was correct
    if (req.app.get("maintenance_mode") === true) {
        return res.status(503).json({
            error: "Service is temporarily down for maintenance. Please try again later.",
        });
    }

    const { profile_url, user_email } = req.body;
    if (!profile_url || !user_email) {
        return res.status(400).json({ error: "profile_url and user_email are required" });
    }

    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // --- FIX 1: status must be 'complete' (lowercase) ---
        // --- FIX 2: Check 'updatedAt', not 'created_at' for caching ---
        const cachedJob = await Job.findOne({
            profile_url: profile_url,
            status: "complete", // <-- FIX: Was 'completed'
            updatedAt: { $gte: twentyFourHoursAgo } // <-- FIX: Was 'created_at'
        });
        
        if (cachedJob) {
            console.log("Returning cached job result for profile_url:", profile_url);
            
            // --- FIX 3: status must be a string 'complete' ---
            return res.status(200).json({
                message: "Job completed (from cache)",
                result_id: cachedJob.result_id,
                status: "complete", // <-- FIX: Was 'complete' (variable)
            });
        }

        console.log("Creating new job for profile_url:", profile_url);
        const newJob = new Job({
            profile_url,
            user_email,
            status: "pending",
        });
        await newJob.save();

        return res.status(201).json({
            message: "Job created successfully. You will be notified via email once the scraping is complete.",
            result_id: newJob.result_id,
            status: newJob.status,
        });

    } catch (err) {
        console.error("Error creating job:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.get("/:result_id", async (req, res) => {
    try {
        // --- FIX 4: Use the 'Job' model, not the 'JSON' object ---
        const job = await Job.findOne({ result_id: req.params.result_id }); // <-- FIX: Was 'JSON'
        
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

         const response = {
            status: job.status,
            profile_url: job.profile_url,
            results: null,
            error: null
        };

        // --- FIX 5: Check 'job.status', not 'JSON.status' ---
        if (job.status === "complete") {
            // Check if results_json is not null before parsing
            if (job.results_json) {
                response.results = JSON.parse(job.results_json);
            } else {
                // This will prevent the crash you're seeing
                response.results = []; 
            }
        } else if (job.status === "failed") {
            response.error = job.error_message;
        }
        
        return res.status(200).json(response);

    } catch (err) {
        console.error("Error fetching job:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;

