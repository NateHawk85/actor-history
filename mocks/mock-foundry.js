global.Hooks = {
	on: jest.fn()
};

global.game = {
	modules: {
		get: jest.fn()
	}
}

global.SimpleCalendar = {
	api: {
		timestamp: jest.fn(),
		timestampToDate: jest.fn()
	}
}