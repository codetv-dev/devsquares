import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Question() {
	const question = useQuery(api.questions.get_active_question);

	if (!question) {
		return null;
	}

	return (
		<div className="question">
			<p>{question.text}</p>
		</div>
	);
}
