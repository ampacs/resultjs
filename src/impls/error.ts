import Result from "index";
import { IResult, IResultAsync } from "../internal/contracts";
import { ResultError } from "../internal/types";
import { OkResult } from "./ok";
import { ResultPromise } from "./promise";

/**
 * A variant of a {@link Result} that contains an error value, accessible through the {@link error} field.
 *
 * Its {@link ok} field is always false.
 *
 * @class {@link Result.Error}
 */
export class ErrorResult<E=unknown> implements ResultError<E>, IResult<unknown, E>, IResultAsync<unknown, E> {
	public readonly ok: false = false;

	public readonly error: E;

	public constructor(error: E) {
		this.error = error;
	}

	public [Symbol.iterator](): Iterator<never, unknown, undefined> {
		return {
			next: () => ({ done: true, value: undefined })
		};
	}

	public isOkAnd(): this is OkResult<never> {
		return false;
	}

	public isErrorAnd<F extends E>(fn: (error: E) => error is F): this is ErrorResult<F>
	public isErrorAnd(fn: (error: E) => boolean): this is ErrorResult<E>
	public isErrorAnd(fn: (error: E) => boolean): boolean {
		return fn(this.error);
	}

	public map(): this {
		return this;
	}

	public mapAsync(): ResultPromise<never, E> {
		return ResultPromise.error(this.error);
	}

	public mapOr<T>(defaultValue: T): T {
		return defaultValue;
	}

	public mapOrElse<T>(defaultValue: (error: E) => T): T {
		return defaultValue(this.error);
	}

	public mapOrElseAsync<U, F, P extends Result.Promise<U, F>>(defaultValue: (error: E) => P): P;
	public mapOrElseAsync<U>(defaultValue: (error: E) => PromiseLike<U>): Result.Promise<U>;
	public mapOrElseAsync<U>(defaultValue: (error: E) => PromiseLike<U>): Result.Promise<U> {
		const promise = defaultValue(this.error);

		return promise instanceof Result.Promise
			? promise
			: new Result.Promise<U>((resolve, _, catcher) =>
				void promise.then(resolve, catcher));
	}

	public mapErr<F>(fn: (error: E) => F): Result.Error<F> {
		return new Result.Error(fn(this.error));
	}

	public inspect(): this {
		return this;
	}

	public inspectError(fn: (error: E) => void): this {
		fn(this.error);

		return this;
	}

	// eslint-disable-next-line require-yield
	public *values(): Generator<never, unknown, unknown> {
		return; // nothing to iterate in an error result
	}

	public forEach(): void {
		return;
	}

	public expect(msg: string): never;
	public expect(fn: (error: E) => unknown): never;
	public expect(msgOrFn: string | ((error: E) => unknown)): never {
		if (typeof msgOrFn === "string") {
			throw new Error(msgOrFn + ": " + this.error);
		}

		throw msgOrFn(this.error);
	}

	public unwrap(): never {
		throw this.error;
	}

	public unwrapOr<T>(defaultValue: T): T {
		return defaultValue;
	}

	public unwrapOrElse<T>(defaultValue: (error: E) => T): T {
		return defaultValue(this.error);
	}

	public unwrapError(): E {
		return this.error;
	}

	public and(): this {
		return this;
	}

	public andThen(): this {
		return this;
	}

	public andThenAsync(): Result.Promise<never, E> {
		return Result.Promise.error(this.error);
	}

	public or<F, R extends Result<unknown, F>>(result: R): R {
		return result;
	}

	public orElse<F, R extends Result<unknown, F>>(fn: (error: E) => R): R {
		return fn(this.error);
	}

	public orElseAsync<T, F, P extends Result.Promise<T, F>>(fn: (error: E) => P): P;
	public orElseAsync<T, F>(fn: (error: E) => PromiseLike<Result<T, F>>): Result.Promise<T, F>;
	public orElseAsync<T, F>(fn: (error: E) => PromiseLike<Result<T, F>>): Result.Promise<T> {
		const promise = fn(this.error);

		return promise instanceof Result.Promise
			? promise
			: new Result.Promise((resolve, reject, catcher) =>
				void promise.then(
					value => value.ok
						? resolve(value.value)
						: reject(value.error),
					catcher
				));
	}

	public clone(): Result.Error<E> {
		return new Result.Error(this.error);
	}

	public flatten(): this {
		return this;
	}
}
