import fs from "fs";
import path from "path";
import { argv } from "process";

const args = argv.slice(2);

const jsons: string[] = [];
let output = "";

// process the arguments
for (let i = 0; i < args.length; i++) {
	const arg = args[i];

	switch (arg) {
	case "--output":
	case "-o": {
		output = args[++i];

		break;
	}
	default: {
		const extension = path.extname(arg);
		if (extension !== ".json") {
			throw new Error("invalid filetype encountered: " + extension);
		}

		jsons.push(arg);

		break;
	}
	}
}
if (output === "") {
	throw new Error("target output file for final merge JSON is missing");
}

// parse each JSON file
const objs: unknown[] = [];
for (const json of jsons) {
	const contents = fs.readFileSync(json, { encoding: "utf8" });

	const obj: unknown = JSON.parse(contents);

	objs.push(obj);
}

// merge each object
function merge(lhs: unknown, rhs: unknown): unknown {
	if (typeof lhs !== typeof rhs) {
		return rhs;
	}

	let result: unknown;
	switch (typeof lhs) {
	case "object": {
		if (rhs === undefined || rhs === null) {
			result = rhs;

			break;
		}

		if (rhs instanceof Array) {
			if (lhs instanceof Array) {
				const array = new Array(lhs.length + rhs.length);
				for (let i = 0; i < lhs.length; i++) {
					const element: unknown = lhs[i];
					array[i] = element;
				}
				for (let i = 0; i < rhs.length; i++) {
					const element: unknown = rhs[i];
					array[lhs.length + i] = element;
				}

				result = array;
			} else {
				result = rhs;
			}

			break;
		}

		const obj = {};
		if (lhs !== null) {
			for (const key in lhs) {
				if (key in (rhs as object)) {
					const value = merge(lhs[key], rhs[key]);
					if (value !== undefined && value !== null) {
						obj[key] = value;
					}
				} else {
					const value: unknown = lhs[key];
					obj[key] = value;
				}
			}
			for (const key in rhs) {
				if (key in lhs) {
					continue;
				}

				const value: unknown = rhs[key];
				obj[key] = value;
			}
		} else {
			for (const key in rhs) {
				const value: unknown = rhs[key];
				obj[key] = value;
			}
		}
		result = obj;

		break;
	}
	default:
		result = rhs;
	}

	return result;
}

let finalObj: unknown = null;
for (const obj of objs) {
	finalObj = merge(finalObj, obj);
}

// stringify the final object and write it to the target output
const finalJson = JSON.stringify(finalObj, undefined, 2);

fs.writeFileSync(output, finalJson, "utf-8");
