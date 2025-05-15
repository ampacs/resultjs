import Result from "../src";

describe("result promise", () => {
	it("should resolve to an ok", async() => {
		const promise = Result.Promise.ok();

		const result: Result<void, never> = await promise;

		expect(result.ok).toBe(true);
	});
	it("should resolve to an error", async() => {
		const promise = Result.Promise.error(undefined);

		const result: Result<never, undefined> = await promise;

		expect(result.ok).toBe(false);
	});
	it("should throw in then", async() => {
		const promise = Result.Promise.error(undefined);

		const fn = jest.fn();

		const result = await promise.then(result => {
			if (!result.ok) {
				throw new Error("failure");
			}
		}).catch(reason => {
			expect(reason).toBeInstanceOf(Error);
			expect((reason as Error).message).toBe("failure");

			fn();
		});

		expect(result.ok).toBe(false);
		expect(fn).toHaveBeenCalled();
	});
});
