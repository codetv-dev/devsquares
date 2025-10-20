import { Authenticated, Unauthenticated, useQuery } from 'convex/react';
import { withConvexProvider } from '../lib/convex';
import PlayControls from './play-controls';
import Question from './question';
import { SignUp, UserButton } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import CurrentlyAnswering from './currently-answering';

export default withConvexProvider(function Controls({
	slug,
}: {
	slug: string;
}) {
	const game = useQuery(api.game.get_game, { slug });
	const currentSquare = useQuery(api.squares.get_active_square);
	const secretSquareAnswerStatus = useQuery(
		api.answers.get_secret_square_answer_status,
		{ game: game?._id },
	);
	const score = useQuery(api.answers.calculate_score_by_user, {
		game: game?._id,
	});

	return (
		<>
			<Authenticated>
				{score ? (
					<header className="player-header">
						<div className="score">
							<p>
								Score: {score.correct * 100}
								<span className="label">
									{score.correct}/{score.total} answered correctly
								</span>
							</p>
						</div>

						<UserButton />
					</header>
				) : null}

				{secretSquareAnswerStatus ? (
					<div className="secret-square-banner">
						<p>
							<strong>Great work!</strong> You got the secret square question
							correct!
						</p>
					</div>
				) : null}

				<CurrentlyAnswering />

				<Question />

				{game && game.state === 'secret-square' ? (
					<div className="secret-square-banner">
						<p>
							<strong>{currentSquare?.name} is the secret square!</strong> Get
							this question correct for a chance to win prizes from our sponsor,
							Convex!
						</p>
					</div>
				) : null}

				<PlayControls slug={slug} />
			</Authenticated>

			<Unauthenticated>
				<SignUp
					forceRedirectUrl={window.location.toString()}
					signInForceRedirectUrl={window.location.toString()}
				/>
			</Unauthenticated>
		</>
	);
});
