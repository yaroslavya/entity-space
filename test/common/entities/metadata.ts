import { Metadata } from "../../../src";

let _albumMetadata = new Metadata({
    name: "Album",
    primaryKey: { name: "id" },
    primitives: [{ name: "name", index: true }]
});

let _artistMetadata = new Metadata({
    name: "Artist",
    primaryKey: { name: "id" },
    primitives: [{ name: "name" }]
});

let _songMetadata = new Metadata({
    name: "Song",
    primaryKey: { name: "id" },
    primitives: [{ name: "name" }]
});

let _tagMetadata = new Metadata({
    name: "Tag",
    primaryKey: { name: "id" }
});

let _tagTypeMetadata = new Metadata({
    name: "TagType",
    primaryKey: { name: "id" },
    primitives: [{ name: "name" }]
});

_albumMetadata.addReference({
    keyName: "artistId",
    name: "artist",
    otherType: _artistMetadata
});

_albumMetadata.addCollection({
    backReferenceKeyName: "albumId",
    backReferenceName: "album",
    name: "songs",
    otherType: _songMetadata
});

_albumMetadata.addCollection({
    backReferenceKeyName: "albumId",
    backReferenceName: "album",
    name: "tags",
    otherType: _tagMetadata
});

_artistMetadata.addCollection({
    backReferenceKeyName: "artistId",
    backReferenceName: "artist",
    name: "albums",
    otherType: _albumMetadata
});

_songMetadata.addReference({
    keyName: "albumId",
    name: "album",
    otherType: _albumMetadata
});

_tagMetadata.addReference({
    keyName: "tagTypeId",
    name: "tagType",
    otherType: _tagTypeMetadata
});

export var albumMetadata = _albumMetadata;
export var artistMetadata = _artistMetadata;
export var songMetadata = _songMetadata;
export var tagMetadata = _tagMetadata;
export var tagTypeMetadata = _tagTypeMetadata;
