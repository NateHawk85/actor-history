import * as ActorHistory from "../actor-history";
import MockActor from "../../mocks/mock-actor";

const DATE_TIMESTAMP_UTC = 1640995199000;
const SIMPLE_CALENDAR_TIMESTAMP_TO_DATE = 'SimpleCalendar time object';

const ITEM_ID = 'ABCD1234';
const CLUB_DESCRIPTION = '<p>A stout knob of wood forms a simple, but effective, cudgel.</p>';
const CLUB_DAMAGE = '1d4 + @mod';
const CLUB_DAMAGE_TYPE = 'bludgeoning';
const ITEM_DATA = {
	_id: ITEM_ID,
	data: {
		description: CLUB_DESCRIPTION,
		damage: {
			parts: [CLUB_DAMAGE, CLUB_DAMAGE_TYPE]
		}
	},
	img: 'systems/dnd5e/icons/items/weapons/club-spikes.jpg'
};
const CHANGE_DATA = {
	damage: {
		parts: [CLUB_DAMAGE, CLUB_DAMAGE_TYPE]
	}
};

let dateUTCSpy;

let mockActor;
let item;
let change;

beforeEach(() =>
{
	mockActor = new MockActor('character');
	item = {
		data: {...ITEM_DATA},
		parent: mockActor
	};
	change = {
		data: {...CHANGE_DATA}
	};

	mockTimestamp(DATE_TIMESTAMP_UTC);
	mockSimpleCalendar(true, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE);
});

describe('storeUpdateActorHistory', () =>
{
	describe('WHEN parameters are invalid THEN does nothing', () =>
	{
		test('WHEN change.data is undefined THEN does nothing', () =>
		{
			change.data = undefined;

			ActorHistory.storeUpdateActorHistory(mockActor, change);

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});

		test('WHEN actor.type is not "character" THEN does nothing', () =>
		{
			mockActor.type = 'npc';

			ActorHistory.storeUpdateActorHistory(mockActor, change);

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});
	});

	describe('WHEN parameters are valid and no history exists THEN initializes and updates history with updateActor data', () =>
	{
		test('WHEN valid change and no history exists and Simple Calendar is not installed THEN initializes and updates history with updateActor data', () =>
		{
			mockSimpleCalendar(false);

			ActorHistory.storeUpdateActorHistory(mockActor, change);

			const expected = [
				{
					hook: 'updateActor',
					changes: {
						change: CHANGE_DATA
					},
					timestampIRL: new Date(DATE_TIMESTAMP_UTC)
				}
			];
			expect(findHistoryFromActor(mockActor))
				.toStrictEqual(expected);
		});

		test('WHEN valid change and no history exists THEN initializes and updates history with updateActor data', () =>
		{
			ActorHistory.storeUpdateActorHistory(mockActor, change);

			const expected = [
				{
					hook: 'updateActor',
					changes: {
						change: CHANGE_DATA
					},
					timestampIRL: new Date(DATE_TIMESTAMP_UTC),
					timestampInGame: SIMPLE_CALENDAR_TIMESTAMP_TO_DATE
				}
			];
			expect(findHistoryFromActor(mockActor))
				.toStrictEqual(expected);
		});

		test('WHEN valid change and no history exists THEN initializes and updates history with updateActor data correctly', () =>
		{
			mockTimestamp(12345);
			mockSimpleCalendar(true, 'Another SimpleCalendar time object');
			change.data = {
				additionalInfo: 'another test value'
			};

			ActorHistory.storeUpdateActorHistory(mockActor, change);

			const expected = [
				{
					hook: 'updateActor',
					changes: {
						change: change.data
					},
					timestampIRL: new Date(12345),
					timestampInGame: 'Another SimpleCalendar time object'
				}
			];

			expect(findHistoryFromActor(mockActor))
				.toStrictEqual(expected);
		});
	});

	test('WHEN valid change and history already exists THEN updates history with updateActor data', () =>
	{
		const firstHistoryElement = {something: 'something exists here already'};
		setHistoryOnActor(mockActor, [firstHistoryElement]);

		ActorHistory.storeUpdateActorHistory(mockActor, change);

		const expected = [
			firstHistoryElement,
			{
				hook: 'updateActor',
				changes: {
					change: CHANGE_DATA
				},
				timestampIRL: new Date(DATE_TIMESTAMP_UTC),
				timestampInGame: SIMPLE_CALENDAR_TIMESTAMP_TO_DATE
			}
		];
		expect(findHistoryFromActor(mockActor))
			.toStrictEqual(expected);
	});
});

