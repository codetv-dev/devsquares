import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { api } from './_generated/api';

export const get_game = query({
	args: {
		slug: v.string(),
	},
	async handler(ctx, args) {
		return ctx.db
			.query('game')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();
	},
});

export const next_game = mutation({
	args: {
		game: v.id('game'),
	},
	async handler(ctx, args) {
		const current_game = await ctx.db.get(args.game);
		const current_slug = current_game?.slug;

		if (current_game) {
			// Change the slug of the previous game to have a hash
			await ctx.db.patch(current_game._id, {
				slug: current_game.slug + '-' + Date.now(),
			});
		}

		// reset all the squares to empty state
		await ctx.runMutation(api.squares.clear_all);
		await ctx.runMutation(api.squares.set_secret_square);

		if (!current_slug) {
			console.log('slug is not set!');
			return;
		}

		await ctx.db.insert('game', {
			slug: current_slug,
			board: new Array(9).fill(null),
			state: 'default',
		});
	},
});

export const get_state = query({
	args: {
		slug: v.string(),
	},
	async handler(ctx, args) {
		const game = await ctx.db
			.query('game')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();

		return game?.state;
	},
});

export const check_for_win = query({
	args: {
		game: v.optional(v.id('game')),
	},
	async handler(ctx, args) {
		if (!args.game) {
			return;
		}

		const game = await ctx.db.get(args.game);

		if (!game) {
			return;
		}

		let winner: 'X' | 'O' | null = null;
		let winType: 'cat' | 'combo' | null = null;
		let winningCombo: Array<number> = [];
		const winCombos = [
			// horizontal
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			// vertical
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			// diagonal
			[0, 4, 8],
			[2, 4, 6],
		];

		const hasWinningCombo = winCombos.some((combo) => {
			const mark = game.board.at(combo[0]);
			if (!mark) return false;

			const win = combo.every((pos) => {
				const match = game.board[pos] === mark;

				return match;
			});

			if (win) {
				winningCombo = combo;
				winner = mark;
				winType = 'combo';
				return true;
			}

			return false;
		});

		if (!hasWinningCombo && game.board.every((m) => !!m)) {
			let highScore = 0;
			let count: Record<string, number> = {};

			for (let pos in game.board) {
				const mark = game.board[pos];
				count[mark] = (count[mark] ?? 0) + 1;

				if (count[mark] > highScore) {
					highScore = count[mark];
					winner = mark;
					winType = 'cat';
				}
			}

			winningCombo = game.board
				.map((m, i) => {
					if (m === winner) {
						return i;
					}

					return null;
				})
				.filter((m) => m !== null);
		}

		return winner ? { winner, winningCombo, winType } : false;
	},
});

// TODO use the game ID
export const set_show_guesses = mutation({
	args: {
		game: v.id('game'),
	},
	async handler(ctx, args) {
		const game = await ctx.db.get(args.game);

		await ctx.db.patch(game!._id, { state: 'show-guesses' });
	},
});

// TODO use the game ID
export const set_secret_square = mutation({
	args: {
		game: v.id('game'),
	},
	async handler(ctx, args) {
		const game = await ctx.db.get(args.game);

		await ctx.db.patch(game!._id, { state: 'secret-square' });
	},
});

// TODO use the game ID
export const set_default = mutation({
	args: {
		game: v.id('game'),
	},
	async handler(ctx, args) {
		const game = await ctx.db.get(args.game);

		await ctx.db.patch(game!._id, { state: 'default' });
	},
});
