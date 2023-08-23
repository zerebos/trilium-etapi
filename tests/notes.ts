import {Note} from "../src";

export const rootNote: Note = {
    noteId: "root",
    isProtected: false,
    title: "root",
    type: "text",
    mime: "text/html",
    dateCreated: "2023-08-09 07:56:39.694+0000",
    dateModified: "2023-08-09 07:56:39.697+0000",
    utcDateCreated: "2023-08-09 07:56:39.696Z",
    utcDateModified: "2023-08-09 07:56:39.697Z",
    parentNoteIds: [],
    childNoteIds: [
      "nGKHuLuLpUfO", "qgF4G8MK3LkU",
      "pBgm0lK9Lcxb", "szN2wstiDf9V",
      "jIxeZekrWxYN", "AbETLIFPIha4",
      "YGhu4gkZPJ3a", "6cbvwt2gf2pr",
      "FPBIEl9egWsD", "KAM7w0D2VFx0",
      "BlW9CuARl4h3", "s1M3NmyKnLRp",
      "Xju9xviJGlJu", "LZHe7mENRdc1",
      "QA0nG3oeRmE5", "cUwg9ZTA2TZG",
      "sIjSxsbJts9u", "23IjgF751mT1",
      "_hidden"
    ],
    parentBranchIds: ["none_root"],
    childBranchIds: [
      "root_nGKHuLuLpUfO", "root_qgF4G8MK3LkU",
      "root_pBgm0lK9Lcxb", "root_szN2wstiDf9V",
      "root_jIxeZekrWxYN", "root_AbETLIFPIha4",
      "root_YGhu4gkZPJ3a", "root_6cbvwt2gf2pr",
      "root_FPBIEl9egWsD", "root_KAM7w0D2VFx0",
      "root_BlW9CuARl4h3", "root_s1M3NmyKnLRp",
      "root_Xju9xviJGlJu", "root_LZHe7mENRdc1",
      "root_QA0nG3oeRmE5", "root_cUwg9ZTA2TZG",
      "root_sIjSxsbJts9u", "root_23IjgF751mT1",
      "root__hidden"
    ],
    attributes: []
};

export const firstLevelNote: Note = {
    noteId: "fvhtO7R9tIby",
    isProtected: false,
    title: "Mock Tree ETAPI",
    type: "text",
    mime: "text/html",
    dateCreated: "2023-08-23 02:54:52.011-0400",
    dateModified: "2023-08-23 02:55:00.872-0400",
    utcDateCreated: "2023-08-23 06:54:52.014Z",
    utcDateModified: "2023-08-23 06:55:00.872Z",
    parentNoteIds: [ "root" ],
    childNoteIds: [ "j68Q0uTr3fE6", "UE71I1Fs9Kef" ],
    parentBranchIds: [ "root_fvhtO7R9tIby" ],
    childBranchIds: [ "fvhtO7R9tIby_j68Q0uTr3fE6", "fvhtO7R9tIby_UE71I1Fs9Kef" ],
    attributes: []
};

export const secondLevelNotes: Note[] = [
    {
        noteId: "j68Q0uTr3fE6",
        isProtected: false,
        title: "Child Note",
        type: "text",
        mime: "text/html",
        dateCreated: "2023-08-23 02:55:03.005-0400",
        dateModified: "2023-08-23 02:55:20.392-0400",
        utcDateCreated: "2023-08-23 06:55:03.005Z",
        utcDateModified: "2023-08-23 06:55:20.392Z",
        parentNoteIds: [ "fvhtO7R9tIby" ],
        childNoteIds: [ "vSWC18bcXQQo" ],
        parentBranchIds: [ "fvhtO7R9tIby_j68Q0uTr3fE6" ],
        childBranchIds: [ "j68Q0uTr3fE6_vSWC18bcXQQo" ],
        attributes: []
    },
    {
        noteId: "UE71I1Fs9Kef",
        isProtected: false,
        title: "Other Child Note",
        type: "text",
        mime: "text/html",
        dateCreated: "2023-08-23 02:55:23.496-0400",
        dateModified: "2023-08-23 02:55:27.477-0400",
        utcDateCreated: "2023-08-23 06:55:23.496Z",
        utcDateModified: "2023-08-23 06:55:27.477Z",
        parentNoteIds: [ "fvhtO7R9tIby" ],
        childNoteIds: [ "vSWC18bcXQQo", "Sdh6PFosQw1u" ],
        parentBranchIds: [ "fvhtO7R9tIby_UE71I1Fs9Kef" ],
        childBranchIds: [ "UE71I1Fs9Kef_vSWC18bcXQQo", "UE71I1Fs9Kef_Sdh6PFosQw1u" ],
        attributes: [
        {
            attributeId: "ByIackAMiG3v",
            noteId: "UE71I1Fs9Kef",
            type: "label",
            name: "someAttribute",
            value: "Value",
            position: 10,
            isInheritable: false,
            utcDateModified: "2023-08-23 06:59:36.596Z"
        }
        ]
    }
];


export const thirdLevelNotes: Note[] = [
    {
        noteId: "Sdh6PFosQw1u",
        isProtected: false,
        title: "Other Sub Child Note",
        type: "text",
        mime: "text/html",
        dateCreated: "2023-08-23 02:55:34.469-0400",
        dateModified: "2023-08-23 02:55:39.174-0400",
        utcDateCreated: "2023-08-23 06:55:34.469Z",
        utcDateModified: "2023-08-23 06:55:39.174Z",
        parentNoteIds: [ "UE71I1Fs9Kef" ],
        childNoteIds: [],
        parentBranchIds: [ "UE71I1Fs9Kef_Sdh6PFosQw1u" ],
        childBranchIds: [],
        attributes: []
    },
    {
        noteId: "vSWC18bcXQQo",
        isProtected: false,
        title: "Sub Child Note",
        type: "text",
        mime: "text/html",
        dateCreated: "2023-08-23 02:55:29.211-0400",
        dateModified: "2023-08-23 02:55:32.845-0400",
        utcDateCreated: "2023-08-23 06:55:29.211Z",
        utcDateModified: "2023-08-23 06:55:32.845Z",
        parentNoteIds: [ "j68Q0uTr3fE6", "UE71I1Fs9Kef" ],
        childNoteIds: [],
        parentBranchIds: [ "j68Q0uTr3fE6_vSWC18bcXQQo", "UE71I1Fs9Kef_vSWC18bcXQQo" ],
        childBranchIds: [],
        attributes: []
    }    
];

export default [rootNote, firstLevelNote, secondLevelNotes, thirdLevelNotes].flat();