describe('storeCreateItemHistory', () =>
{
	describe('WHEN parameters are invalid THEN does nothing', () =>
	{
		test('WHEN item.parent is undefined THEN does nothing', () =>
		{
			item.parent = undefined;

			ActorHistory.storeCreateItemHistory(item);

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});

		test('WHEN actor.type is not "character" THEN does nothing', () =>
		{
			mockActor.type = 'npc';

			ActorHistory.storeCreateItemHistory(item);

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});
	});

	describe('WHEN parameters are valid and no history exists THEN initializes and updates history with createItem data', () =>
	{
		test('WHEN valid item and no history exists and Simple Calendar is not installed THEN initializes and updates history with createItem data', () =>
		{
			mockSimpleCalendar(false);

			ActorHistory.storeCreateItemHistory(item);

			const expected = [
				{
					hook: 'createItem',
					changes: {
						item: ITEM_DATA
					},
					timestampIRL: new Date(DATE_TIMESTAMP_UTC)
				}
			];

			expect(findHistoryFromActor(mockActor))
				.toStrictEqual(expected);
		});

		test('WHEN valid item and no history exists THEN initializes and updates history with createItem data', () =>
		{
			ActorHistory.storeCreateItemHistory(item);

			const expected = [
				{
					hook: 'createItem',
					changes: {
						item: ITEM_DATA
					},
					timestampIRL: new Date(DATE_TIMESTAMP_UTC),
					timestampInGame: SIMPLE_CALENDAR_TIMESTAMP_TO_DATE
				}
			];

			expect(findHistoryFromActor(mockActor))
				.toStrictEqual(expected);
		});

		test('WHEN valid item and no history exists THEN initializes and updates history with createItem data correctly', () =>
		{
			mockTimestamp(12345);
			mockSimpleCalendar(true, 'Another SimpleCalendar time object');
			item.data = {
				someData: 'a data value'
			};

			ActorHistory.storeCreateItemHistory(item);

			const expected = [
				{
					hook: 'createItem',
					changes: {
						item: item.data
					},
					timestampIRL: new Date(12345),
					timestampInGame: 'Another SimpleCalendar time object'
				}
			];
			expect(findHistoryFromActor(mockActor))
				.toStrictEqual(expected);
		});
	});

	test('WHEN valid item and history already exists THEN updates history with createItem data', () =>
	{
		const firstHistoryElement = {something: 'something exists here already'};
		setHistoryOnActor(mockActor, [firstHistoryElement]);

		ActorHistory.storeCreateItemHistory(item);

		const expected = [
			firstHistoryElement,
			{
				hook: 'createItem',
				changes: {
					item: ITEM_DATA
				},
				timestampIRL: new Date(DATE_TIMESTAMP_UTC),
				timestampInGame: SIMPLE_CALENDAR_TIMESTAMP_TO_DATE
			}
		];
		expect(findHistoryFromActor(mockActor))
			.toStrictEqual(expected);
	});
});

