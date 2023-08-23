import qs from "querystring";
import phin, {IJSONResponse, IResponse, IStringResponse} from "phin";
import {AppInfo, CreateNoteOptions, EntityId, Note, APIError, SearchResponse, SearchOptions, Branch, Attribute, LoginOptions, LoginResponse, ConfigOptions, HttpMethod, ParseType, ExportType, NoteWithBranch, IAPIError} from "./types";

const config: ConfigOptions = {
    url: "http://localhost:37840/etapi",
    auth: ""
};

const today = new Date();
const idRegex = /[a-zA-Z0-9_]{4,32}/;
const isValidId = (id: EntityId) => idRegex.test(id);
const invalidError = (noteId: string) => new APIError({status: 400, code: "INVALID_ENTITY_ID", message: `Entity id "${noteId}" is invalid.`});

function mopts<T extends ParseType = "json">(path: string, method: HttpMethod, opts: object = {}, parse: string = "json") {
    return Object.assign({url: `${config.url}${path}`, method, parse: parse, headers: {Authorization: config.auth}}, opts) as (T extends "string" ? phin.IStringResponseOptions : T extends "json" ? phin.IJSONResponseOptions : phin.IOptions);
}

function jopts(path: string, method: HttpMethod, opts: object = {}) {
    return mopts<"json">(path, method, opts, "json");
}

function sopts(path: string, method: HttpMethod, opts: object = {}) {
    return mopts<"string">(path, method, opts, "string");
}

function bopts(path: string, method: HttpMethod, opts: object = {}) {
    return mopts<"none">(path, method, opts, "none");
}


/**
 * The main class.
 * @class
 * @name TriliumETAPI
 */
export default class TriliumETAPI {
    private constructor(){};
    /**
     * Sets the token for the package to use.
     * @param token ETAPI token from Trilium
     * @category auth
     */
    static auth(token: string) {
        config.auth = token;
        return this;
    }

