import { useRef, useState, type FormEvent } from 'react';
import {
	Authenticated,
	Unauthenticated,
	useMutation,
	useQuery,
} from 'convex/react';
import { SignUp, UserButton, useUser } from '@clerk/clerk-react';
import { withConvexProvider } from '../lib/convex.tsx';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import Question from './question.tsx';
import CurrentlyAnswering from './currently-answering.tsx';

const Update = ({
	id,
	handleSubmit,
}: {
	id: Id<'squares'>;
	handleSubmit: () => void;
}) => {
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const imageInput = useRef<HTMLInputElement>(null);

	const generateUploadUrl = useMutation(api.squares.generateUploadUrl);
	const updateDetails = useMutation(api.squares.update_details);

	async function handleUpdate(event: FormEvent) {
		event.preventDefault();

		const data = new FormData(event.currentTarget as HTMLFormElement);
		const name = data.get('name') as string;
		const link = data.get('link') as string;

		const postUrl = await generateUploadUrl();
		const result = await fetch(postUrl, {
			method: 'POST',
			headers: { 'Content-Type': selectedImage!.type },
			body: selectedImage,
		});

		const { storageId } = await result.json();

		await updateDetails({
			id,
			name,
			link,
			photo: storageId,
		});

		setSelectedImage(null);
		imageInput.current!.value = '';
		handleSubmit();
	}

	return (
		<form onSubmit={handleUpdate}>
			<label htmlFor="name">Name</label>
			<input type="text" name="name" id="name" required />

			<label htmlFor="link">Link</label>
			<input type="url" name="link" id="link" />

			<input
				type="file"
				accept="image/*"
				ref={imageInput}
				onChange={(event) => setSelectedImage(event.target.files![0])}
				disabled={selectedImage !== null}
			/>

			<button type="submit">Update</button>
		</form>
	);
};

const QuestionAdmin = ({ slug }: { slug: string }) => {
	const game = useQuery(api.game.get_game, { slug });
	const question = useQuery(api.questions.get_active_question);
	const square = useQuery(api.squares.get_active_square);
	const guesses = useQuery(api.guesses.list, {
		game: game?._id,
		location: square?._id,
		question: question?._id,
	});

	return (
		<section className="question-admin">
			<CurrentlyAnswering />

			<Question />

			{question ? (
				<div className="correct-answer">
					<p>Correct answer: {question.answer}</p>
				</div>
			) : null}

			{game?.state === 'secret-square' ? (
				<div className="secret-square">
					<p>Secret square!</p>
				</div>
			) : null}

			{game?.state === 'show-guesses' && guesses ? (
				<div className="audience-guesses">
					<p>
						Agree: {guesses.agree}% · Disagree: {guesses.disagree}%
					</p>
				</div>
			) : null}
		</section>
	);
};

const Grid = ({ slug }: { slug: string }) => {
	const game = useQuery(api.game.get_game, { slug });
	const win = useQuery(api.game.check_for_win, { game: game?._id });
	const question = useQuery(api.questions.get_active_question);
	const currentAnswer = useQuery(api.answers.get_by_question, {
		question: question?._id,
		game: game?._id,
	});
	const [squareToUpdate, setSquareToUpdate] = useState<Id<'squares'> | null>(
		null,
	);
	const squares = useQuery(api.squares.list);
	const activeSquare = useQuery(api.squares.get_active_square);
	const showGuesses = useMutation(api.game.set_show_guesses);
	const markActive = useMutation(api.squares.select);
	const markX = useMutation(api.squares.mark_x);
	const markO = useMutation(api.squares.mark_o);
	const markIncorrect = useMutation(api.squares.mark_incorrect);
	const clear = useMutation(api.squares.clear);
	const answer = useMutation(api.answers.add);
	const setSecretSquare = useMutation(api.squares.set_secret_square);
	const clearAll = useMutation(api.squares.clear_all);

	function handleUpdate(id: Id<'squares'>) {
		setSquareToUpdate(id);
	}

	if (win) {
		return (
			<div className="winner">
				<p>{win.winner} is the winner!</p>
			</div>
		);
	}

	if (squareToUpdate) {
		return (
			<Update
				id={squareToUpdate}
				handleSubmit={() => setSquareToUpdate(null)}
			/>
		);
	}

	if (activeSquare) {
		return (
			<div>
				{!currentAnswer ? (
					<div className="square-answer">
						<p className="label">{activeSquare.name}’s answer is:</p>
						<div className="play-controls">
							<button
								className="positive"
								onClick={() => {
									answer({
										game: game!._id,
										question: question!._id,
										was_square_correct: true,
									});
								}}
							>
								Correct
							</button>

							<button
								className="negative"
								onClick={() => {
									answer({
										game: game!._id,
										question: question!._id,
										was_square_correct: true,
									});
								}}
							>
								Incorrect
							</button>

							<button
								onClick={() => clear({ square: activeSquare._id })}
								className="secondary"
							>
								Clear
							</button>
						</div>
					</div>
				) : null}

				{currentAnswer && game && game.state !== 'show-guesses' ? (
					<div className="square-answer">
						<p className="label">
							Give the audience a few seconds to log their guesses
						</p>
						<div className="play-controls">
							<button onClick={() => showGuesses()}>
								Show Audience Guesses
							</button>
						</div>
					</div>
				) : null}

				{currentAnswer && game && game.state === 'show-guesses' ? (
					<div className="square-answer">
						<p className="label">Did the contestant guess correctly?</p>
						<div className="play-controls">
							<button
								className="positive"
								onClick={() => markX({ id: activeSquare._id, game: game!._id })}
							>
								Mark X
							</button>

							<button
								className="positive"
								onClick={() => markO({ id: activeSquare._id, game: game!._id })}
							>
								Mark O
							</button>

							<button
								className="negative"
								onClick={() =>
									markIncorrect({ id: activeSquare._id, game: game!._id })
								}
							>
								Incorrect
							</button>
						</div>
					</div>
				) : null}
			</div>
		);
	}

	return (
		<>
			<section className="admin">
				{squares?.map((square) => (
					<div className="square" key={square._id}>
						<div className="details">
							<img src={square.photo!} alt={square.name} />
							<h3>
								{square.name} {square.secret ? '*' : null}
							</h3>
						</div>
						<div className="controls">
							{['X', 'O'].includes(square.state) ? (
								<>
									<span className="marked">{square.state}</span>
									<button
										onClick={() => clear({ square: square._id })}
										className="secondary"
									>
										Clear Square
									</button>
								</>
							) : null}

							{square.state === 'empty' && !square.active ? (
								<>
									<button onClick={() => markActive({ id: square._id })}>
										Mark Active
									</button>
									<button
										onClick={() => handleUpdate(square._id as Id<'squares'>)}
										className="secondary"
									>
										Update Square
									</button>
								</>
							) : null}
						</div>
					</div>
				))}
			</section>

			<section className="game-controls">
				<button onClick={() => setSecretSquare()}>Reset Secret Square</button>
				<button onClick={() => clearAll()}>Reset Game</button>

				<UserButton />
			</section>
		</>
	);
};

export default withConvexProvider(function Controls({
	slug,
}: {
	slug: string;
}) {
	const { user, isLoaded, isSignedIn } = useUser();

	if (isLoaded && isSignedIn && user?.publicMetadata.role !== 'host') {
		return (
			<>
				<h1>Only the host can view this page.</h1>
				<p>
					<a href="/play">&larr; back to safey</a>
				</p>
			</>
		);
	}

	return (
		<>
			<Authenticated>
				<QuestionAdmin slug={slug} />

				<Grid slug={slug} />
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
