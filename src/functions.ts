import type Result from ".";
import { ErrorResult } from "./impls/error";
import { OkResult } from "./impls/ok";

/**
 * Creates variant of a {@link Result<T>} representing success and (usually) containing a value.
 *
 * @function ok
 * @template T The type of the value to contain. Defaults to `void` if no value is given.
 * @param {T} [value] The value to contain. If not provided, a {@link Result.Ok<void>} with no value is returned.
 * @returns {Result.Ok<T>} A {@link Result.Ok<T>} containing the value, if any was given.
 *
 * @example
 * ```typescript
 * const emptyResult = Result.ok();
 *
 * if (emptyResult.ok)
 * {
 *   console.log("Success with no value"); // output: "Success with no value"
 * }
 *
 * const successResult = Result.ok(42);
 *
 * if (successResult.ok)
 * {
 *   console.log("Success:", successResult.value); // output: "Success: 42"
 * }
 * ```
 */
export function ok(): Result.Ok;
export function ok<T>(value: T): Result.Ok<T>;
export function ok<T>(value?: T): Result.Ok<T> {
	return new OkResult(value as T);
}

/**
 * Creates variant of a {@link Result<T>} representing failure or error, and containing an error value.
 *
 * @function error
 * @template E The type of the error value to contain.
 * @param {E} err The error value to contain.
 * @returns {Result.Error<E>} A {@link Result.Error<E>} containing the error value.
 *
 * @example
 * ```typescript
 * const errorResult = Result.error("something went wrong");
 *
 * if (!errorResult.ok)
 * {
 *   console.error("Error:", errorResult.error); // output: "Error: something went wrong"
 * }
 * ```
 */
export function error<E>(err: E): Result.Error<E> {
	return new ErrorResult(err);
}

/**
 * Executes a function and wraps its result in a {@link Result}.
 * If the function executes successfully, the result is wrapped in a {@link Result.Ok}.
 * If the function throws an error, the error is wrapped in a {@link Result.Error}.
 *
 * @function from
 * @template F The type of the function to be executed.
 * @param {F} fn The function to execute.
 * @param {Parameters<F>} [args] The arguments to pass to the function.
 * @returns {Result<ReturnType<F>, unknown>} A {@link Result} containing either the function's return value or the caught error.
 *
 * @example
 * ```typescript
 * function divide(dividend: number, divisor: number): number
 * {
 *   if (divisor === 0)
 *   {
 *     throw new Error('division by zero');
 *   }
 *
 *   return dividend / divisor;
 * }
 *
 * const successResult = Result.from(divide, 10, 2);
 * if (successResult.ok)
 * {
 *   console.log('Success:', successResult.value); // output: "Success: 5"
 * }
 *
 * const errorResult = Result.from(divide, 10, 0);
 * if (!errorResult.ok)
 * {
 *   console.error('Error:', errorResult.error); // output: "Error: division by zero"
 * }
 * ```
 */
export function from<F extends(...parameters: Parameters<F>) => ReturnType<F>>(fn: F, ...args: Parameters<F>): Result<ReturnType<F>> {
	try {
		const result = fn(...args);

		return new OkResult(result);
	} catch (err: unknown) {
		return new ErrorResult(err);
	}
}

/**
 * Type guard that checks if a value is a {@link Result}.
 *
 * @function is
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param {unknown} result The value to check.
 * @returns {boolean} `true` if the value is a {@link Result}, `false` otherwise.
 *
 * @example
 * ```typescript
 * const successResult = Result.ok(42);
 * const errorResult = Result.error("something went wrong");
 * const notResult = { ok: true, value: 42 };
 *
 * console.log(Result.is(successResult)); // output: true
 * console.log(Result.is(errorResult)); // output: true
 * console.log(Result.is(notResult)); // output: false
 *
 * // use with type narrowing
 * if (Result.is<number, string>(result))
 * {
 *   if (value.ok)
 *   {
 *     console.log("Value:", value.value);
 *   }
 *   else
 *   {
 *     console.log("Error:", value.error);
 *   }
 * }
 * ```
 */
export function is<T = unknown, E = unknown>(result: unknown): result is Result<T, E> {
	return result instanceof OkResult || result instanceof ErrorResult;
}

/**
 * Type guard that checks if a result is a {@link Result.Ok}.
 *
 * @function isOk
 * @template T The type of the success value.
 * @param {Result<T, unknown>} result The result to check.
 * @returns {boolean} `true` if the result is in {@link Result.Ok}, `false` otherwise.
 *
 * @example
 * ```typescript
 * const successResult = Result.ok(42);
 * const errorResult = Result.error("Something went wrong");
 *
 * if (Result.isOk(successResult))
 * {
 *   console.log("Value:", successResult.value); // output: "Value: 42"
 * }
 *
 * console.log(Result.isOk(errorResult)); // output: false
 * ```
 */
export function isOk<T>(result: Result<T>): result is Result.Ok<T> {
	return result.ok;
}

/**
 * Type guard that checks if a result is a {@link Result.Error}.
 *
 * @function isError
 * @template E The type of the error value.
 * @param {Result<unknown, E>} result The result to check.
 * @returns {boolean} `true` if the result is {@link Result.Error}, `false` otherwise.
 *
 * @example
 * ```typescript
 * const successResult = Result.ok(42);
 * const errorResult = Result.error("something went wrong");
 *
 * if (Result.isError(errorResult))
 * {
 *   console.log("Error:", errorResult.error); // output: "Error: Something went wrong"
 * }
 *
 * console.log(Result.isError(successResult)); // output: false
 * ```
 */
