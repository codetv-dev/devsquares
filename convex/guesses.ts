import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const add_guess = mutation({
	args: {
		game: v.id('game'),
		question: v.id('questions'),
		location: v.id('squares'),
		guess: v.union(v.literal('agree'), v.literal('disagree')),
	},
	async handler(ctx, args) {
		const user = await ctx.auth.getUserIdentity();

		if (!user) {
			console.error('not authorized to perform this action');
			return;
		}

		await ctx.db.insert('guesses', { ...args, user: user.subject });
	},
});

export const get_active_guess = query({
	args: {
		game: v.optional(v.id('game')),
		question: v.optional(v.id('questions')),
		location: v.optional(v.id('squares')),
	},
	async handler(ctx, args) {
		if (!args.game || !args.location || !args.question) {
			return;
		}

		const user = await ctx.auth.getUserIdentity();

		if (!user) {
			console.error('not authorized to perform this action');
			return;
		}

		return ctx.db
			.query('guesses')
			.withIndex('by_user', (q) =>
				q
					.eq('game', args.game!)
					.eq('user', user.subject)
					.eq('question', args.question!)
					.eq('location', args.location!),
			)
			.first();
	},
});

export const list = query({
	args: {
		game: v.optional(v.id('game')),
		question: v.optional(v.id('questions')),
		location: v.optional(v.id('squares')),
	},
	async handler(ctx, args) {
		if (!args.location || !args.question) {
			return { agree: 0, disagree: 0 };
		}

		const guesses = await ctx.db
			.query('guesses')
			.withIndex('by_question', (q) =>
				q.eq('game', args.game!).eq('question', args.question!),
			)
			.collect();

		const total = guesses.length;

		if (total === 0) {
			return { agree: 0, disagree: 0 };
		}

		const [agree, disagree] = ['agree', 'disagree'].map((guess) => {
			return Math.round(
				(guesses.filter((g) => g.guess === guess).length / total) * 100,
			);
		});

		return { agree, disagree };
	},
});
