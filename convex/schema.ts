import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// TODO figure out how to track user names (new table?)

export default defineSchema({
	game: defineTable({
		slug: v.string(),
		state: v.union(
			v.literal('default'),
			v.literal('show-guesses'),
			v.literal('secret-square'),
		),
		board: v.array(v.union(v.null(), v.literal('X'), v.literal('O'))),
	}).index('by_slug', ['slug']),
	squares: defineTable({
		location: v.number(),
		name: v.string(),
		link: v.optional(v.string()),
		photo: v.id('_storage'),
		state: v.union(v.literal('empty'), v.literal('O'), v.literal('X')),
		active: v.boolean(),
		secret: v.boolean(),
	})
		.index('by_location', ['location'])
		.index('by_active_square', ['active']),
	questions: defineTable({
		text: v.string(),
		answer: v.string(),
		complete: v.boolean(),
		active: v.boolean(),
		square: v.optional(v.id('squares')),
	})
		.index('by_active_question', ['active'])
		.index('by_complete', ['complete']),
	answers: defineTable({
		game: v.id('game'),
		question: v.id('questions'),
		was_square_correct: v.boolean(),
	}).index('by_question', ['game', 'question']),
	guesses: defineTable({
		game: v.id('game'),
		question: v.id('questions'),
		location: v.id('squares'),
		guess: v.union(v.literal('agree'), v.literal('disagree')),
		user: v.string(),
	})
		.index('by_user', ['game', 'user', 'question', 'location'])
		.index('by_question', ['game', 'question']),
});
