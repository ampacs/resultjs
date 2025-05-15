import Result from "..";
import { isThenable } from "../internal/helpers";

export class ResultPromise<T=void, E=unknown> extends Promise<Result<T, E>> {
	public static ok(): Result.Promise<void, never>;
	public static ok<T>(value: T): Result.Promise<T, never>;
	public static ok<T>(value?: T): Result.Promise<T | void, never> {
		return new Result.Promise(resolve => resolve(value));
	}

	public static error<E>(error: E): Result.Promise<never, E> {
		return new Result.Promise((_, reject) => reject(error));
	}

	public static from<F extends (...parameters: Parameters<F>) => PromiseLike<ReturnType<F>>>(fn: F, ...args: Parameters<F>): Result.Promise<Awaited<ReturnType<F>>>;
	public static from<T>(promise: PromiseLike<T>): Result.Promise<T>;
	public static from<T, F extends(...parameters: Parameters<F>) => PromiseLike<ReturnType<F>>>(functionOrPromise: F | PromiseLike<T>, ...args: Parameters<F>): Result.Promise<T | ReturnType<F>> {
		const promise = functionOrPromise instanceof Function
			? functionOrPromise(...args)
			: functionOrPromise;

		return new Result.Promise((resolve, reject) =>
			void promise.then(resolve, reject));
	}

	public constructor(
		executor: (
			resolve: (value: T) => void,
			reject: (error: E) => void,
			catcher: (reason: unknown) => void
		) => void
	) {
		super((resolve, reject) => executor(
			value => resolve(new Result.Ok(value)),
			error => resolve(new Result.Error(error)),
			reject
		));
	}

	public override then(onresult?: null, onthrow?: null): Result.Promise<T, E>
	public override then<U = T, F = E>(onresult: (value: Result<T, E>) => Result<U, F> | Result.Promise<U, F>, onthrow?: null): Result.Promise<U, F>
	public override then<U = Result<T, E>>(onresult: (value: Result<T, E>) => U | PromiseLike<U>, onthrow?: null): Result.Promise<U>
	public override then<U = T, F = E>(onresult: null | undefined, onthrow: (reason: unknown) => Result<U, F> | Result.Promise<U, F>): Result.Promise<T | U, F>
	public override then<U = void>(onresult: null | undefined, onthrow: (reason: unknown) => U | PromiseLike<U>): Result.Promise<T | U>
	public override then<U = T, F = E, V = T, G = E>(onresult: (value: Result<T, E>) => Result<U, F> | Result.Promise<U, F>, onthrow: (reason: unknown) => Result<V, G> | Result.Promise<V, G>): Result.Promise<U, F> | Result.Promise<V, G>
	public override then<U = Result<T, E>, F = void>(onresult: U extends PromiseLike<unknown> ? never : (value: Result<T, E>) => U, onthrow: F extends PromiseLike<unknown> ? never : (reason: unknown) => F): Result.Promise<U | F, never>
	public override then<U = Result<T, E>, F = void>(onresult: (value: Result<T, E>) => PromiseLike<U>, onthrow: (reason: unknown) => PromiseLike<F>): Result.Promise<U | F>
	public override then<U = T, F = E, V = T, G = E>(
		onresult?: ((value: Result<T, E>) => U | Result<U, F> | Result.Promise<U, F> | PromiseLike<U>) | null,
		onthrow?: ((reason: unknown) => V | Result<V, G> | Result.Promise<V, G> | PromiseLike<V>) | null
	): Result.Promise<T | U | V> {
		return new Result.Promise((resolve, reject, catcher) =>
			void super.then(
				result => {
					if (!onresult) {
						return result.ok
							? resolve(result.value)
							: reject(result.error);
					}

					let value: ReturnType<typeof onresult>;
					try {
						value = onresult(result);
					} catch (error: unknown) {
						return catcher(error);
					}

					handleValueResolution(value, resolve, reject, catcher);
				},
				onthrow
					? reason => {
						let value: ReturnType<typeof onthrow>;
						try {
							value = onthrow(reason);
						} catch (reason: unknown) {
							return catcher(reason);
						}

						handleValueResolution(value, resolve, reject, catcher);
					}
					: catcher
			));
	}

