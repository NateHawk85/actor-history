class ActorHistory
{

}

Hooks.on('updateActor', async (actor, change, options, userId) =>
{
	// TODO - catches "recursive" issue, but not very cleanly... we should definitely check this in a different way. Maybe seeing if change.flags !== undefined?
	if (!change.data)
	{
		return;
	}
	const currentHistory = actor.getFlag('actor-history', 'history') || [];
	currentHistory.push(change);
	await actor.setFlag('actor-history', 'history', currentHistory);
});