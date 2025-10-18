import { Authenticated, Unauthenticated, useQuery } from 'convex/react';
import { withConvexProvider } from '../lib/convex';
import PlayControls from './play-controls';
import Question from './question';
import { SignUp } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import CurrentlyAnswering from './currently-answering';

export default withConvexProvider(function Controls({
	slug,
}: {
	slug: string;
}) {
	const game = useQuery(api.game.get_game, { slug });
	const currentSquare = useQuery(api.squares.get_active_square);
	const scoreboard = useQuery(api.answers.calculate_scores, {
		game: game?._id,
	});

	return (
		<>
			<Authenticated>
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

				<pre>{JSON.stringify(scoreboard, null, 2)}</pre>
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
