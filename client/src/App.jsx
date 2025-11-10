import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";

function App() {
	return (
		<div className="min-h-screen bg-background text-foreground dark">
			<div className="container mx-auto p-4 md:p-8">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
					Insta-Sort
				</h1>
				<p className="text-lg text-muted-foreground mb-8">
					Analyze and sort any public Instagram profile's posts.
				</p>

				<main>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route
							path="/results/:result_id"
							element={<ResultsPage />}
						/>
					</Routes>
				</main>
			</div>
		</div>
	);
}

export default App;
