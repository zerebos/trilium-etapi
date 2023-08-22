export type integer = number;
export type StringId = string;
export type LocalDateTime = string;
export type UtcDateTime = string;
export type HttpMethod = "get" | "post" | "patch" | "delete" | "put";
export type ParseType = "json" | "string" | "none";
export type ExportType = "markdown" | "html";
export interface ConfigOptions {
    url: string;
    auth: string;
}


export interface AppInfo {
    appVersion: string;
    dbVersion: integer;
    syncVersion: integer;
    buildDate: string;
    buildRevision: string;
    dataDirectory: string;
    clipperProtocolVersion: string;
    utcDateTime: string;
}

export interface APIError {
    status: integer;
    code: string;
    message: string;
}


export type EntityId = string;
export type EntityIdList = EntityId[];


export type AttributeType = "label" | "relation";

export interface Attribute {
    attributeId: EntityId;
    noteId: EntityId;
    type: AttributeType;
    name: string;
    value: string;
    position: integer;
    isInheritable: boolean;
    utcDateModified: UtcDateTime;
}

export type AttributeList = Attribute[];


export type CreateableNoteType = "text" | "code" | "file" | "image" | "search" | "book" | "relationMap" | "render";
export type NoteType = CreateableNoteType | "noteMap" | "mermaid" | "webView" | "shortcut" | "doc" | "contentWidget" | "launcher";

export interface Note {
    noteId: EntityId;
    title: string;
    type: NoteType;
    mime: string;
    readonly isProtected: boolean;
    blobId: EntityId;
    attributes: AttributeList;
    parentNoteIds: EntityIdList;
    childNoteIds: EntityIdList;
    parentBranchIds: EntityIdList;
    childBranchIds: EntityIdList;
    dateCreated: LocalDateTime;
    dateModified: LocalDateTime;
    utcDateCreated: UtcDateTime;
    utcDateModified: UtcDateTime;
}

export interface CreateNoteDef {
    parentNoteId: EntityId;
    title: string;
    type: CreateableNoteType;
    mime?: string;
    content: string;
    notePosition?: integer;
    prefix?: string;
    isExpanded?: boolean;
    noteId?: EntityId;
    branchId?: EntityId;
}

export interface CreateTypedNoteDef extends CreateNoteDef {
    type: "code" | "file" | "image";
    mime: string;
}


export interface Branch {
    branchId: EntityId;
    noteId: EntityId;
    parentNoteId: EntityId;
    prefix: string;
    notePosition: integer;
    isExpanded: boolean;
    utcDateModified: UtcDateTime;
}


export interface NoteWithBranch {
    note: Note;
    branch: Branch;
}


export type SearchOptions = {
    search: string;
    fastSearch?: boolean;
    includeArchivedNotes?: boolean;
    ancestorNoteId?: EntityId;
    ancestorDepth?: string;
    orderBy?: string;
    orderDirection?: string;
    limit?: integer;
    debug?: boolean;
}

export interface SearchResponse {
    results: Note[];
    debugInfo: {description: string};
}

export interface LoginOptions {
    password: string;
}

export interface LoginResponse {
    authToken: string;
}