import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const list_by_game = query({
	args: {
		slug: v.string(),
	},
	async handler(ctx, args) {
		const game = await ctx.db
			.query('game')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();

		if (!game) {
			return [];
		}

		return ctx.db
			.query('answers')
			.withIndex('by_question', (q) => q.eq('game', game?._id))
			.collect();
	},
});

export const get_by_question = query({
	args: {
		game: v.optional(v.id('game')),
		question: v.optional(v.id('questions')),
	},
	async handler(ctx, args) {
		if (!args.game || !args.question) {
			return false;
		}

		return ctx.db
			.query('answers')
			.withIndex('by_question', (q) =>
				q.eq('game', args.game!).eq('question', args.question!),
			)
			.first();
	},
});

export const add = mutation({
	args: {
		game: v.id('game'),
		question: v.id('questions'),
		was_square_correct: v.boolean(),
	},
	async handler(ctx, args) {
		const existing_answer = await ctx.db
			.query('answers')
			.withIndex('by_question', (q) =>
				q.eq('game', args.game).eq('question', args.question),
			)
			.first();

		if (existing_answer) {
			await ctx.db.patch(existing_answer._id, args);
		} else {
			await ctx.db.insert('answers', args);
		}
	},
});

export const calculate_score_by_user = query({
	args: {
		game: v.optional(v.id('game')),
	},
	async handler(ctx, args) {
		const user = await ctx.auth.getUserIdentity();

		if (!user || !args.game) {
			return false;
		}

		const answers = await ctx.db
			.query('answers')
			.withIndex('by_question', (q) => q.eq('game', args.game!))
			.collect();

		const guesses = await ctx.db
			.query('guesses')
			.withIndex('by_user', (q) =>
				q.eq('game', args.game!).eq('user', user.subject),
			)
			.collect();

		const total = answers.length;
		const correct = answers.filter((a) => {
			const { guess } = guesses.find((g) => g.question === a.question) ?? {};

			if (a.was_square_correct) {
				return guess === 'agree';
			} else {
				return guess === 'disagree';
			}
		}).length;

		return {
			correct,
			total,
		};
	},
});

export const get_secret_square_answer_status = query({
	args: {
		game: v.optional(v.id('game')),
	},
	async handler(ctx, args) {
		const user = await ctx.auth.getUserIdentity();

		if (!user || !args.game) {
			return false;
		}

		const secret_square = await ctx.db
			.query('squares')
			.withIndex('by_secret_square', (q) => q.eq('secret', true))
			.first();

		const secret_question = await ctx.db
			.query('questions')
			.withIndex('by_square', (q) => q.eq('square', secret_square?._id))
			.first();

		if (!secret_question || secret_question.complete !== true) {
			return null;
		}

		const answer = await ctx.db
			.query('answers')
			.withIndex('by_question', (q) =>
				q.eq('game', args.game!).eq('question', secret_question._id),
			)
			.first();

		const guess = await ctx.db
			.query('guesses')
			.withIndex('by_user', (q) =>
				q
					.eq('game', args.game!)
					.eq('user', user.subject)
					.eq('question', secret_question._id),
			)
			.first();

		if (!answer || !guess) {
			return null;
		}

		if (answer.was_square_correct) {
			return guess.guess === 'agree';
		} else {
			return guess.guess === 'disagree';
		}
	},
});

export const calculate_scores = query({
	args: {
		game: v.optional(v.id('game')),
	},
	async handler(ctx, args) {
		if (!args.game) {
			return {};
		}

		const allGuesses = await ctx.db
			.query('guesses')
			.withIndex('by_question', (q) => q.eq('game', args.game!))
			.collect();

		const answers = await ctx.db
			.query('answers')
			.withIndex('by_question', (q) => q.eq('game', args.game!))
			.collect();

		let scoreboard: Record<string, number> = {};
		for (let answer of answers) {
			const guesses = allGuesses.filter((g) => g.question === answer.question);
			for (let guess of guesses) {
				const correctGuess = answer.was_square_correct ? 'agree' : 'disagree';

				if (guess.guess === correctGuess) {
					scoreboard[guess.user] = (scoreboard[guess.user] ?? 0) + 1;
				}
			}
		}

		// TODO get user names
		return scoreboard;
	},
});
