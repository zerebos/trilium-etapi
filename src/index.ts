import qs from "querystring";
import phin, {IJSONResponse, IResponse, IStringResponse} from "phin";
import {AppInfo, CreateNoteDef as CreateNoteOptions, EntityId, Note, APIError, SearchResponse, SearchOptions, Branch, Attribute, LoginOptions, LoginResponse, ConfigOptions, HttpMethod, ParseType, ExportType} from "./types";

const config: ConfigOptions = {
    url: "http://localhost:37840/etapi",
    auth: ""
};

const today = new Date();
const idRegex = /[a-zA-Z0-9_]{4,32}/;
const isValidId = (id: EntityId) => idRegex.test(id);
const invalidError = (noteId: string) => ({status: 400, code: "INVALID_ENTITY_ID", message: `Entity id "${noteId}" is invalid.`}) as APIError;

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


class TriliumETApi {
    auth(token: string): void {
        config.auth = token;
    }

    server(fquri: string) {
        const parsed: URL = new URL(fquri);
        if (parsed.pathname.endsWith("/")) fquri = fquri.slice(0, fquri.length - 1);
        config.url = fquri;
    }

    private async get<R>(path: string): Promise<IJSONResponse<R | APIError>> {
        return await phin<R>(jopts(path, "get"));
    }

    private async gets(path: string): Promise<IStringResponse> {
        return await phin(sopts(path, "get"));
    }

    private async getb(path: string): Promise<IResponse> {
        return await phin(bopts(path, "get"));
    }

    private async post<P, R>(path: string, data: P, opts = {}): Promise<IJSONResponse<R | APIError>> {
        return await phin<R>(jopts(path, "post", Object.assign({}, {data}, opts)));
    }

    private async put(path: string, data: string): Promise<IResponse> {
        return await phin(bopts(path, "put", {data}));
    }

    private async patch<R>(path: string, data: Partial<R>): Promise<IJSONResponse<R | APIError>> {
        return await phin<R>(jopts(path, "patch", {data}));
    }

    private async delete(path: string): Promise<IResponse> {
        return await phin(bopts(path, "delete"));
    }

    async createNote(opts: CreateNoteOptions) {
        const response = await this.post<CreateNoteOptions, Note>("/create-note", opts);
        if (response.statusCode === 201) return response.body as Note;
        return response.body as APIError;
    }

    async searchNotes(query: SearchOptions) {
        const response =  await this.get<SearchResponse>(`/notes?${qs.stringify(query)}`);
        if (response.statusCode === 201) return response.body as SearchResponse;
        return response.body as APIError;
    }

    async getNoteById(noteId: EntityId) {
        if (!isValidId(noteId)) return invalidError(noteId);
        const response = await this.get<Note>(`/notes/${noteId}`);
        if (response.statusCode === 200) return response.body as Note;
        return response.body as APIError;
    }

    async patchNoteById(noteId: EntityId, note: Partial<Note>) {
        if (!isValidId(noteId)) return invalidError(noteId);
        const response = await this.patch<Note>(`/notes/${noteId}`, note);
        if (response.statusCode === 200) return response.body as Note;
        return response.body as APIError;
    }

    async deleteNoteById(noteId: EntityId) {
        if (!isValidId(noteId)) return invalidError(noteId);
        const response = await this.delete(`/notes/${noteId}`);
        if (response.statusCode === 200) return;
        return JSON.parse(response.body.toString()) as APIError;
    }

    async getNoteContentById(noteId: EntityId) {
        if (!isValidId(noteId)) return invalidError(noteId);
        const response = await this.gets(`/notes/${noteId}/content`);
        if (response.statusCode === 200) return response.body;
        return JSON.parse(response.body) as APIError;
    }

    async putNoteContentById(noteId: EntityId, content: string) {
        if (!isValidId(noteId)) return invalidError(noteId);
        const response = await this.put(`/notes/${noteId}/content`, content);
        if (response.statusCode === 204) return;
        return JSON.parse(response.body.toString()) as APIError;
    }
    
    async exportNoteSubtree(noteId: EntityId, format: ExportType = "html") {
        if (!isValidId(noteId)) return invalidError(noteId);
        const response = await this.getb(`/notes/${noteId}/export?format=${format}`);
        if (response.statusCode === 200) return response.body;
        return JSON.parse(response.body.toString()) as APIError;
    }

    async importZip(noteId: EntityId, zip: Buffer) {
        if (!isValidId(noteId)) return invalidError(noteId);
        console.log(" GONNA IMPORT ");
        const response = await this.post(`/notes/${noteId}/import`, zip, {headers: {"Authorization": config.auth, "Content-Type": "application/octet-stream", "Content-Transfer-Encoding": "binary"}});
        if (response.statusCode === 201) return response.body as Note;
        return response.body as APIError;
    }

