import React from 'react';

// Template page for "Popular" — shows layout and placeholders for:
// - Popular stocks (center)
// - Related news (right column)
// - Noteworthy topics / filters (left column)
// This is a static template — no API calls or dynamic data yet.

export default function Popular() {
	return (
		<div className="container py-4">
			<h1 className="mb-4">Popular</h1>

			<div className="row">
				{/* Left column: topics / filters */}
				<aside className="col-12 col-md-3 mb-4">
					<div className="card">
						<div className="card-body">
							<h5 className="card-title">Topics</h5>
							<p className="text-muted">Filters, trending sectors, or watchlists.</p>
							<ul className="list-unstyled">
								<li className="py-2">• Trending: Technology</li>
								<li className="py-2">• Watchlist: Top Growth</li>
								<li className="py-2">• Sector: Healthcare</li>
							</ul>
						</div>
					</div>
				</aside>

				{/* Main column: popular stocks */}
				<main className="col-12 col-md-6 mb-4">
					<div className="card mb-3">
						<div className="card-body">
							<h5 className="card-title">Most Popular Stocks</h5>
							<p className="text-muted">A curated list of stocks people are viewing. (Template)</p>

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

					<div className="card">
						<div className="card-body">
							<h6 className="card-title">Notes</h6>
							<p className="text-muted small">This is a static template. Replace the mapped items with real API data when ready.</p>
						</div>
					</div>
				</main>

				{/* Right column: news */}
				<aside className="col-12 col-md-3 mb-4">
					<div className="card">
						<div className="card-body">
							<h5 className="card-title">Related News</h5>
							<p className="text-muted">Top headlines related to popular stocks.</p>
							<ul className="list-unstyled">
								<li className="mb-3">
									<strong>Headline 1</strong>
									<div className="text-muted small">Brief summary of the news item. (Template)</div>
								</li>
								<li className="mb-3">
									<strong>Headline 2</strong>
									<div className="text-muted small">Brief summary of the news item. (Template)</div>
								</li>
								<li className="mb-3">
									<strong>Headline 3</strong>
									<div className="text-muted small">Brief summary of the news item. (Template)</div>
								</li>
							</ul>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
