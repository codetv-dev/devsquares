import { CONVEX_URL } from 'astro:env/client';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { type JSX, type ComponentType } from 'react';

const client = new ConvexReactClient(CONVEX_URL);

// Astro context providers don't work when used in .astro files.
// See this and other related issues: https://github.com/withastro/astro/issues/2016#issuecomment-981833594
//
// This exists to conveniently wrap any component that uses Convex.
export function withConvexProvider<T>(Component: ComponentType<T>) {
	return function WithConvexProvider(props: T) {
		return (
			<ClerkProvider
				publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}
			>
				<ConvexProviderWithClerk client={client} useAuth={useAuth}>
					<Component {...(props as T & JSX.IntrinsicAttributes)} />
				</ConvexProviderWithClerk>
			</ClerkProvider>
		);
	};
}
