import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Square({
	location,
	highlight,
}: {
	location: number;
	highlight: boolean;
}) {
	const square = useQuery(api.squares.getByLocation, { location });

	if (!square) {
		return <p>No square found for {location}.</p>;
	}

	return (
		<div
			className="square"
			data-state={square.state}
			data-secret={square.secret}
			data-active={square.active}
			data-highlight={highlight}
		>
			<img src={square.photo!} alt={square.name} />

			{square.secret
				? Array(32)
						.fill('')
						.map((_, i) => (
							<div
								className="star-container"
								key={`star-${i}`}
								style={{
									// @ts-expect-error
									'--rotate': Math.random() * 360 + 'deg',
									'--delay': Math.random() * 1000 + 'ms',
									'--scale': Math.random() * 0.5 + 0.5,
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 137 130"
									className="star"
								>
									<path
										fill="#FFCB2F"
										d="M65.913 1.75c1.1-2.23 4.28-2.23 5.38 0l18.654 37.796a3 3 0 0 0 2.26 1.641l41.71 6.061c2.461.358 3.444 3.382 1.663 5.117l-30.182 29.42a3 3 0 0 0-.863 2.656l7.125 41.543c.42 2.451-2.152 4.319-4.353 3.162L70 109.533a2.997 2.997 0 0 0-2.792 0L29.9 129.146c-2.2 1.157-4.773-.711-4.353-3.162l7.125-41.543a3 3 0 0 0-.862-2.655L1.627 52.366c-1.78-1.736-.798-4.76 1.663-5.118L45 41.188a3 3 0 0 0 2.26-1.642L65.913 1.75Z"
										style={{
											fill: '#ffcb2f',
											fillOpacity: 1,
										}}
									/>
								</svg>
							</div>
						))
				: null}
		</div>
	);
}