    async createRevision(noteId: EntityId) {
        if (!isValidId(noteId)) return invalidError(noteId);
        const response = await this.post(`/notes/${noteId}/note-revision`, null);
        if (response.statusCode === 204) return;
        return response.body as APIError;
    }

    async postBranch(branch: Branch) {
        const response = await this.post(`/branches`, branch);
        if (response.statusCode === 200 || response.statusCode === 201) return;
        return response.body as APIError;
    }

    async getBranchById(branchId: EntityId) {
        if (!isValidId(branchId)) return invalidError(branchId);
        const response = await this.get<Branch>(`/branches/${branchId}`);
        if (response.statusCode === 200) return response.body as Branch;
        return response.body as APIError;
    }

    async patchBranchById(branchId: EntityId, branch: Partial<Branch>) {
        if (!isValidId(branchId)) return invalidError(branchId);
        const response = await this.patch<Branch>(`/branches/${branchId}`, branch);
        if (response.statusCode === 200) return response.body as Branch;
        return response.body as APIError;
    }

    async deleteBranchById(branchId: EntityId) {
        if (!isValidId(branchId)) return invalidError(branchId);
        const response = await this.delete(`/branches/${branchId}`);
        if (response.statusCode === 200) return;
        return JSON.parse(response.body.toString()) as APIError;
    }

    async getAttributeById(attributeId: EntityId) {
        if (!isValidId(attributeId)) return invalidError(attributeId);
        const response = await this.get<Attribute>(`/attributes/${attributeId}`);
        if (response.statusCode === 200) return response.body as Attribute;
        return response.body as APIError;
    }

    async patchAttributeById(attributeId: EntityId, attribute: Partial<Attribute>) {
        if (!isValidId(attributeId)) return invalidError(attributeId);
        const response = await this.patch<Attribute>(`/attributes/${attributeId}`, attribute);
        if (response.statusCode === 200) return response.body as Attribute;
        return response.body as APIError;
    }

    async deleteAttributeById(attributeId: EntityId) {
        if (!isValidId(attributeId)) return invalidError(attributeId);
        const response = await this.delete(`/attributes/${attributeId}`);
        if (response.statusCode === 200) return;
        return JSON.parse(response.body.toString()) as APIError;
    }

    async getInboxNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1, day: number = today.getDate()) {
        const response = await this.get<Note>(`/inbox/${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        return response.body as APIError;
    }

    async getDayNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1, day: number = today.getDate()) {
        const response = await this.get<Note>(`/calendar/days/${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        return response.body as APIError;
    }

    async getWeekNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1, day: number = today.getDate()) {
        const response = await this.get<Note>(`/calendar/weeks/${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        return response.body as APIError;
    }

    async getMonthNote(year: number = today.getFullYear(), month: number = today.getMonth() + 1) {
        const response = await this.get<Note>(`/calendar/months/${year}-${month.toString().padStart(2, "0")}`);
        if (response.statusCode === 200) return response.body as Note;
        return response.body as APIError;
    }

    async getYearNote(year: number = today.getFullYear()) {
        const response = await this.get<Note>(`/calendar/months/${year}`);
        if (response.statusCode === 200) return response.body as Note;
        return response.body as APIError;
    }

    async login(password: string) {
        const response = await this.post<LoginOptions, LoginResponse>(`/auth/login`, {password}, {headers: {}});
        if (response.statusCode === 201) {
            config.auth = (response.body as LoginResponse).authToken;
            return response.body;
        }
        if (response.statusCode === 429) return {status: 429, code: "BLACKLISTED", message: "Client IP has been blacklisted because too many requests (possibly failed authentications) were made within a short time frame, try again later"} as APIError;
        return response.body as APIError;
    }

    async logout() {
        const response = await this.post(`/auth/logout`, null);
        if (response.statusCode === 204) {
            config.auth = "";
            return response.body;
        }
        return response.body as APIError;
    }

    async getAppInfo() {
        const response = await this.get<AppInfo>("/app-info");
        if (response.statusCode === 200) return response.body as AppInfo;
        return response.body as APIError;
    }

    async createBackup(name: string) {
        const response = await this.put(`/backup/${name}`, null);
        if (response.statusCode === 204) return;
        return JSON.parse(response.body.toString()) as APIError;
    }
}

// for (const key in appInfoSpec) {
//     for (const method in appInfoSpec[key]) {
//         const t = appInfoSpec[key];
//         const actionSpec = appInfoSpec[key][method as HttpMethod];
//         Object.assign(Trilium, {[actionSpec.operationId as string]: () => Trilium["get"]<AppInfo>(key)});
//     }
// }

export default new TriliumETApi();