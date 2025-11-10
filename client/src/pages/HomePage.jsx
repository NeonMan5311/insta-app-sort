import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../services/api";

import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function HomePage() {
	const [profile, setProfile] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await createJob(profile, email);

			if (response.status === 200) {
				// Cache hit
				setMessage(
					"This profile was recently analyzed. Redirecting you..."
				);
				setTimeout(() => {
					navigate(`/results/${response.data.result_id}`);
				}, 2000);
			} else if (response.status === 201) {
				// New job
				setMessage(
					"Success! Your job is in the queue. We will email you a link when your report is ready."
				);
			}
		} catch (err) {
			if (err.response && err.response.status === 503) {
				setError(
					"The service is temporarily down for maintenance. Please try again later."
				);
			} else {
				setError("An error occurred. Please try again.");
			}
		} finally {
			setLoading(false);
			setProfile("");
			setEmail("");
		}
	};

	return (
		<div className="max-w-xl mx-auto">
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<Input
					type="text"
					value={profile}
					onChange={(e) => setProfile(e.target.value)}
					placeholder="Enter Instagram profile username"
					required
					autoComplete="off"
				/>
				<Input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Enter your email for the report"
					required
				/>
				<Button type="submit" disabled={loading}>
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Submitting...
						</>
					) : (
						"Analyze Profile"
					)}
				</Button>
			</form>

			{message && (
				<Alert variant="default" className="mt-4">
					<CheckCircle2 className="h-4 w-4" />
					<AlertTitle>Success</AlertTitle>
					<AlertDescription>{message}</AlertDescription>
				</Alert>
			)}

			{error && (
				<Alert variant="destructive" className="mt-4">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
