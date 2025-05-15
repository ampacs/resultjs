import Result from "../../src";

export interface IResult<T, E> extends Iterable<T extends Iterable<infer U> ? U : T>
{
	/**
	 * Returns `true` if the result is a {@link Result.Ok} and the contained value matches a predicate.
	 *
	 * @method isOkAnd
	 * @template U A more specific type that extends T, used with the type predicate overload
	 * @param {((value: T) => value is U) | ((value: T) => boolean)} fn A type predicate function that checks the contained value, if the result is a {@link Result.Ok}
	 * @returns {boolean} `true` if the result is {@link Result.Ok} and the contained value matches the predicate, or `false` otherwise
	 *
	 * @example
	 * ##### Examples with Ok result and regular predicate
	 *
	 * ```typescript
	 * const result = Result.ok(2);
	 * console.log(result.isOkAnd(value => value > 1)); // output: true
	 *
	 * const result = Result.ok(0);
	 * console.log(result.isOkAnd(value => value > 1)); // output: false
	 * ```
	 * @example
	 * ##### Example with Ok result and type predicate
	 *
	 * ```typescript
	 * const result: Result<unknown, never> = Result.ok(2);
	 *
	 * if (result.isOkAnd(value => typeof value === "number")) {
	 *   console.log(result.value.toFixed(2)); // output: "2.00"
	 * }
	 * ```
	 * @example
	 * ##### Example with Error result and type predicate
	 *
	 * ```typescript
	 * const result: Result<never, unknown> = Result.error("hey");
	 * console.log(result.isOkAnd(value => value > 1)); // output: false
	 * ```
	 */
	isOkAnd<U extends T>(fn: (value: T) => value is U): this is Result.Ok<U>;
	isOkAnd(fn: (value: T) => boolean): this is Result.Ok<T>;

	isErrorAnd<F extends E>(fn: (error: E) => error is F): this is Result.Error<F>;
	isErrorAnd(fn: (error: E) => boolean): this is Result.Error<E>;

	map<U>(fn: (value: T) => U): Result<U, E>;

	mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

	mapOrElse<U>(defaultValue: (err: E) => U, fn: (value: T) => U): U;

	mapErr<F>(fn: (err: E) => F): Result<T, F>;

	inspect(fn: (value: T) => void): this;

	inspectError(fn: (err: E) => void): this;

	values(): Generator<T extends Iterable<infer U> ? U : T>;

	forEach(fn: (value: T extends Iterable<infer U> ? U : T) => void): void;

	expect(msg: string): T;
	expect(fn: (err: E) => never): T;

	unwrap(): T;

	unwrapOr(defaultValue: T): T;

	unwrapOrElse(defaultValue: (err: E) => T): T;

	unwrapError(fn?: (value: T) => E): E;

	and<U>(result: Result<U, E>): this | Result<U, E>;

	andThen<U>(fn: (value: T) => Result<U, E>): this | Result<U, E>;

	or<F>(result: Result<T, F>): this | Result<T, F>;

	orElse<F>(fn: (err: E) => Result<T, F>): this | Result<T, F>;

	clone(): Result<T, E>;

	flatten(): T extends Result<unknown> ? T : this;
}

export interface IResultAsync<T, E>
{
	mapAsync<U, F>(fn: (value: T) => Result.Promise<U, F>): Result.Promise<never, E> | Result.Promise<U, F>;
	mapAsync<U>(fn: (value: T) => PromiseLike<U>): Result.Promise<never, E> | Result.Promise<U>;

	mapOrElseAsync<U, F, P extends Result.Promise<U, F>>(defaultValue: (err: E) => P, fn: (value: T) => P): P;
	mapOrElseAsync<U, P extends PromiseLike<U>>(defaultValue: (err: E) => P, fn: (value: T) => P): Result.Promise<U>;

	andThenAsync<U, P extends Result.Promise<U, E>>(fn: (value: T) => P): P;
	andThenAsync<U>(fn: (value: T) => PromiseLike<Result<U, E>>): Result.Promise<U, E>;

	orElseAsync<F, P extends Result.Promise<T, F>>(fn: (err: E) => P): P;
	orElseAsync<F>(fn: (err: E) => PromiseLike<Result<T, F>>): Result.Promise<T, F>;
}
