import * as ActorHistory from "../actor-history";
import MockActor from "../../mocks/mock-actor";

const DATE_TIMESTAMP_UTC = 1640995199000;
const SIMPLE_CALENDAR_TIMESTAMP_TO_DATE = 'SimpleCalendar time object';

let actor;

beforeEach(() =>
{
	actor = new MockActor('character');
	mockTimestamp(DATE_TIMESTAMP_UTC);
	mockSimpleCalendar(true, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE);
});

//region storeUpdateActorHistory

test('storeUpdateActorHistory - When change.data is undefined Then does nothing', () =>
{
	ActorHistory.storeUpdateActorHistory(actor, {});

	expect(actor.getFlag('actor-history', 'history'))
		.toBeUndefined();
});

test('storeUpdateActorHistory - When actor.type is not "character" Then does nothing', () =>
{
	actor.type = 'npc';

	ActorHistory.storeUpdateActorHistory(actor, buildChangeData());

	expect(actor.getFlag('actor-history', 'history'))
		.toBeUndefined();
});

test('storeUpdateActorHistory - When is valid change and no history exists Then initializes history', () =>
{
	ActorHistory.storeUpdateActorHistory(actor, buildChangeData());

	expect(actor.getFlag('actor-history', 'history'))
		.toBeDefined();
});

test('storeUpdateActorHistory - When is valid change Then updates history', () =>
{
	const expectedChange = 'a test value';
	mockSimpleCalendar(false);

	ActorHistory.storeUpdateActorHistory(actor, buildChangeData(expectedChange));

	const expected = {
		hook: 'updateActor',
		changes: {
			change: expectedChange
		},
		timestampIRL: new Date(DATE_TIMESTAMP_UTC)
	}
	expect(findMostRecentHistory())
		.toStrictEqual(expected);
});

test('storeUpdateActorHistory - When is valid change and Simple Calendar installed Then updates history correctly', () =>
{
	const expectedChange = 'another test value';
	mockTimestamp(12345)

	ActorHistory.storeUpdateActorHistory(actor, buildChangeData(expectedChange));

	const expected = {
		hook: 'updateActor',
		changes: {
			change: expectedChange
		},
		timestampIRL: new Date(12345),
		timestampInGame: SIMPLE_CALENDAR_TIMESTAMP_TO_DATE
	}

	expect(findMostRecentHistory())
		.toStrictEqual(expected);
});

test('storeUpdateActorHistory - When is valid change and history already exists Then adds history at end', () =>
{
	let existingHistory = [{something: 'something exists here already'}];
	actor.setFlag('actor-history', 'history', existingHistory);
	const expectedChange = 'a test value';

	ActorHistory.storeUpdateActorHistory(actor, buildChangeData(expectedChange));

	const expected = {
		hook: 'updateActor',
		changes: {
			change: expectedChange
		},
		timestampIRL: new Date(DATE_TIMESTAMP_UTC),
		timestampInGame: SIMPLE_CALENDAR_TIMESTAMP_TO_DATE
	}
	expect(findMostRecentHistory())
		.toStrictEqual(expected);
});

//endregion

// TODO - everything below this

function findMostRecentHistory()
{
	let history = actor.getFlag('actor-history', 'history');

	return history[history.length - 1];
}

function buildChangeData(data, shouldAddActor)
{
	if (!data)
	{
		data = {};
	}

	const changeData = {
		data: data
	};

	if (shouldAddActor)
	{
		changeData.actor = actor;
	}
	return changeData;
}

function mockTimestamp(timestamp)
{
	Date.UTC = jest.fn(() => timestamp);
}

function mockSimpleCalendar(isInstalled, timestampToDateValue)
{
	game.modules.get.mockReturnValue({active: isInstalled});
	SimpleCalendar.api.timestampToDate.mockReturnValue(timestampToDateValue)
}

// TODO - test scenarios
// - createItem
// 	- Initializes history if none exists
// - updateItem
// 	- Initializes history if none exists
// 	- DOES NOT update anything if item is not connected to actor
// 	- DOES NOT update anything if item is connected to actor other than 'character' actors
//	- DOES NOT update when closed
//	- Updates when change was made
//	- Updates when change was made and damage was changed
//	- Updates when only change that was made was a damage change
//	- DOES NOT update when closed and another item (without changes) exists
//	- Updates when change was made and another item (without changes) exists
//	- Updates when change was made and another item (with changes) exists
//	- DOES NOT update when closed and another item (with changes) exists