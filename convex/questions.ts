import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { api } from './_generated/api';

export const get_active_question = query({
	async handler(ctx) {
		const question = await ctx.db
			.query('questions')
			.withIndex('by_active_question', (q) => q.eq('active', true))
			.first();

		return question;
	},
});

export const get_available_questions = query({
	async handler(ctx) {
		return ctx.db
			.query('questions')
			.withIndex('by_complete', (q) => q.eq('complete', false))
			.collect();
	},
});

export const set_active_question = mutation({
	args: {
		location: v.id('squares'),
	},
	async handler(ctx, args) {
		const questions = await ctx.runQuery(api.questions.get_available_questions);

		const index = Math.floor(Math.random() * questions.length);

		await ctx.db.patch(questions[index]._id, {
			active: true,
			square: args.location,
		});
	},
});

export const mark_complete = mutation({
	args: {
		id: v.id('questions'),
		location: v.id('squares'),
	},
	async handler(ctx, args) {
		await ctx.runMutation(api.game.set_default);

		await ctx.db.patch(args.id, {
			complete: true,
			square: args.location,
			active: false,
		});
	},
});
