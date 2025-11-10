import { useState, useEffect } from "react";
import { getJob } from "../services/api";

export function useJobPoller(result_id) {
	const [job, setJob] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		let intervalId;

		const fetchJob = async () => {
			try {
				const response = await getJob(result_id);
				const jobData = response.data;

				if (
					jobData.status === "complete" ||
					jobData.status === "failed"
				) {
					setJob(jobData);
					setError(
						jobData.status === "failed" ? jobData.error : null
					);
					clearInterval(intervalId); // Stop polling
				} else {
					// Still 'pending' or 'scraping'
					setJob(jobData);
				}
			} catch (err) {
                console.error(err);
				setError("Failed to fetch job status.");
				clearInterval(intervalId); // Stop polling on critical error
			}
		};

		fetchJob(); // Fetch immediately
		// Poll every 5 seconds
		intervalId = setInterval(fetchJob, 5000);

		// Cleanup function to stop polling when component unmounts
		return () => clearInterval(intervalId);
	}, [result_id]);

	return { job, error };
}
