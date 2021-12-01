Hooks.on('updateActor', async (actor, change, options, userId) =>
{
	await storeUpdateActorHistory(actor, change);
});

Hooks.on('createItem', async (item, options, userId) =>
{
	await storeCreateItemHistory(item);
});

Hooks.on('updateItem', async (item, change, options, userId) =>
{
	await storeUpdateItemHistory(item, change);
});

export async function storeUpdateActorHistory(actor, change)
{
	if (!shouldActorStoreHistory(actor) || !change.data)
	{
		return;
	}

	const changes = {
		change: change.data
	};
	await addChangeDataToActorHistory('updateActor', changes, actor);
}

export async function storeCreateItemHistory(item)
{
	const actor = item.parent;

	if (!shouldActorStoreHistory(actor))
	{
		return;
	}

	const changes = {
		item: item.data
	};
	await addChangeDataToActorHistory('createItem', changes, actor);
}

export async function storeUpdateItemHistory(item, change)
{
	const actor = item.parent;

	if (!shouldActorStoreHistory(actor) || !change.data || itemWasClosedWithNoChanges(item, change))
	{
		return;
	}

	const changes = {
		item: item.data,
		change: change.data
	};
	await addChangeDataToActorHistory('updateItem', changes, actor);
}

async function addChangeDataToActorHistory(hookName, changes, actor)
{
	let currentHistory = actor.getFlag('actor-history', 'history') || [];

	let timeData = getCurrentTimeData();

	const changeData = {
		hook: hookName,
		changes: changes,
		...timeData
	};

	currentHistory.push(changeData);
	await actor.setFlag('actor-history', 'history', currentHistory);
}

function shouldActorStoreHistory(actor)
{
	return actor && actor.type === 'character';
}

function getCurrentTimeData()
{
	let date = new Date();
	let utcTimestamp = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
		date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
	let timestampIRL = new Date(utcTimestamp);

	let timeData = {
		timestampIRL: timestampIRL
	}
	if (simpleCalendarIsInstalled())
	{
		timeData.timestampInGame = SimpleCalendar.api.timestampToDate(SimpleCalendar.api.timestamp());
	}

	return timeData;
}

function simpleCalendarIsInstalled()
{
	return game.modules.get("foundryvtt-simple-calendar")?.active;
}

function itemWasClosedWithNoChanges(item, change)
{
	const changeObjectKeys = Object.keys(change.data);

	if (changeObjectKeys.length === 1 && changeObjectKeys[0] === 'damage')
	{
		const actorHistory = item.parent.getFlag('actor-history', 'history');
		const mostRecentItemDamageChange = findMostRecentItemDamageChangeFromHistory(item, actorHistory);

		return mostRecentItemDamageChange
			&& JSON.stringify(change.data.damage?.parts) === JSON.stringify(mostRecentItemDamageChange.changes.item.data.damage.parts);
	}
	return false;
}

function findMostRecentItemDamageChangeFromHistory(item, history)
{
	try
	{
		const matchingDamageChangeHistories = history.filter(element => element.changes?.item?._id === item.data._id)
													 .filter(element => element.changes.item.data.damage?.parts);

		return matchingDamageChangeHistories.length > 0 ? matchingDamageChangeHistories[matchingDamageChangeHistories.length - 1] : undefined;
	} catch (error)
	{
		return undefined;
	}
}