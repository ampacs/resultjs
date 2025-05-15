// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Result type information is used in JSDocs
import type Result from "../../src";

type ResultFlag = {
	/**
	 * Indicates if this is a successful or error result.
	 * Always `true` for {@link Result.Ok}, and `false` for {@link Result.Error}.
	 */
	readonly ok: boolean;
}

/**
 * Represents a successful result with a value.
 *
 * @template T The type of the success value.
 * @property {true} ok Indicates that this is a successful result.
 * @property {T} value The contained success value.
 * @extends ResultFlag
 */
export type ResultValue<T> = ResultFlag & {
	/**
	 * @see {@link ResultFlag.ok}
	 */
	readonly ok: true;

	/**
	 * The contained success value.
	 */
	readonly value: T;
};

/**
 * Represents a failed result with an error value.
 *
 * @template E The type of the error value.
 * @property {false} ok Indicates that this is a failed result.
 * @property {E} error The contained error value.
 * @extends ResultFlag
 */
export type ResultError<E> = ResultFlag & {
	/**
	 * @see {@link ResultFlag.ok}
	 */
	readonly ok: false;

	/**
	 * The contained error value.
	 */
	readonly error: E;
};
