import Result from "../src";

describe("ok result", () => {
	it("should be ok", () => {
		const result = Result.ok();

		expect(result.ok).toBe(true);
	});
});
