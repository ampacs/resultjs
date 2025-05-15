/**
 * Internal utility function for determining if a given `value` is a "thenable" (i.e. a Promise-like object).
 *
 * @param {unknown} value The value to check.
 * @returns {value is PromiseLike<unknown>} Whether or not the given `value` is a "thenable".
 */
export function isThenable<T = unknown>(value: unknown): value is PromiseLike<T> {
	return value instanceof Object &&
		(value as PromiseLike<T>).then instanceof Function;
}

/**
 * Internal utility function for determining if a given `value` is an iterable object.
 *
 * @param {unknown} value The value to check.
 * @returns {value is Iterable<unknown>} Whether or not the given `value` is an iterable object.
 */
export function isIterable<T = unknown>(value: unknown): value is Iterable<T> {
	return value instanceof Object &&
		(value as Iterable<T>)[Symbol.iterator] instanceof Function;
}
