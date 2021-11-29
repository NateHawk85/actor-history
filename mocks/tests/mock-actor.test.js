import MockActor from "../../mocks/mock-actor";

test('MockActor getters and setters work correctly', () =>
{
	let actor = new MockActor('character');

	expect(actor.getFlag('test', 'otherTest'))
		.toBe(undefined);

	actor.setFlag('test', 'otherTest', 'a variable');

	expect(actor.getFlag('test', 'otherTest'))
		.toBe('a variable');
});