describe('storeUpdateItemHistory', () =>
{
	describe('WHEN parameters are invalid THEN does nothing', () =>
	{
		test('WHEN item.parent is undefined THEN does nothing', () =>
		{
			item.parent = undefined;

			ActorHistory.storeUpdateItemHistory(item, change);

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});

		test('WHEN actor.type is not "character" THEN does nothing', () =>
		{
			mockActor.type = 'npc';

			ActorHistory.storeUpdateItemHistory(item, change);

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});

		test('WHEN undefined change THEN does nothing', () =>
		{
			ActorHistory.storeUpdateItemHistory(item);

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});

		test('WHEN invalid change THEN does nothing', () =>
		{
			ActorHistory.storeUpdateItemHistory(item, {});

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});

		test('WHEN undefined change data THEN does nothing', () =>
		{
			change.data = undefined;

			ActorHistory.storeUpdateItemHistory(item, change);

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});
	});

	describe('WHEN parameters are valid and no history exists THEN initializes and updates history with updateItem data', () =>
	{
		test('WHEN valid parameters and no history exists and Simple Calendar is not installed THEN initializes and updates history with updateItem data', () =>
		{
			mockSimpleCalendar(false);

			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, ITEM_DATA, CHANGE_DATA, DATE_TIMESTAMP_UTC);
		});

		test('WHEN only change is damage and no history exists THEN initializes and updates history with updateItem data', () =>
		{
			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, ITEM_DATA, CHANGE_DATA, DATE_TIMESTAMP_UTC, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE);
		});

		test('WHEN valid parameters and no history exists THEN initializes and updates history with updateItem data correctly', () =>
		{
			mockTimestamp(12345);
			mockSimpleCalendar(true, 'Another SimpleCalendar time object');
			item.data = {
				moreItemData: 'this is some more item data'
			}
			change.data = {
				additionalInfo: 'another test value'
			};

			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, item.data, change.data, 12345, 'Another SimpleCalendar time object');
		});
	});

	describe('WHEN changes are made and history exists THEN updates history with updateItem data', () =>
	{
		test('WHEN valid parameters and completely unrelated history exists THEN updates history with updateItem data', () =>
		{
			const firstHistoryElement = {something: 'something exists here already'};
			setHistoryOnActor(mockActor, [firstHistoryElement]);

			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, ITEM_DATA, CHANGE_DATA, DATE_TIMESTAMP_UTC, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE,
				[firstHistoryElement]);
		});

		test('WHEN valid parameters and unrelated similar history exists THEN updates history with updateItem data', () =>
		{
			const firstHistoryElement = buildUpdateItemHistory('A DIFFERENT ID', CLUB_DESCRIPTION, CLUB_DAMAGE, CLUB_DAMAGE_TYPE);
			setHistoryOnActor(mockActor, [firstHistoryElement]);

			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, ITEM_DATA, CHANGE_DATA, DATE_TIMESTAMP_UTC, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE,
				[firstHistoryElement]);
		});

		test('WHEN description is changed and item exists in history THEN updates history with updateItem data', () =>
		{
			const relatedHistory = buildUpdateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE, CLUB_DAMAGE_TYPE);
			setHistoryOnActor(mockActor, [relatedHistory]);
			change.data.description = '<p>A new description of a club, because clubs are fun!</p>';

			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, ITEM_DATA, change.data, DATE_TIMESTAMP_UTC, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE, [relatedHistory]);
		});

		test('WHEN description is changed and item update exists in history THEN updates history with updateItem data', () =>
		{
			const createItemHistory = buildCreateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE, CLUB_DAMAGE_TYPE);
			const relatedHistory = buildUpdateItemHistory(ITEM_ID, '<p>A new and improved description!</p>', CLUB_DAMAGE + ' + 1', CLUB_DAMAGE_TYPE);
			setHistoryOnActor(mockActor, [createItemHistory, relatedHistory]);
			change.data.description = '<p>A new description of a club, because clubs are fun!</p>';

			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, ITEM_DATA, change.data, DATE_TIMESTAMP_UTC, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE,
				[createItemHistory, relatedHistory]);
		});

		test('WHEN damage is changed THEN updates history', () =>
		{
			const createItemHistory = buildCreateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE, CLUB_DAMAGE_TYPE);
			const relatedHistory = buildUpdateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE + ' + 1', CLUB_DAMAGE_TYPE);
			setHistoryOnActor(mockActor, [createItemHistory, relatedHistory]);
			change.data.damage.parts[0] = CLUB_DAMAGE;

			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, ITEM_DATA, change.data, DATE_TIMESTAMP_UTC, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE,
				[createItemHistory, relatedHistory]);
		});

		test('WHEN damage type is changed THEN updates history', () =>
		{
			const createItemHistory = buildCreateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE, CLUB_DAMAGE_TYPE);
			const relatedHistory = buildUpdateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE, 'acid');
			setHistoryOnActor(mockActor, [createItemHistory, relatedHistory]);
			change.data.damage.parts[1] = CLUB_DAMAGE_TYPE;

			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, ITEM_DATA, change.data, DATE_TIMESTAMP_UTC, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE,
				[createItemHistory, relatedHistory]);
		});

		test('WHEN damage is changed and identical to old history but not most recent THEN updates history', () =>
		{
			const createItemHistory = buildCreateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE, CLUB_DAMAGE_TYPE);
			const oldRelatedHistory = buildUpdateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE + ' + 1', CLUB_DAMAGE_TYPE);
			const newRelatedHistory = buildUpdateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE + ' + 2', CLUB_DAMAGE_TYPE);
			setHistoryOnActor(mockActor, [createItemHistory, oldRelatedHistory, newRelatedHistory]);
			change.data.damage.parts[0] = CLUB_DAMAGE + ' + 1';

			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, ITEM_DATA, change.data, DATE_TIMESTAMP_UTC, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE,
				[createItemHistory, oldRelatedHistory, newRelatedHistory]);
		});

		test('WHEN damage is changed and identical to initial history but not most recent THEN updates history', () =>
		{
			const createItemHistory = buildCreateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE, CLUB_DAMAGE_TYPE);
			const oldRelatedHistory = buildUpdateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE + ' + 1', CLUB_DAMAGE_TYPE);
			const newRelatedHistory = buildUpdateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE + ' + 2', CLUB_DAMAGE_TYPE);
			setHistoryOnActor(mockActor, [createItemHistory, oldRelatedHistory, newRelatedHistory]);
			change.data.damage.parts[0] = CLUB_DAMAGE;

			ActorHistory.storeUpdateItemHistory(item, change);

			assertUpdateItemHistoryUpdatedOnActor(mockActor, ITEM_DATA, change.data, DATE_TIMESTAMP_UTC, SIMPLE_CALENDAR_TIMESTAMP_TO_DATE,
				[createItemHistory, oldRelatedHistory, newRelatedHistory]);
		});
	});

	describe('WHEN changes only include repetitive damage updates THEN does not update history', () =>
	{
		test('WHEN only change is damage, and that damage is identical to history THEN does not update history', () =>
		{
			const createItemHistory = buildCreateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE, CLUB_DAMAGE_TYPE);
			setHistoryOnActor(mockActor, [createItemHistory]);

			ActorHistory.storeUpdateItemHistory(item, change);

			expect(findHistoryFromActor(mockActor))
				.toStrictEqual([createItemHistory]);
		});

		test('WHEN only change is damage, and that damage is identical to most recent history for that item THEN does not update history', () =>
		{
			const createItemHistory = buildCreateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE, CLUB_DAMAGE_TYPE);
			const relatedHistory = buildUpdateItemHistory(ITEM_ID, CLUB_DESCRIPTION, CLUB_DAMAGE, 'acid');
			setHistoryOnActor(mockActor, [createItemHistory, relatedHistory]);
			change.data.damage.parts[1] = 'acid';

			ActorHistory.storeUpdateItemHistory(item, change);

			expect(findHistoryFromActor(mockActor))
				.toStrictEqual([createItemHistory, relatedHistory]);
		});
	});
});

