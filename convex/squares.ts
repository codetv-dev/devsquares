import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { api } from './_generated/api';

export const set_secret_square = mutation({
	async handler(ctx) {
		const secret_location = Math.floor(Math.random() * 9);
		const squares = await ctx.db.query('squares').collect();

		squares.forEach(async (square) => {
			if (square.location === secret_location) {
				await ctx.db.patch(square._id, {
					secret: true,
				});
			} else {
				await ctx.db.patch(square._id, {
					secret: false,
				});
			}
		});
	},
});

export const clear = mutation({
	args: {
		square: v.id('squares'),
	},
	async handler(ctx, args) {
		await ctx.db.patch(args.square, {
			active: false,
			state: 'empty',
		});
	},
});

export const clear_all = mutation({
	async handler(ctx) {
		const squares = await ctx.db.query('squares').collect();

		squares.forEach(async (square) => {
			await ctx.db.patch(square._id, {
				active: false,
				state: 'empty',
			});
		});
	},
});

export const select = mutation({
	args: {
		game: v.id('game'),
		id: v.id('squares'),
	},
	async handler(ctx, args) {
		const square = await ctx.runQuery(api.squares.get, { id: args.id });

		await ctx.runMutation(api.questions.set_active_question, {
			location: args.id,
		});

		if (square?.secret) {
			await ctx.runMutation(api.game.set_secret_square, { game: args.game });
		}

		return ctx.db.patch(args.id, { active: true });
	},
});

export const deselect = mutation({
	args: {
		id: v.id('squares'),
	},
	async handler(ctx, args) {
		return ctx.db.patch(args.id, { active: false });
	},
});

export const get_active_square = query({
	async handler(ctx) {
		const square = await ctx.db
			.query('squares')
			.withIndex('by_active_square', (q) => q.eq('active', true))
			.first();

		if (!square) {
			return null;
		}

		return {
			...square,
			photo: await ctx.storage.getUrl(square.photo),
		};
	},
});

export const mark_x = mutation({
	args: {
		id: v.id('squares'),
		game: v.id('game'),
	},
	async handler(ctx, args) {
		const game = await ctx.db.get(args.game);
		const square = await ctx.runQuery(api.squares.get_active_square);
		const activeQuestion = await ctx.runQuery(
			api.questions.get_active_question,
		);

		await ctx.runMutation(api.questions.mark_complete, {
			id: activeQuestion!._id,
			game: args.game,
			location: args.id,
		});

		const board = game!.board;
		board[square!.location] = 'X';

		await ctx.db.patch(args.game, {
			board,
		});

		await ctx.runMutation(api.game.set_default, { game: args.game });

		return ctx.db.patch(args.id, { state: 'X', active: false });
	},
});

export const mark_o = mutation({
	args: {
		id: v.id('squares'),
		game: v.id('game'),
	},
	async handler(ctx, args) {
		const game = await ctx.db.get(args.game);
		const square = await ctx.runQuery(api.squares.get_active_square);
		const activeQuestion = await ctx.runQuery(
			api.questions.get_active_question,
		);
		await ctx.runMutation(api.questions.mark_complete, {
			id: activeQuestion!._id,
			game: args.game,
			location: args.id,
		});

		await ctx.runMutation(api.answers.add, {
			question: activeQuestion!._id,
			game: args.game,
			was_square_correct: true,
		});

		const board = game!.board;
		board[square!.location] = 'O';

		await ctx.db.patch(args.game, {
			board,
		});

		await ctx.runMutation(api.game.set_default, { game: args.game });

		return ctx.db.patch(args.id, { state: 'O', active: false });
	},
});

export const mark_incorrect = mutation({
	args: {
		id: v.id('squares'),
		game: v.id('game'),
	},
	async handler(ctx, args) {
		const activeQuestion = await ctx.runQuery(
			api.questions.get_active_question,
		);

		if (activeQuestion) {
			await ctx.runMutation(api.questions.mark_complete, {
				id: activeQuestion!._id,
				game: args.game,
				location: args.id,
			});
		}

		await ctx.runMutation(api.answers.add, {
			question: activeQuestion!._id,
			game: args.game,
			was_square_correct: false,
		});

		await ctx.runMutation(api.game.set_default, { game: args.game });

		return ctx.db.patch(args.id, { state: 'empty', active: false });
	},
});

export const get = query({
	args: {
		id: v.id('squares'),
	},
	async handler(ctx, args) {
		const square = await ctx.db.get(args.id);

		if (!square) {
			return null;
		}

		return {
			...square,
			photo: await ctx.storage.getUrl(square.photo),
		};
	},
});

export const update_details = mutation({
	args: {
		id: v.id('squares'),
		name: v.string(),
		link: v.optional(v.string()),
		photo: v.id('_storage'),
	},
	async handler(ctx, args) {
		return ctx.db.patch(args.id, {
			name: args.name,
			link: args.link,
			photo: args.photo,
		});
	},
});

export const list = query({
	async handler(ctx) {
		const squares = await ctx.db.query('squares').collect();

		return Promise.all(
			squares.map(async (square) => {
				return {
					...square,
					photo: await ctx.storage.getUrl(square.photo),
				};
			}),
		);
	},
});

export const getByLocation = query({
	args: {
		location: v.number(),
	},
	async handler(ctx, args) {
		const square = await ctx.db
			.query('squares')
			.withIndex('by_location', (q) => q.eq('location', args.location))
			.first();

		if (!square) {
			return null;
		}

		return {
			...square,
			photo: await ctx.storage.getUrl(square.photo),
		};
	},
});

export const generateUploadUrl = mutation({
	async handler(ctx) {
		return ctx.storage.generateUploadUrl();
	},
});
