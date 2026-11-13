/*
 * Formats test/unformatted.js and test/unformatted.scss with the shipped config
 * and compares the output against test/unformatted.snapshot.js and
 * test/unformatted.snapshot.scss. Also verifies that formatting a snapshot
 * leaves it unchanged, so the recorded output is stable.
 *
 *     npm test               compare against the snapshots
 *     npm test -- --update   rewrite the snapshots after an intentional change
 */
import { readFile, writeFile } from "node:fs/promises";
import prettier from "prettier";

const fixtures = ["test/unformatted.js", "test/unformatted.scss"];
const update = process.argv.includes("--update");
let failed = false;

/**
 * @param {string} target
 * @returns {string}
 */
function snapshotFileFor(target) {
    return target.replace(/\.(\w+)$/, ".snapshot.$1");
}

/**
 * @param {string} filepath
 * @param {string} source
 * @returns {Promise<string>}
 */
async function format(filepath, source) {
    const options = await prettier.resolveConfig(filepath, { config: "index.js" });

    if (options === null) {
        throw new Error("Prettier could not load index.js as a config file.");
    }

    return prettier.format(source, { ...options, filepath });
}

/**
 * @param {string} target
 * @param {string} expected
 * @param {string} actual
 */
function reportMismatch(target, expected, actual) {
    const expectedLines = expected.split("\n");
    const actualLines = actual.split("\n");
    const total = Math.max(expectedLines.length, actualLines.length);

    console.error(`Snapshot mismatch in ${target}.`);

    for (let index = 0; index < total; index += 1) {
        if (expectedLines[index] !== actualLines[index]) {
            console.error(`  line ${index + 1}`);
            console.error(`  - expected: ${expectedLines[index] ?? "<end of file>"}`);
            console.error(`  + actual:   ${actualLines[index] ?? "<end of file>"}`);
            break;
        }
    }
}

for (const target of fixtures) {
    const snapshotFile = snapshotFileFor(target);
    const actual = await format(target, await readFile(target, "utf8"));

    if (update) {
        await writeFile(snapshotFile, actual);
        console.info(`Snapshot updated: ${snapshotFile}`);
        continue;
    }

    const expected = await readFile(snapshotFile, "utf8");

    if (actual !== expected) {
        reportMismatch(target, expected, actual);
        failed = true;
        continue;
    }

    const reformatted = await format(snapshotFile, expected);

    if (reformatted !== expected) {
        reportMismatch(snapshotFile, expected, reformatted);
        console.error("  Formatting the snapshot again changed it, so the output is not stable.");
        failed = true;
        continue;
    }

    console.info(`Snapshot matches: ${target} -> ${snapshotFile}`);
}

if (failed) {
    console.error('\nRun "npm test -- --update" if the change is intended.');
    process.exit(1);
}