    static server(fquri: string) {
        const parsed: URL = new URL(fquri);
        if (parsed.pathname.endsWith("/")) fquri = fquri.slice(0, fquri.length - 1);
        config.url = fquri;
        return this;
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
     * @param opts 
     * @returns Information about the new note.
     */
    static async createNote(opts: CreateNoteOptions) {
        const response = await this.post<CreateNoteOptions, NoteWithBranch>("/create-note", opts);
        if (response.statusCode === 201) return response.body as NoteWithBranch;
        throw new APIError(response.body as IAPIError);
    }

    static async searchNotes(query: SearchOptions) {
        const response =  await this.get<SearchResponse>(`/notes?${qs.stringify(query)}`);
        if (response.statusCode === 201) return response.body as SearchResponse;
        throw new APIError(response.body as IAPIError);
    }

    static async getNoteById(noteId: EntityId) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.get<Note | IAPIError>(`/notes/${noteId}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    static async patchNoteById(noteId: EntityId, note: Partial<Note>) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.patch<Note>(`/notes/${noteId}`, note);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    static async deleteNoteById(noteId: EntityId) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.delete(`/notes/${noteId}`);
        if (response.statusCode === 200) return;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }

    static async getNoteContentById(noteId: EntityId) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.gets(`/notes/${noteId}/content`);
        if (response.statusCode === 200) return response.body as string;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }

    static async putNoteContentById(noteId: EntityId, content: string) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.put(`/notes/${noteId}/content`, content);
        if (response.statusCode === 204) return;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }
    
    static async exportNoteSubtree(noteId: EntityId, format: ExportType = "html") {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.getb(`/notes/${noteId}/export?format=${format}`);
        if (response.statusCode === 200) return response.body;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }

    static async importZip(noteId: EntityId, zip: Buffer) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        console.log(" GONNA IMPORT ");
        const response = await this.post(`/notes/${noteId}/import`, zip, {headers: {"Authorization": config.auth, "Content-Type": "application/octet-stream", "Content-Transfer-Encoding": "binary"}});
        if (response.statusCode === 201) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    static async createRevision(noteId: EntityId) {
        if (!isValidId(noteId)) throw invalidError(noteId);
        const response = await this.post(`/notes/${noteId}/note-revision`, null);
        if (response.statusCode === 204) return;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * 
     * @throws {@link APIError}
     * @param branch Branch to clone note
     * @returns 
     */
    static async postBranch(branch: Branch) {
        const response = await this.post<Branch, APIError>(`/branches`, branch);
        if (response.statusCode === 200 || response.statusCode === 201) return;
        throw response.body;
    }

    static async getBranchById(branchId: EntityId) {
        if (!isValidId(branchId)) throw invalidError(branchId);
        const response = await this.get<Branch>(`/branches/${branchId}`);
        if (response.statusCode === 200) return response.body as Branch;
        throw new APIError(response.body as IAPIError);
    }

    static async patchBranchById(branchId: EntityId, branch: Partial<Branch>) {
        if (!isValidId(branchId)) throw invalidError(branchId);
        const response = await this.patch<Branch>(`/branches/${branchId}`, branch);
        if (response.statusCode === 200) return response.body as Branch;
        throw new APIError(response.body as IAPIError);
    }

    static async deleteBranchById(branchId: EntityId) {
        if (!isValidId(branchId)) throw invalidError(branchId);
        const response = await this.delete(`/branches/${branchId}`);
        if (response.statusCode === 200) return;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }

    static async getAttributeById(attributeId: EntityId) {
        if (!isValidId(attributeId)) throw invalidError(attributeId);
        const response = await this.get<Attribute>(`/attributes/${attributeId}`);
        if (response.statusCode === 200) return response.body as Attribute;
        throw new APIError(response.body as IAPIError);
    }

    static async patchAttributeById(attributeId: EntityId, attribute: Partial<Attribute>) {
        if (!isValidId(attributeId)) throw invalidError(attributeId);
        const response = await this.patch<Attribute>(`/attributes/${attributeId}`, attribute);
        if (response.statusCode === 200) return response.body as Attribute;
        throw new APIError(response.body as IAPIError);
    }

    static async deleteAttributeById(attributeId: EntityId) {
        if (!isValidId(attributeId)) throw invalidError(attributeId);
        const response = await this.delete(`/attributes/${attributeId}`);
        if (response.statusCode === 200) return;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }

    static async getInboxNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1, day: number = today.getDate()) {
        const response = await this.get<Note>(`/inbox/${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    static async getDayNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1, day: number = today.getDate()) {
        const response = await this.get<Note>(`/calendar/days/${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    static async getWeekNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1, day: number = today.getDate()) {
        const response = await this.get<Note>(`/calendar/weeks/${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    static async getMonthNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1) {
        const response = await this.get<Note>(`/calendar/months/${year}-${month.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    static async getYearNote(year: number = today.getFullYear()) {
        const response = await this.get<Note>(`/calendar/months/${year}`);
        if (response.statusCode === 200) return response.body as Note;
        throw new APIError(response.body as IAPIError);
    }

    static async login(password: string) {
        const response = await this.post<LoginOptions, LoginResponse>(`/auth/login`, {password}, {headers: {}});
        if (response.statusCode === 201) {
            const resp = response.body as LoginResponse;
            config.auth = resp.authToken;
            return resp;
        }
        if (response.statusCode === 429) throw new APIError({status: 429, code: "BLACKLISTED", message: "Client IP has been blacklisted because too many requests (possibly failed authentications) were made within a short time frame, try again later"});
        throw new APIError(response.body as IAPIError);
    }

    static async logout() {
        const response = await this.post(`/auth/logout`, null);
        if (response.statusCode === 204) {
            config.auth = "";
            return response.body;
        }
        throw new APIError(response.body as IAPIError);
    }

    static async getAppInfo() {
        const response = await this.get<AppInfo>("/app-info");
        if (response.statusCode === 200) return response.body as AppInfo;
        throw new APIError(response.body as IAPIError);
    }

    /**
     * Creates a backup in the Trilium data directory.
     * @param name Name of backup (will be prefixed by `backup-`)
     * @returns Error upon error, nothing otherwise.
     */
    static async createBackup(name: string) {
        const response = await this.put(`/backup/${name}`, null);
        if (response.statusCode === 204) return;
        throw new APIError(JSON.parse(response.body.toString()) as IAPIError);
    }
}

// for (const key in appInfoSpec) {
//     for (const method in appInfoSpec[key]) {
//         const t = appInfoSpec[key];
//         const actionSpec = appInfoSpec[key][method as HttpMethod];
//         Object.assign(Trilium, {[actionSpec.operationId as string]: () => Trilium["get"]<AppInfo>(key)});
//     }
// }

/**
 * Intstance of {@link TriliumETAPI}
 */
// export default TriliumETAPI;
export * from "./types";