	public override catch(onthrow?: null): this
	public override catch<U = T, F = E>(onthrow: (reason: unknown) => Result<U, F> | Result.Promise<U, F>): Result.Promise<T | U, F>
	public override catch<U = void>(onthrow: (reason: unknown) => U | PromiseLike<U>): Result.Promise<T, E> | Result.Promise<U>
	public override catch<U, F>(onthrow?: ((reason: unknown) => U | Result<U, F> | PromiseLike<U> | Result.Promise<U, F>) | null): Result.Promise<T | U> {
		if (!onthrow) {
			return this;
		}

		return new Result.Promise((resolve, reject, catcher) =>
			void super.catch(reason => {
				let value: ReturnType<typeof onthrow>;
				try {
					value = onthrow(reason);
				} catch (reason: unknown) {
					return catcher(reason);
				}

				handleValueResolution(value, resolve, reject, catcher);
			}));
	}

	public map<U>(fn: (value: T) => Result<U, E> | Result.Promise<U, E>): Result.Promise<U, E>;
	public map<U>(fn: (value: T) => U | PromiseLike<U>): Result.Promise<U, never>;
	public map<U>(fn: (value: T) => U | Result<U, E> | Result.Promise<U, E> | PromiseLike<U>): Result.Promise<U> {
		return new Result.Promise((resolve, reject, catcher) =>
			void this.then(result => {
				if (!result.ok) {
					return reject(result.error);
				}

				const value = fn(result.value);

				handleValueResolution(value, resolve, reject, catcher);
			}));
	}

	public mapOrElse<U, F>(defaultValue: (err: E) => Result<U, F> | Result.Promise<U, F>, fn: (value: T) => Result<U, F> | Result.Promise<U, F>): Result.Promise<U, F>;
	public mapOrElse<U, F>(defaultValue: (err: E) => U | Result<U, F> | Result.Promise<U, F> | PromiseLike<U>, fn: (value: T) => U | Result<U, F> | Result.Promise<U, F> | PromiseLike<U>): Result.Promise<U, F>;
	public mapOrElse<U>(defaultValue: (err: E) => U | PromiseLike<U>, fn: (value: T) => U | PromiseLike<U>): Result.Promise<U, never>;
	public mapOrElse<U, F>(
		defaultValue: (err: E) => U | Result<U, F> | Result.Promise<U, F> | PromiseLike<U>,
		fn: (value: T) => U | Result<U, F> | Result.Promise<U, F> | PromiseLike<U>
	): Result.Promise<U> {
		return new Result.Promise((resolve, reject, catcher) =>
			void this.then(result => {
				const value = result.ok
					? fn(result.value)
					: defaultValue(result.error);

				handleValueResolution(value, resolve, reject, catcher);
			}));
	}

	public andThen<U>(fn: (value: T) => Result<U, E> | Result.Promise<U, E>): Result.Promise<U, E>;
	public andThen<U>(fn: (value: T) => U | PromiseLike<U>): Result.Promise<U, never>;
	public andThen<U>(fn: (value: T) => U | Result<U, E> | Result.Promise<U, E> | PromiseLike<U>): Result.Promise<U> {
		return new Result.Promise((resolve, reject, catcher) =>
			void this.then(result => {
				if (!result.ok) {
					return reject(result.error);
				}

				const value = fn(result.value);

				handleValueResolution(value, resolve, reject, catcher);
			}));
	}

	public orElse<F>(fn: (err: E) => Result<T, F> | Result.Promise<T, F>): Result.Promise<T, F>;
	public orElse(fn: (err: E) => T | PromiseLike<T>): Result.Promise<T>;
	public orElse<F>(fn: (err: E) => T | Result<T, F> | Result.Promise<T, F> | PromiseLike<T>): Result.Promise<T> {
		return new Result.Promise((resolve, reject, catcher) =>
			void this.then(result => {
				if (result.ok) {
					return resolve(result.value);
				}

				const value = fn(result.error);

				handleValueResolution(value, resolve, reject, catcher);
			}));
	}
}

function handleValueResolution<T, E>(
	value: T | Result<T, E> | Result.Promise<T, E> | PromiseLike<T>,
	resolver: (value: T) => void,
	rejecter: (error: E) => void,
	catcher: (reason: unknown) => void
): void {
	if (isThenable(value)) {
		return value instanceof Result.Promise
			? void value.then(
				result => result.ok
					? resolver(result.value)
					: rejecter(result.error),
				catcher
			)
			: void value.then(resolver, catcher);
	}

	if (Result.is(value)) {
		return value.ok
			? resolver(value.value)
			: rejecter(value.error);
	}

	resolver(value);
}
