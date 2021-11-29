Hooks.on('updateActor', async (actor, change, options, userId) =>
{
	await storeUpdateActorHistory(actor, change);
});

export async function storeUpdateActorHistory(actor, change)
{
	if (change.data && actor.type === 'character')
	{
		const changes = {
			change: change.data
		};
		await addChangeDataToActorHistory('updateActor', changes, actor);
	}
}

Hooks.on('createItem', async (item, options, userId) =>
{
	await storeCreateItemHistory(item);
});

export async function storeCreateItemHistory(item)
{
	const actor = item.parent;

	if (actor && actor.type === 'character')
	{
		const changes = {
			item: item.data
		};
		await addChangeDataToActorHistory('createItem', changes, actor);
	}
}

Hooks.on('updateItem', async (item, change, options, userId) =>
{
	await storeUpdateItemHistory(item, change);
});

export async function storeUpdateItemHistory(item, change)
{
	const actor = item.parent;

	if (actor && actor.type === 'character')
	{
		if (!itemWasClosedWithNoChanges(item, change))
		{
			const changes = {
				item: item.data,
				change: change.data
			};
			await addChangeDataToActorHistory('updateItem', changes, actor);
		}
	}
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

function findMostRecentItemDamageChangeFromHistory(item, history)
{
	const matchingDamageChangeHistories = history.filter(element => element.changes.item?._id === item.id)
												 .filter(element => element.changes.item.data?.damage.parts);

	return matchingDamageChangeHistories.length > 0 ? matchingDamageChangeHistories[matchingDamageChangeHistories.length - 1] : undefined;
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
		const history = item.parent.getFlag('actor-history', 'history');
		const mostRecentItemDamageChange = findMostRecentItemDamageChangeFromHistory(item, history);

		return !mostRecentItemDamageChange ||
			JSON.stringify(mostRecentItemDamageChange.changes.item.data.damage.parts) === JSON.stringify(item.data.data.damage?.parts);
	}
	return false;
}