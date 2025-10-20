import { useQuery } from 'convex/react';
import { withConvexProvider } from '../lib/convex';
import Question from './question';
import Square from './square';
import Title from './title';
import { api } from '../../convex/_generated/api';
import GuessDisplay from './guess-display';
import CurrentlyAnswering from './currently-answering';

export default withConvexProvider(function Controls({
	slug,
}: {
	slug: string;
}) {
	const game = useQuery(api.game.get_game, { slug });
	const win = useQuery(api.game.check_for_win, { game: game?._id });
	const currentSquare = useQuery(api.squares.get_active_square);

	if (!game) {
		return null;
	}

	return (
		<div className="game" data-state={game.state}>
			<section className="squares">
				{Array(9)
					.fill('')
					.map((_, i) => {
						{
							let highlight = false;
							if (win && win.winningCombo) {
								highlight = win.winningCombo.includes(i);
							}

							return <Square key={i} location={i} highlight={highlight} />;
						}
					})}
			</section>

			<section className="info">
				{win ? (
					<aside className="win-banner">
						<p>
							{win.winType === 'cat' ? (
								<>
									Cat's game!
									<br />
								</>
							) : null}{' '}
							{win.winner} wins!
						</p>
					</aside>
				) : null}

				<CurrentlyAnswering />

				<Question />

				{game.state === 'secret-square' ? (
					<div className="secret-square-banner">
						<p>
							<strong>{currentSquare?.name} is the secret square!</strong> Get
							this question correct for a chance to win prizes from our sponsor,
							Convex!
						</p>
					</div>
				) : null}

				{game.state === 'show-guesses' ? (
					<GuessDisplay game={game._id} />
				) : null}

				<Title />

				<div className="play-along">
					<h3>
						Play along
						<br />
						on your phone
						<br />
						or computer
						<br />
						<span>codetv.link/ds</span>
					</h3>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						shapeRendering="crispEdges"
						viewBox="0 0 33 33"
					>
						<path fill="#C8CDD7" d="M0 0h33v33H0z" />
						<path
							stroke="#050810"
							d="M4 4.5h7m4 0h3m2 0h1m1 0h7m-25 1h1m5 0h1m2 0h1m1 0h1m1 0h4m1 0h1m5 0h1m-25 1h1m1 0h3m1 0h1m1 0h3m1 0h1m2 0h1m2 0h1m1 0h3m1 0h1m-25 1h1m1 0h3m1 0h1m1 0h7m3 0h1m1 0h3m1 0h1m-25 1h1m1 0h3m1 0h1m1 0h3m1 0h2m2 0h1m1 0h1m1 0h3m1 0h1m-25 1h1m5 0h1m1 0h6m1 0h1m2 0h1m5 0h1m-25 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-17 1h2m4 0h3m-17 1h1m1 0h5m3 0h1m2 0h1m4 0h5m-22 1h4m3 0h4m1 0h1m2 0h1m2 0h1m3 0h1m-20 1h3m1 0h3m2 0h3m1 0h1m1 0h3m1 0h2m-24 1h1m1 0h1m1 0h1m1 0h2m2 0h2m1 0h1m1 0h2m6 0h1m-25 1h2m4 0h1m1 0h2m3 0h2m2 0h2m1 0h1m1 0h3m-25 1h1m2 0h1m1 0h1m1 0h1m4 0h1m6 0h1m1 0h1m1 0h1m-24 1h1m2 0h2m1 0h2m2 0h1m3 0h2m1 0h5m1 0h2m-25 1h1m6 0h3m2 0h1m3 0h1m1 0h3m3 0h1m-25 1h1m4 0h5m2 0h9m1 0h1m-15 1h2m4 0h1m1 0h1m3 0h2m-22 1h7m2 0h5m2 0h1m1 0h1m1 0h1m1 0h3m-25 1h1m5 0h1m1 0h4m2 0h1m1 0h1m3 0h2m-22 1h1m1 0h3m1 0h1m1 0h1m1 0h2m3 0h6m1 0h3m-25 1h1m1 0h3m1 0h1m1 0h1m3 0h2m1 0h1m1 0h2m1 0h5m-25 1h1m1 0h3m1 0h1m1 0h3m2 0h2m6 0h2m1 0h1m-25 1h1m5 0h1m5 0h2m2 0h6m2 0h1m-25 1h7m1 0h2m2 0h1m1 0h1m2 0h8"
						/>
					</svg>
				</div>
			</section>
		</div>
	);
});
