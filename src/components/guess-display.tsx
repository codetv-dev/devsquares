import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

function Checkmark() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 34 33">
			<path
				fill="var(--color)"
				d="M29.34 16.566c0-6.753-5.474-12.227-12.227-12.227-6.754 0-12.228 5.474-12.228 12.227s5.474 12.228 12.228 12.228v4C8.15 32.794.884 25.528.884 16.566.885 7.604 8.15.34 17.112.34c8.963 0 16.228 7.265 16.228 16.227s-7.265 16.228-16.228 16.228v-4c6.754 0 12.228-5.475 12.228-12.228Z"
				style={{
					fill: 'var(--color)',
					fillOpacity: 1,
				}}
			/>
			<path
				fill="var(--color)"
				d="M22.107 10.327a2 2 0 1 1 3.112 2.512l-8.38 10.38a2.001 2.001 0 0 1-3.135-.029l-3.507-4.508a2 2 0 0 1 3.156-2.457l1.959 2.517 6.795-8.415Z"
				style={{
					fill: 'var(--color)',
					fillOpacity: 1,
				}}
			/>
		</svg>
	);
}

export default function GuessDisplay({
	game,
	voteIndicator,
}: {
	game?: Id<'game'>;
	voteIndicator?: boolean;
}) {
	const question = useQuery(api.questions.get_active_question);
	const square = useQuery(api.squares.get_active_square);
	const guess = useQuery(api.guesses.get_active_guess, {
		game,
		question: question?._id,
		location: square?._id,
	});
	const guesses = useQuery(api.guesses.list, {
		game,
		location: square?._id,
		question: question?._id,
	});

	if (!guesses) {
		return null;
	}

	return (
		<div className="guess-aggregate">
			<p className="label">audience guesses:</p>
			<div className="audience-guesses">
				<div
					className="guess-display agree"
					// @ts-expect-error CSS variables baybeeee
					style={{ '--pct': guesses.agree + '%' }}
					data-value={guesses.agree}
				>
					<p>
						agree{' '}
						{voteIndicator && guess?.guess === 'agree' ? <Checkmark /> : null}
					</p>
					<p>{guesses.agree}%</p>
				</div>
				<div
					className="guess-display disagree"
					// @ts-expect-error CSS variables baybeeee
					style={{ '--pct': guesses.disagree + '%' }}
					data-value={guesses.disagree}
				>
					<p>
						disagree{' '}
						{voteIndicator && guess?.guess === 'disagree' ? (
							<Checkmark />
						) : null}
					</p>
					<p>{guesses.disagree}%</p>
				</div>
			</div>
		</div>
	);
}
