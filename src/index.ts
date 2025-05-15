import { and, error, flatten, from, is, isError, isOk, ok, or } from "./functions";
import { ErrorResult } from "./impls/error";
import { OkResult } from "./impls/ok";
import { ResultPromise } from "./impls/promise";

export const Result = {
	Promise: ResultPromise,
	Ok: OkResult,
	Error: ErrorResult,

	/**
	 * Creates variant of a {@link Result<T>} representing success and (usually) containing a value.
	 *
	 * @see {@link ok}
	 */
	ok,
	/**
	 * Creates variant of a {@link Result<T>} representing failure or error, and containing an error value.
	 *
	 * @see {@link error}
	 */
	error,
	/**
	 * Executes a function and wraps its result in a {@link Result}.
	 * If the function executes successfully, the result is wrapped in a {@link Result.Ok}.
	 * If the function throws an error, the error is wrapped in a {@link Result.Error}.
	 *
	 * @see {@link from}
	 */
	from,
	/**
	 * Type guard that checks if a value is a {@link Result}.
	 *
	 * @see {@link is}
	 */
	is,
	/**
	 * Type guard that checks if a result is a {@link Result.Ok}.
	 *
	 * @see {@link isOk}
	 */
	isOk,
	/**
	 * Type guard that checks if a result is a {@link Result.Error}.
	 *
	 * @see {@link isError}
	 */
	isError,
	/**
	 * Returns the first {@link Result.Error} or, if there are none,
 	 * returns the last {@link Result.Ok} in the array.
	 *
	 * If the array is empty, a {@link Result.Ok} with no value is returned.
	 *
	 * @see {@link and}
	 */
	and,
	/**
	 * Returns the first {@link Result.Ok} or, if none are found,
	 * returns the last {@link Result.Error} in the array.
	 *
	 * If the array is empty, a {@link Result.Ok} with no value is returned.
	 *
	 * @see {@link or}
	 */
	or,
	/**
	 * Flattens a nested {@link Result}, converting it from {@link Result<Result<T, F>, E>} to {@link Result<T, E | F>}.
	 *
	 * If the outer result is a {@link Result.Ok}, returns the inner result.
	 * Otherwise, returns the outer result.
	 *
	 * @see {@link flatten}
	 */
	flatten
} as const;

export namespace Result
{
	export type Promise<T=void, E=unknown> = ResultPromise<T, E>;
	export type Ok<T=void> = OkResult<T>;
	export type Error<E=unknown> = ErrorResult<E>;
}

/**
 * {@link Result} is a type that is used for operations that can fail,
 * allowing returning and propagating errors in a structured manner.
 *
 * It has two variants, a {@link Result.Ok}, representing success and (usually) containing a value,
 * and a {@link Result.Error}, representing failure and containing an error value.
 *
 * Functions and methods return a {@link Result} when errors are expected and recoverable.
 *
 * @template T The type of the success value (defaults to `void`)
 * @template E The type of the error value (defaults to `unknown`)
 *
 * @example
 * ```typescript
 * function divide(dividend: number, divisor: number): Result<number, string>
 * {
 *   if (divisor === 0)
 *   {
 *     return Result.error("division by zero");
 *   }
 *
 *   return Result.ok(dividend / divisor);
 * }
 *
 * const successResult = divide(10, 2);  // Result.ok(5)
 * const failureResult = divide(10, 0);  // Result.error("division by zero")
 * ```
 */
export type Result<T=void, E=unknown> = Result.Ok<T> | Result.Error<E>;

export default Result;
