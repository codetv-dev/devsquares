import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import GuessDisplay from './guess-display';

export default function Controls({ slug }: { slug: string }) {
	const game = useQuery(api.game.get_game, { slug });
	const question = useQuery(api.questions.get_active_question);
	const square = useQuery(api.squares.get_active_square);
	const guess = useQuery(api.guesses.get_active_guess, {
		game: game?._id,
		question: question?._id,
		location: square?._id,
	});
	const addGuess = useMutation(api.guesses.add_guess);

	if (!square || !question) {
		return (
			<>
				<div className="waiting">
					<p>Waiting for host...</p>
				</div>
			</>
		);
	}

	return (
		<>
			{guess ? (
				<GuessDisplay voteIndicator={true} game={game?._id} />
			) : (
				<div className="play-controls">
					<h3>Do you agree that {square.name}’s answer is correct?</h3>
					<button
						className="positive"
						onClick={() => {
							addGuess({
								game: game!._id,
								location: square._id,
								question: question._id,
								guess: 'agree',
							});
						}}
					>
						Agree
					</button>
					<button
						className="negative"
						onClick={() => {
							addGuess({
								game: game!._id,
								location: square._id,
								question: question._id,
								guess: 'disagree',
							});
						}}
					>
						Disagree
					</button>
				</div>
			)}
		</>
	);
}