describe('storeDeleteItemHistory', () =>
{
	describe('WHEN parameters are invalid THEN does nothing', () =>
	{
		test('WHEN item.parent is undefined THEN does nothing', () =>
		{
			item.parent = undefined;

			ActorHistory.storeDeleteItemHistory(item);

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});

		test('WHEN actor.type is not "character" THEN does nothing', () =>
		{
			mockActor.type = 'npc';

			ActorHistory.storeDeleteItemHistory(item);

			expect(findHistoryFromActor(mockActor))
				.toBeUndefined();
		});
	});

	describe('WHEN parameters are valid and no history exists THEN initializes and updates history with deleteItem data', () =>
	{
		test('WHEN valid item and no history exists and Simple Calendar is not installed THEN initializes and updates history with deleteItem data', () =>
		{
			mockSimpleCalendar(false);

			ActorHistory.storeDeleteItemHistory(item);

			const expected = [
				{
					hook: 'deleteItem',
					changes: {
						item: ITEM_DATA
					},
					timestampIRL: new Date(DATE_TIMESTAMP_UTC)
				}
			];

			expect(findHistoryFromActor(mockActor))
				.toStrictEqual(expected);
		});

		test('WHEN valid item and no history exists THEN initializes and updates history with deleteItem data', () =>
		{
			ActorHistory.storeDeleteItemHistory(item);

			const expected = [
				{
					hook: 'deleteItem',
					changes: {
						item: ITEM_DATA
					},
					timestampIRL: new Date(DATE_TIMESTAMP_UTC),
					timestampInGame: SIMPLE_CALENDAR_TIMESTAMP_TO_DATE
				}
			];

			expect(findHistoryFromActor(mockActor))
				.toStrictEqual(expected);
		});

		test('WHEN valid item and no history exists THEN initializes and updates history with deleteItem data correctly', () =>
		{
			mockTimestamp(12345);
			mockSimpleCalendar(true, 'Another SimpleCalendar time object');
			item.data = {
				someData: 'a data value'
			};

			ActorHistory.storeDeleteItemHistory(item);

			const expected = [
				{
					hook: 'deleteItem',
					changes: {
						item: item.data
					},
					timestampIRL: new Date(12345),
					timestampInGame: 'Another SimpleCalendar time object'
				}
			];
			expect(findHistoryFromActor(mockActor))
				.toStrictEqual(expected);
		});
	});

	test('WHEN valid item and history already exists THEN updates history with deleteItem data', () =>
	{
		const firstHistoryElement = {something: 'something exists here already'};
		setHistoryOnActor(mockActor, [firstHistoryElement]);

		ActorHistory.storeDeleteItemHistory(item);

		const expected = [
			firstHistoryElement,
			{
				hook: 'deleteItem',
				changes: {
					item: ITEM_DATA
				},
				timestampIRL: new Date(DATE_TIMESTAMP_UTC),
				timestampInGame: SIMPLE_CALENDAR_TIMESTAMP_TO_DATE
			}
		];
		expect(findHistoryFromActor(mockActor))
			.toStrictEqual(expected);
	});
});

