import qs from "querystring";
import phin, {IJSONResponse, IResponse, IStringResponse} from "phin";
import {AppInfo, CreateNoteOptions, EntityId, Note, APIError, SearchResponse, SearchOptions, Branch, Attribute, LoginOptions, LoginResponse, ConfigOptions, HttpMethod, ParseType, ExportType, NoteWithBranch, IAPIError} from "./types";

const config: ConfigOptions = {
    url: "http://localhost:37840/etapi",
    token: ""
};

// Used for defaults for special notes
const today = new Date();

/**
 * Why wait for the server to freak out about an Entity ID
 * when we can do that locally?
 */
const idRegex = /^[a-zA-Z0-9_]{4,32}$/;
const isValidId = (id: EntityId) => idRegex.test(id);
const invalidError = (noteId: string) => new APIError({status: 400, code: "INVALID_ENTITY_ID", message: `Entity id "${noteId}" is invalid.`});

// Generic Make Options
function mopts<T extends ParseType = "json">(path: string, method: HttpMethod, opts: object = {}, parse = "json") {
    return Object.assign({url: `${config.url}${path}`, method, parse: parse, headers: {Authorization: config.token}}, opts) as (T extends "string" ? phin.IStringResponseOptions : T extends "json" ? phin.IJSONResponseOptions : phin.IOptions);
}

// Wrapper for json options
function jopts(path: string, method: HttpMethod, opts: object = {}) {
    return mopts<"json">(path, method, opts, "json");
}

// Wrapper for string options
function sopts(path: string, method: HttpMethod, opts: object = {}) {
    return mopts<"string">(path, method, opts, "string");
}

// Wrapper for binary options
function bopts(path: string, method: HttpMethod, opts: object = {}) {
    return mopts<"none">(path, method, opts, "none");
}


/**
 * The main class and default export.
 * 
 * All methods outside of the Config category have
 * the potential to throw an {@link APIError}.
 */
export default class TriliumETAPI {
    private constructor() {} // eslint-disable-line no-useless-constructor, @typescript-eslint/no-empty-function
    /**
     * Sets the token for the package to use.
     * 
     * @category Config
     * @param token ETAPI token from Trilium.
     * @returns Self for chained actions.
     */
    static token(token: string) {
        config.token = token;
        return this;
    }

    /**
     * This sets the server to be used for future requests.
     * 
     * By default, `http://localhost:37840/etapi` is used.
     * 
     * @category Config
     * @param fquri The fully qualified URI to notes.
     * @returns Self for chained actions.
     */
    static server(fquri: string) {
        const parsed: URL = new URL(fquri);
        if (parsed.pathname.endsWith("/")) fquri = fquri.slice(0, fquri.length - 1);
        config.url = fquri;
        return this;
    }

    /**
     * Check if an id is valid. Useful before sending
     * requests.
     * 
     * @category Utility
     * @param id id to check
     * @returns 
     */
    static isValidId(id: EntityId) {
        return isValidId(id);
    }

    private static async get<R>(path: string): Promise<IJSONResponse<R | IAPIError>> {
        return await phin<R | IAPIError>(jopts(path, "get"));
    }

    private static async gets(path: string): Promise<IStringResponse> {
        return await phin(sopts(path, "get"));
    }

    private static async getb(path: string): Promise<IResponse> {
        return await phin(bopts(path, "get"));
    }

    private static async post<P, R>(path: string, data: P, opts = {}): Promise<IJSONResponse<R | IAPIError>> {
        return await phin<R>(jopts(path, "post", Object.assign({}, {data}, opts)));
    }

    private static async put(path: string, data: string): Promise<IResponse> {
        return await phin(bopts(path, "put", {data}));
    }

    private static async patch<R>(path: string, data: Partial<R>): Promise<IJSONResponse<R | IAPIError>> {
        return await phin<R>(jopts(path, "patch", {data}));
    }

    private static async delete(path: string): Promise<IResponse> {
        return await phin(bopts(path, "delete"));
    }

