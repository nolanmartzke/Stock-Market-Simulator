import React, { useState } from 'react';
import NewsCard from '../components/NewsCard';

const topicFilters = [
	{ label: 'All Market News', category: 'general', hint: 'Broad market headlines and sentiment.' },
	{ label: 'Forex & Macro', category: 'forex', hint: 'Currencies, rates, and macro shifts.' },
	{ label: 'Crypto', category: 'crypto', hint: 'Digital assets, blockchain, and tokens.' },
	{ label: 'M&A / Deals', category: 'merger', hint: 'Acquisitions, IPO chatter, and deal flow.' }
];

const Popular = () => {
	const [activeTopic, setActiveTopic] = useState(topicFilters[0]);

	return (
		<div className="container py-4">
			<h1 className="mb-2">Popular</h1>
			<p className="text-muted mb-4">Dial in the topics you care about and browse the latest headlines.</p>

			<div className="row g-4 justify-content-center">
				{/* Center column: topic filters + news */}
				<main className="col-12 col-xl-8">
					<div className="card mb-3">
						<div className="card-body">
							<div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
								<div>
									<h5 className="card-title mb-1">Topics</h5>
									<p className="text-muted small mb-0">Use filters to refocus the news feed.</p>
								</div>
								<div className="d-flex flex-wrap gap-2">
									{topicFilters.map((topic) => {
										const isActive = topic.category === activeTopic.category;
										return (
											<button
												key={topic.category}
												className={`btn btn-sm ${isActive ? 'btn-dark' : 'btn-outline-secondary'}`}
												onClick={() => setActiveTopic(topic)}
											>
												{topic.label}
											</button>
										);
									})}
								</div>
							</div>
						</div>
					</div>

					<NewsCard
						category={activeTopic.category}
						pageSize={8}
						heading={`${activeTopic.label} News`}
						subtitle={activeTopic.hint}
					/>
				</main>

				{/* Right column: popular stocks */}
				<aside className="col-12 col-xl-4">
					<div className="card mb-3">
						<div className="card-body">
							<h5 className="card-title">Most Popular Stocks</h5>
							<p className="text-muted small">A curated list of stocks people are watching.</p>

							<div className="row gy-3">
								{[1, 2, 3, 4].map((i) => (
									<div className="col-12" key={i}>
										<div className="d-flex justify-content-between align-items-center p-3 border rounded">
											<div>
												<strong>SYM{i}</strong>
												<div className="text-muted small">Company Name {i}</div>
											</div>
											<div className="text-end">
												<div className="fw-bold">$123.45</div>
												<div className="text-success small">+1.23% today</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);

};

export default Popular;
