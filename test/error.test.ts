import Result from "../src";

describe("error result", () => {
	it("should not be ok", () => {
		const result = Result.error(undefined);

		expect(result.ok).toBe(false);
	});
});
