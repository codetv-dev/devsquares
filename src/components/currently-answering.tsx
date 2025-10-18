import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function CurrentlyAnswering() {
	const square = useQuery(api.squares.get_active_square);

	if (!square) {
		return null;
	}

	let url: URL | false = false;
	let link: string | false = false;

	if (square.link) {
		url = new URL(square.link);
		link = url.host;
	}

	if (url && url.pathname !== '/') {
		link += url.pathname;
	}

	return (
		<>
			<div className="square">
				<p className="label">currently answering:</p>

				<div className="details">
					<img src={square.photo!} alt={square.name} />

					<div className="person-info">
						<h3>{square.name}</h3>

						{url ? (
							<p>
								<a href={url.toString()} target="_blank">
									{link}
								</a>
							</p>
						) : null}
					</div>
				</div>
			</div>
		</>
	);
}