    /**
     * Create a note and place it into the note tree.
     * 
     * @category Notes
     * @param opts 
     * @returns Information about the new note.
     */
    static async createNote(opts: CreateNoteOptions) {
        const response = await this.post<CreateNoteOptions, NoteWithBranch>("/create-note", opts);
        if (response.statusCode === 201) return response.body as NoteWithBranch;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Search notes according to Trilium's search query system.
     * 
     * See a description on the Trilium Wiki. {@link https://github.com/zadam/trilium/wiki/Search}
     * 
     * @category Notes
     * @param query Search query to be sent.
     * @returns A set of results and potential debug info.
     */
    static async searchNotes(query: SearchOptions) {
        const response = await this.get<SearchResponse>(`/notes?${qs.stringify(query as Record<keyof typeof query, string | boolean | number>)}`);
        if (response.statusCode === 201) return response.body as SearchResponse;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Get a Note object by note id.
     * 
     * @category Notes
     * @param noteId 
     * @returns 
     */
    static async getNoteById(noteId: EntityId) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.get<Note | IAPIError>(`/notes/${noteId}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Patches a note by note id using a partial note object.
     * 
     * @category Notes
     * @param noteId 
     * @param note Parts of the note to update.
     * @returns The new updated Note object.
     */
    static async patchNoteById(noteId: EntityId, note: Partial<Note>) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.patch<Note>(`/notes/${noteId}`, note);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Deletes a note given a note id.
     * 
     * Note: Use with caution.
     * 
     * @category Notes
     * @param noteId
     */
    static async deleteNoteById(noteId: EntityId) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.delete(`/notes/${noteId}`);
        if (response.statusCode === 200) return;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }

    /**
     * Gets the content of a note in raw string form.
     * This can include stringified HTML.
     * 
     * @category Notes
     * @param noteId 
     * @returns Content of the note.
     */
    static async getNoteContentById(noteId: EntityId) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.gets(`/notes/${noteId}/content`);
        if (response.statusCode === 200) return response.body;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }

    /**
     * Set the note content for a given note id.
     * 
     * Note: This DOES NOT append, it completely overwrites the content.
     * If you want to append, first get the note content and concatenate
     * manually.
     * 
     * @category Notes
     * @param noteId 
     * @param content 
     */
    static async putNoteContentById(noteId: EntityId, content: string) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.put(`/notes/${noteId}/content`, content);
        if (response.statusCode === 204) return;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }
    
    /**
     * Exports a note and its subtree in either HTML or Markdown format
     * but compressed in `zip` format.
     * 
     * This routine returns the raw buffer that should be saved to disk
     * in order to create the `.zip` file.
     * 
     * @category Notes
     * @param noteId 
     * @param format HTML or Markdown
     * @returns A Buffer of a zip content that should be saved to disk.
     */
    static async exportNoteSubtree(noteId: EntityId, format: ExportType = "html") {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.getb(`/notes/${noteId}/export?format=${format}`);
        if (response.statusCode === 200) return response.body;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }

    /**
     * Imports a zip into a note's subtree. This will often
     * result in files being attached or becoming child notes
     * of the target. To have more control, see the format
     * Trilium uses internally which is viewable in the
     * `zip`s provided by {@link exportNoteSubtree}.
     * 
     * @category Notes
     * @param noteId 
     * @param zip Buffer of the zip to import.
     * @returns Note and Branch representing the new structure.
     */
    static async importZip(noteId: EntityId, zip: Buffer) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.post(`/notes/${noteId}/import`, zip, {headers: {"Authorization": config.token, "Content-Type": "application/octet-stream", "Content-Transfer-Encoding": "binary"}});
        if (response.statusCode === 201) return response.body as NoteWithBranch;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Creates a new revision for a given note. This can
     * then be reverted to at any time inside Trilium.
     * 
     * Useful for saving a copy before trying something new.
     * 
     * @category Other
     * @param noteId 
     */
    static async createRevision(noteId: EntityId) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.post(`/notes/${noteId}/note-revision`, null);
        if (response.statusCode === 204) return;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Create a branch (clone a note to a different location in the tree).
     * 
     * In case there is a branch between parent note and child note already, 
     * then this will update the existing branch with prefix, notePosition and isExpanded.
     * 
     * @category Branches
     * @param branch Branch to clone note
     */
    static async postBranch(branch: Branch) {
        const response = await this.post<Branch, APIError>(`/branches`, branch);
        if (response.statusCode === 200 || response.statusCode === 201) return;
        throw response.body;
    }

    /**
     * Gets a Branch by id.
     * 
     * @category Branches
     * @param branchId 
     * @returns Matching Branch object.
     */
    static async getBranchById(branchId: EntityId) {
        if (!isValidId(branchId)) throw invalidError(branchId);
        const response = await this.get<Branch>(`/branches/${branchId}`);
        if (response.statusCode === 200) return response.body as Branch;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Patch a branch identified by the branchId with changes in the body.
     * 
     * Note: Only prefix and notePosition can be updated. If you want to
     * update other properties, you need to delete the old branch and
     * create a new one.
     * 
     * @category Branches
     * @param branchId 
     * @param branch Partial branch object.
     * @returns New Branch object representing the updated one.
     */
    static async patchBranchById(branchId: EntityId, branch: Partial<Branch>) {
        if (!isValidId(branchId)) throw invalidError(branchId);
        const response = await this.patch<Branch>(`/branches/${branchId}`, branch);
        if (response.statusCode === 200) return response.body as Branch;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Deletes a branch by id.
     * 
     * Note: Use with caution! If this is the last branch of the
     * (child) note, then the note is deleted as well.
     * 
     * @category Branches
     * @param branchId 
     * @returns 
     */
    static async deleteBranchById(branchId: EntityId) {
        if (!isValidId(branchId)) throw invalidError(branchId);
        const response = await this.delete(`/branches/${branchId}`);
        if (response.statusCode === 200) return;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }

    /**
     * Gets an Attribute by id.
     * 
     * @category Attributes
     * @param attributeId 
     * @returns Attribute object if found.
     */
    static async getAttributeById(attributeId: EntityId) {
        if (!isValidId(attributeId)) throw invalidError(attributeId);
        const response = await this.get<Attribute>(`/attributes/${attributeId}`);
        if (response.statusCode === 200) return response.body as Attribute;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Patch a attribute identified by the attributeId with changes in the
     * body.
     * 
     * For labels, only value and position can be updated.
     * 
     * For relations, only position can be updated.
     * 
     * If you want to modify other properties, you need to delete the old
     * attribute and create a new one.
     * 
     * @category Attributes
     * @param attributeId 
     * @param attribute 
     * @returns Newly updated Attribute.
     */
    static async patchAttributeById(attributeId: EntityId, attribute: Partial<Attribute>) {
        if (!isValidId(attributeId)) throw invalidError(attributeId);
        const response = await this.patch<Attribute>(`/attributes/${attributeId}`, attribute);
        if (response.statusCode === 200) return response.body as Attribute;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Deletes an Attribute by id.
     * 
     * Note: Use with caution!
     * 
     * @category Attributes
     * @param attributeId 
     * @returns 
     */
    static async deleteAttributeById(attributeId: EntityId) {
        if (!isValidId(attributeId)) throw invalidError(attributeId);
        const response = await this.delete(`/attributes/${attributeId}`);
        if (response.statusCode === 200) return;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }

    /**
     * Returns an `inbox` note, into which notes can be created.
     * 
     * Date will be used depending on whether the inbox is a fixed
     * note (identified with an `#inbox` label) or a day note in a
     * journal.
     * 
     * @category Special Notes
     * @param year 
     * @param month 
     * @param day 
     * @returns
     */
    static async getInboxNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1, day: number = today.getDate()) {
        const response = await this.get<Note>(`/inbox/${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Gets the daily note for the given date. Note is created
     * if it doesn't already exist.
     * 
     * @category Special Notes
     * @param year 
     * @param month 
     * @param day 
     * @returns 
     */
    static async getDayNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1, day: number = today.getDate()) {
        const response = await this.get<Note>(`/calendar/days/${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Gets the weekly note for the given date. Note is created
     * if it doesn't already exist.
     * 
     * @category Special Notes
     * @param year 
     * @param month 
     * @param day 
     * @returns 
     */
    static async getWeekNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1, day: number = today.getDate()) {
        const response = await this.get<Note>(`/calendar/weeks/${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Gets the monthly note for the given date. Note is created
     * if it doesn't already exist.
     * 
     * @category Special Notes
     * @param year 
     * @param month 
     * @returns 
     */
    static async getMonthNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1) {
        const response = await this.get<Note>(`/calendar/months/${year}-${month.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Gets the yearly note for the given year. Note is created
     * if it doesn't already exist.
     * 
     * @category Special Notes
     * @param year 
     * @returns 
     */
    static async getYearNote(year: number = today.getFullYear()) {
        const response = await this.get<Note>(`/calendar/months/${year}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Logs in to Trilium Notes using your password and generates a new ETAPI Token.
     * 
     * Note: This method will automatically cache the token for later use, so no need
     * to call `token()`.
     * 
     * @category Auth
     * @param password Your Trilium password
     * @returns An object containing the new ETAPI Token
     */
    static async login(password: string) {
        const response = await this.post<LoginOptions, LoginResponse>(`/auth/login`, {password}, {headers: {}});
        if (response.statusCode === 201) {
            const resp = response.body as LoginResponse;
            config.token = resp.authToken;
            return resp;
        }
        if (response.statusCode === 429) throw new APIError({status: 429, code: "BLACKLISTED", message: "Client IP has been blacklisted because too many requests (possibly failed authentications) were made within a short time frame, try again later"});
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Logout deletes the ETAPI Token currently in use.
     * 
     * Note: This method will automatically clear the currently cached token as
     * if you called `token("")`.
     * 
     * @category Auth
     */
    static async logout() {
        const response = await this.post(`/auth/logout`, null);
        if (response.statusCode === 204) {
            config.token = "";
            return;
        }
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Gets import info about the currently connected instance
     * of Trilium.
     * 
     * @category Other
     * @returns Information about this installation of Trilium.
     */
    static async getAppInfo() {
        const response = await this.get<AppInfo>("/app-info");
        if (response.statusCode === 200) return response.body as AppInfo;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Creates a backup in the Trilium data directory.
     * 
     * @category Other
     * @param name Name of backup (will be prefixed by `backup-`)
     * @returns Error upon error, nothing otherwise.
     */
    static async createBackup(name: string) {
        const response = await this.put(`/backup/${name}`, "");
        if (response.statusCode === 204) return;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }
}

export * from "./types";