export function isError<E>(result: Result<unknown, E>): result is Result.Error<E> {
	return !result.ok;
}

/**
 * Returns the first {@link Result.Error} or, if there are none,
 * returns the last {@link Result.Ok} in the array.
 *
 * If the array is empty, a {@link Result.Ok} with no value is returned.
 *
 * @function and
 * @template T Union of the types of each {@link Result} in the array.
 * @param {T} results The array of {@link Result}.
 * @returns {T[number]} The first {@link Result.Error}, or the last {@link Result.Ok}.
 *
 * @example
 * ```typescript
 * const result1 = Result.ok(42);
 * const result2 = Result.ok("hello");
 * const result3 = Result.ok(true);
 *
 * const oks = Result.and([result1, result2, result3]);
 * if (oks.ok)
 * {
 *   console.log(oks.value); // output: true
 * }
 *
 * const errorResult = Result.error("something went wrong");
 *
 * const mixed = Result.and([result1, errorResult, result3]);
 * if (!mixed.ok)
 * {
 *   console.log(mixed.error); // output: "something went wrong"
 * }
 *
 * const empty = Result.and([]);
 * console.log(empty.ok); // output: true
 * ```
 */
export function and(results: []): Result.Ok;
export function and<T extends readonly Result<unknown>[]>(results: T): T[number];
export function and<T extends readonly Result<unknown>[]>(results: T): T[number] {
	if (results.length === 0) {
		return ok();
	}

	for (const result of results) {
		if (!result.ok) {
			return result;
		}
	}

	return results[results.length - 1];
}

/**
 * Returns the first {@link Result.Ok} or, if none are found,
 * returns the last {@link Result.Error} in the array.
 *
 * If the array is empty, a {@link Result.Ok} with no value is returned.
 *
 * @function or
 * @template T Union of the types of each {@link Result} in the array.
 * @param {T} results The array of {@link Result}.
 * @returns {T[number]} The first {@link Result.Ok}, or the last {@link Result.Error}.
 *
 * @example
 * ```typescript
 * const result1 = Result.error("Error 1");
 * const result2 = Result.ok(42);
 * const result3 = Result.ok("hello");
 *
 * const mixed = Result.or([result1, result2, result3]);
 * if (mixed.ok) {
 *   console.log(mixed.value); // output: 42
 * }
 *
 * const error1 = Result.error("Error 1");
 * const error2 = Result.error("Error 2");
 *
 * // all results are errors, so the last one is returned
 * const allError = Result.or([error1, error2]);
 * if (!allError.ok) {
 *   console.log(allError.error); // output: "Error 2"
 * }
 *
 * // empty array returns Result.Ok<void>
 * const empty = Result.or([]);
 * console.log(empty.ok); // output: true
 * ```
 */
export function or(results: []): Result.Ok;
export function or<T extends readonly Result<unknown>[]>(results: T): T[number];
export function or<T extends readonly Result<unknown>[]>(results: T): T[number] {
	if (results.length === 0) {
		return ok();
	}

	for (const result of results) {
		if (result.ok) {
			return result;
		}
	}

	return results[results.length - 1];
}

/**
 * Flattens a nested {@link Result}, converting it from {@link Result<Result<T, F>, E>} to {@link Result<T, E | F>}.
 *
 * If the outer result is a {@link Result.Ok}, returns the inner result.
 * Otherwise, returns the outer result.
 *
 * @function flatten
 * @template T The type of the success value of the inner result.
 * @template E The type of the error value of the outer result.
 * @template F The type of the error value of the inner result.
 * @param {Result<Result<T, F>, E>} result The nested result to flatten.
 * @returns {Result<T, E | F>} The flattened result.
 *
 * @example
 * ```typescript
 * const nestedOk = Result.ok(Result.ok(42));
 * const flattenedOk = Result.flatten(nestedOk);
 * if (flattenedOk.ok)
 * {
 *   console.log(flattenedOk.value); // output: 42
 * }
 *
 * const innerError = Result.ok(Result.error("inner error"));
 * const flattenedInnerError = Result.flatten(innerError);
 * if (!flattenedInnerError.ok)
 * {
 *   console.log(flattenedInnerError.error); // output: "inner error"
 * }
 *
 * const outerError = Result.error("outer error");
 * const flattenedOuterError = Result.flatten(outerError);
 * if (!flattenedOuterError.ok)
 * {
 *   console.log(flattenedOuterError.error); // output: "outer error"
 * }
 *
 * // useful for chaining operations that return a Result
 * function fetchUser(id: string): Result<User, string> { ... }
 * function getUserPosts(user: User): Result<Post[], string> { ... }
 *
 * const userResult = fetchUser( ... );
 *
 * const postsResult = userResult.map(user => getUserPosts(user));
 * // postsResult is Result<Result<Post[], string>, string>
 *
 * const flattenedPostsResult = Result.flatten(postsResult);
 * // flattenedPostsResult is Result<Post[], string>
 * ```
 */
export function flatten<T, E, F>(result: Result<Result<T, F>, E>): Result<T, E | F> {
	if (result.ok) {
		return result.value;
	}

	return result;
}