function findHistoryFromActor(actor)
{
	return actor.getFlag('actor-history', 'history');
}

function setHistoryOnActor(actor, history)
{
	actor.setFlag('actor-history', 'history', history);
}

function buildCreateItemHistory(id, description, damage, damageType)
{
	return {
		hook: 'createItem',
		changes: {
			item: buildItemData(id, description, damage, damageType)
		},
		timestampIRL: new Date(DATE_TIMESTAMP_UTC),
		timestampInGame: SIMPLE_CALENDAR_TIMESTAMP_TO_DATE
	};
}

function buildUpdateItemHistory(id, description, damage, damageType)
{
	return {
		hook: 'updateItem',
		changes: {
			item: buildItemData(id, description, damage, damageType),
			change: {
				damage: {
					parts: [damage, damageType]
				}
			}
		},
		timestampIRL: new Date(DATE_TIMESTAMP_UTC),
		timestampInGame: SIMPLE_CALENDAR_TIMESTAMP_TO_DATE
	};
}

function buildItemData(id, description, damage, damageType)
{
	return {
		_id: id,
		data: {
			description: description,
			damage: {
				parts: [damage, damageType]
			}
		}
	};
}

function mockTimestamp(timestamp)
{
	dateUTCSpy = jest.spyOn(Date, 'UTC')
					 .mockImplementation(() => timestamp);
}

function mockSimpleCalendar(isInstalled, timestampToDateValue)
{
	game.modules.get.mockReturnValue({active: isInstalled});
	SimpleCalendar.api.timestampToDate.mockReturnValue(timestampToDateValue)
}

function assertUpdateItemHistoryUpdatedOnActor(actor, itemData, changeData, timestamp, simpleCalendarTimestamp, existingHistory)
{
	if (!existingHistory)
	{
		existingHistory = [];
	}

	let expectedAdditionalHistory = {
		hook: 'updateItem',
		changes: {
			item: itemData,
			change: changeData
		},
		timestampIRL: new Date(timestamp)
	};
	if (simpleCalendarTimestamp)
	{
		expectedAdditionalHistory.timestampInGame = simpleCalendarTimestamp;
	}
	existingHistory.push(expectedAdditionalHistory);

	expect(findHistoryFromActor(actor))
		.toStrictEqual(existingHistory);
}