export default class MockActor
{
	constructor(type)
	{
		this.flags = new Map();
		this.type = type;
	}

	getFlag(scope, key)
	{
		const scopeMap = this.flags[scope];
		return scopeMap ? scopeMap[key] : undefined;
	}

	setFlag(scope, key, value)
	{
		if (!this.flags[scope])
		{
			this.flags[scope] = new Map();
		}
		this.flags[scope][key] = value;
	}
}