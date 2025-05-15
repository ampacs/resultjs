import Result from "index";
import { IResult, IResultAsync } from "../internal/contracts";
import { isIterable } from "../internal/helpers";
import { ResultValue } from "../internal/types";
import { ErrorResult } from "./error";
import { ResultPromise } from "./promise";

/**
 * A variant of a {@link Result} that contains a success value, accessible through the {@link value} field.
 *
 * Its {@link ok} field is always true.
 *
 * @class {@link OkResult}
 */
export class OkResult<T=void> implements ResultValue<T>, IResult<T, unknown>, IResultAsync<T, unknown> {
	public readonly ok: true = true;

	public readonly value: T;

	public constructor(value: T) {
		this.value = value;
	}

	public [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : T> {
		// if value is an iterable, return its iterator
		if (isIterable<T extends Iterable<infer U> ? U : never>(this.value)) {
			return this.value[Symbol.iterator]();
		}

		// else, return value as a single-element iterator
		let done = false;

		return {
			next: (): IteratorResult<T, undefined> => {
				if (done) {
					return { done: true, value: undefined };
				}

				done = true;

				return { done: false, value: this.value };
			}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} as Iterator<T extends Iterable<infer U> ? never : T, unknown, undefined>;
	}

	public isOkAnd<U extends T>(fn: (value: T) => value is U): this is OkResult<U>
	public isOkAnd(fn: (value: T) => boolean): this is OkResult<T>
	public isOkAnd(fn: (value: T) => boolean): boolean {
		return fn(this.value);
	}

	public isErrorAnd(): this is ErrorResult<never> {
		return false;
	}

	public map<U>(fn: (value: T) => U): OkResult<U> {
		return new OkResult(fn(this.value));
	}

	public mapAsync<U, F, P extends ResultPromise<U, F>>(fn: (value: T) => P): P;
	public mapAsync<U>(fn: (value: T) => PromiseLike<U>): ResultPromise<U>;
	public mapAsync<U>(fn: (value: T) => PromiseLike<U>): ResultPromise<U> {
		const promise = fn(this.value);

		return promise instanceof ResultPromise
			? promise
			: new ResultPromise<U, unknown>((resolve, _, catcher) =>
				void promise.then(resolve, catcher));
	}

	public mapOr<U>(_: never, fn: (value: T) => U): U {
		return fn(this.value);
	}

	public mapOrElse<U>(_: never, fn: (value: T) => U): U {
		return fn(this.value);
	}

	public mapOrElseAsync<U, F, P extends ResultPromise<U, F>>(_: never, fn: (value: T) => P): P;
	public mapOrElseAsync<U>(_: never, fn: (value: T) => PromiseLike<U>): ResultPromise<U>;
	public mapOrElseAsync<U>(_: never, fn: (value: T) => PromiseLike<U>): ResultPromise<U> {
		const promise = fn(this.value);

		return promise instanceof ResultPromise
			? promise
			: new ResultPromise<U, unknown>((resolve, _, catcher) =>
				void promise.then(resolve, catcher));
	}

	public mapErr(): this {
		return this;
	}

	public inspect(fn: (value: T) => void): this {
		fn(this.value);

		return this;
	}

	public inspectError(): this {
		return this;
	}

	public *values(): Generator<T extends Iterable<infer U> ? U : T> {
		if (isIterable(this.value)) {
			return this.value[Symbol.iterator]();
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		yield this.value as T extends Iterable<infer U> ? never : T;
	}

	public forEach(fn: (value: T extends Iterable<infer U> ? U : T) => void): void {
		if (isIterable<T extends Iterable<infer U> ? U : never>(this.value)) {
			for (const value of this.value) {
				fn(value);
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			fn(this.value as T extends Iterable<infer U> ? never : T);
		}
	}

	public expect(): T {
		return this.value;
	}

	public unwrap(): T {
		return this.value;
	}

	public unwrapOr(): T {
		return this.value;
	}

	public unwrapOrElse(): T {
		return this.value;
	}

	public unwrapError(fn?: (value: T) => unknown): never {
		if (fn) {
			throw fn(this.value);
		}

		throw this.value;
	}

	public and<U, R extends Result<U>>(result: R): R {
		return result;
	}

	public andThen<U, R extends Result<U>>(fn: (value: T) => R): R {
		return fn(this.value);
	}

	public andThenAsync<U, P extends ResultPromise<U>>(fn: (value: T) => P): P;
	public andThenAsync<U, E>(fn: (value: T) => PromiseLike<Result<U, E>>): ResultPromise<U, E>;
	public andThenAsync<U>(fn: (value: T) => PromiseLike<Result<U>>): ResultPromise<U> {
		const promise = fn(this.value);

		return promise instanceof ResultPromise
			? promise
			: new ResultPromise<U, unknown>((resolve, reject, catcher) =>
				void promise.then(
					value => value.ok
						? resolve(value.value)
						: reject(value.error),
					catcher
				));
	}

	public or(): this {
		return this;
	}

	public orElse(): this {
		return this;
	}

	public orElseAsync(): ResultPromise<T> {
		return new ResultPromise(resolve => resolve(this.value));
	}

	public clone(): OkResult<T> {
		return new OkResult(this.value);
	}

	public flatten(): T extends Result<unknown> ? T : this {
		return Result.is(this.value)
			? this.value as T extends Result<unknown> ? T : never
			: this as T extends Result<unknown> ? never : this;
	}
}
