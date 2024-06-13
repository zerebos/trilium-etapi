export type integer = number;
/**
 * **Pattern:** `[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[\+\-][0-9]{4}`
 * 
 * **Example:** `2021-12-31 20:18:11.930+0100`
 */
export type LocalDateTime = string;
/**
 * **Pattern:** `[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z`
 * 
 * **Example:** `2021-12-31 20:18:11.930Z`
 */
export type UtcDateTime = string;
export type HttpMethod = "get" | "post" | "patch" | "delete" | "put";
export type ParseType = "json" | "string" | "none";
export type ExportType = "markdown" | "html";
export interface ConfigOptions {
    url: string;
    token: string;
}

/**
 * Creates a normal `Partial<T>` but sets some fields as required.
 * TODO: find a way to use this 
 */
// export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>


export interface AppInfo {
    appVersion: string;
    dbVersion: integer;
    syncVersion: integer;
    buildDate: LocalDateTime;
    buildRevision: string;
    dataDirectory: string;
    clipperProtocolVersion: string;
    utcDateTime: UtcDateTime;
}

export interface IAPIError {
    status: integer;
    code: string;
    message: string;
}

export class APIError extends Error implements IAPIError {
    status: integer;
    code: string;
    constructor({status, code, message}: IAPIError) {
        super(message);
        this.name = "APIError";
        this.status = status;
        this.code = code;
    }
}

/**
 * **Pattern:** `[a-zA-Z0-9_]{4,32}`
 * 
 * **Example:** `evnnmvHTCgIn`
 */
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

// TODO: export type CreateAttributeOptions = PartialExcept<Attribute, "noteId" | "type" | "name" | "value">
export interface CreateAttributeOptions {
    attributeId: EntityId;
    noteId: EntityId;
    type: AttributeType;
    name: string;
    value?: string;
    position?: integer;
    isInheritable?: boolean;
}

// TODO: find a way to separate this for attribute type
// This would be straightforward if "type" was part of this object
// Maybe a type guard?
export interface PatchAttributeOptions {
    value?: string;
    position?: integer;
}


export type CreateableNoteType = "text" | "code" | "file" | "image" | "search" | "book" | "relationMap" | "render";
export type NoteType = CreateableNoteType | "noteMap" | "mermaid" | "webView" | "shortcut" | "doc" | "contentWidget" | "launcher";

export interface Note {
    noteId: EntityId;
    title: string;
    type: NoteType;
    mime: string;
    readonly isProtected: boolean;
    blobId?: EntityId;
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

export interface CreateNoteBase {
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

export interface CreateNormalNoteOptions extends CreateNoteBase {
    type: "text" | "search" | "book" | "relationMap" | "render";
}

// These note types require a mime type to be set
export interface CreateTypedNoteOptions extends CreateNoteBase {
    type: "code" | "file" | "image";
    mime: string;
}

export type CreateNoteOptions = CreateTypedNoteOptions | CreateNormalNoteOptions;

export interface PatchNoteOptions {
    title?: string;
    type?: NoteType;
    mime?: string;
    dateCreated?: LocalDateTime;
    utcDateCreated?: UtcDateTime;
}


export interface Attachment {
    attachmentId: EntityId;
    ownerId: EntityId;
    role: string;
    mime: string;
    position: integer;
    blobId: string;
    dateModified: LocalDateTime;
    utcDateModified: UtcDateTime;
    utcDateScheduledForErasureSince: UtcDateTime;
    contentLength: integer;
}

export interface CreateAttachmentOptions {
    ownerId?: EntityId;
    role?: string;
    mime?: string;
    title?: string;
    content?: string;
    position?: integer;
}

export interface PatchAttachmentOptions {
    role?: string;
    mime?: string;
    title?: string;
    position?: integer;
}

// TODO: consider using Omit<Branch, > to avoid duplication for Options types
export interface Branch {
    branchId: EntityId;
    noteId: EntityId;
    parentNoteId: EntityId;
    prefix: string;
    notePosition: integer;
    isExpanded: boolean;
    utcDateModified: UtcDateTime;
}

export interface CreateBranchOptions {
    noteId: EntityId;
    parentNoteId: EntityId;
    prefix?: string;
    notePosition?: integer;
    isExpanded?: boolean;
}

export interface PatchBranchOptions {
    notePosition?: integer;
    prefix?: string;
    isExpanded?: boolean;
}


export interface NoteWithBranch {
    note: Note;
    branch: Branch;
}


export interface SearchOptions {
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