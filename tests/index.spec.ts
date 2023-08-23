import {assert} from "chai"; // Using Assert style
import {describe, it} from "mocha";
// import {expect} from "chai"; // Using Expect style
import nock from "nock";
import {rootNote} from "./notes";
import tepi, {APIError} from "../src";


nock.disableNetConnect();

const s = (length: number) => Array(length).fill("t").join("");
const isValidId = (id: string) => tepi.isValidId(id);

describe("Id Validation", () => {
    it("should return false for length < 4", () => {
        for (let i = 0; i < 4; i++) {
            assert.equal(isValidId(s(i)), false);
        }
        assert.equal(isValidId(s(4)), true);
    });

    it("should return false for length > 32", () => {
        for (let i = 36; i > 32; i--) {
            assert.equal(isValidId(s(i)), false);
        }
        assert.equal(isValidId(s(32)), true);
    });

    it("should return false for non-alphanumeric (and _) characters", () => {
        assert.equal(isValidId("note/other"), false);
        assert.equal(isValidId("gKfel$peL"), false);
        assert.equal(isValidId("laAWEf%20m"), false);
        assert.equal(isValidId("name:space"), false);
        assert.equal(isValidId("/path/to/note"), false);
        assert.equal(isValidId("_special"), true);
    });

    it("should return true for known valid ids", () => {
        for (const id of rootNote.childNoteIds) {
            assert.equal(isValidId(id), true);
        }

        for (const id of rootNote.childBranchIds) {
            assert.equal(isValidId(id), true);
        }
    });
});

describe("Config functions", () => {
    it("should return a pointer for chaining", () => {
        assert.equal(tepi.token("random token"), tepi);
    });
});


describe("Note functions", () => {
    const scope = nock("http://localhost:37840/etapi").get(/\/notes\/[a-zA-Z0-9_]{4,32}/).reply((uri) => {
        const id = uri.replace("/etapi/notes/", "");
        if (!isValidId(id)) return [400, {status: 400, code: "INVALID_ENTITY_ID", message: `Entity id "${id}" is invalid.`}];
        if (id === "root") return [200, rootNote];
        return [404, {status: 404, code: "NOTE_NOT_FOUND", message: `Note "${id}" not found.`}];
    }).persist();

    it("should get a note", async () => {
        assert.deepEqual(await tepi.getNoteById("root"), rootNote);
    });

    it("should throw on invalid id", async () => {
        try {
            await tepi.getNoteById("r");
            assert.fail("Somehow did not throw on bad id");
        }
        catch (e) {
            assert.equal(e instanceof APIError, true);
        }
    });

    it("should throw when no matching note exists", async () => {
        try {
            await tepi.getNoteById("rooty");
            assert.fail("Somehow did not throw on non-existent not");
        }
        catch (e) {
            assert.equal(e instanceof APIError, true);
        }
    });

    it("should not have outstanding requests", () => {
        assert.doesNotThrow(() => scope.done());
    });
});