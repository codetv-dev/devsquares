import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

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

		let winner;
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
				console.log({ position: pos, value: game.board[pos], match });
				return match;
			});

			console.log({ combo, mark, win });

			if (win) {
				winningCombo = combo;
				winner = mark;
				return true;
			}

			return false;
		});

		if (!hasWinningCombo && game.board.every((m) => !!m)) {
			console.log('cat’s game');
			let highScore = 0;
			let count: Record<string, number> = {};

			for (let pos in game.board) {
				const mark = game.board[pos];
				count[mark] = (count[mark] ?? 0) + 1;
				console.log({ position: pos, mark: game.board[pos], count });

				if (count[mark] > highScore) {
					highScore = count[mark];
					winner = mark;
				}
			}
		}

		return winner ? { winner, winningCombo } : false;
	},
});

// TODO use the game ID
export const set_show_guesses = mutation({
	async handler(ctx) {
		const game = await ctx.db.query('game').first();

		await ctx.db.patch(game!._id, { state: 'show-guesses' });
	},
});

// TODO use the game ID
export const set_secret_square = mutation({
	async handler(ctx) {
		const game = await ctx.db.query('game').first();

		await ctx.db.patch(game!._id, { state: 'secret-square' });
	},
});

// TODO use the game ID
export const set_default = mutation({
	async handler(ctx) {
		const game = await ctx.db.query('game').first();

		await ctx.db.patch(game!._id, { state: 'default' });
	},
});
