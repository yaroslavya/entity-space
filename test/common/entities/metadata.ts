import { EntityMetadata } from "../../../src";

let _albumMetadata = new EntityMetadata({
    name: "Album",
    primaryKey: { name: "id" },
    primitives: [{ name: "name", index: true }]
});

let _albumTagMetadata = new EntityMetadata({
    name: "AlbumTag",
    primaryKey: { name: "id" }
});

let _artistMetadata = new EntityMetadata({
    name: "Artist",
    primaryKey: { name: "id" },
    primitives: [{ name: "name" }]
});

let _songMetadata = new EntityMetadata({
    name: "Song",
    primaryKey: { name: "id" },
    primitives: [{ name: "name" }]
});

let _songTagMetadata = new EntityMetadata({
    name: "SongTag",
    primaryKey: { name: "id" }
});

let _tagMetadata = new EntityMetadata({
    name: "Tag",
    primaryKey: { name: "id" }
});

let _tagTypeMetadata = new EntityMetadata({
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
    otherType: _albumTagMetadata
});

_albumTagMetadata.addReference({
    keyName: "albumId",
    name: "album",
    otherType: _albumMetadata
});

_albumMetadata.addReference({
    keyName: "tagId",
    name: "tag",
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

_songMetadata.addCollection({
    backReferenceKeyName: "songId",
    backReferenceName: "song",
    name: "tags",
    otherType: _songTagMetadata
});

_songTagMetadata.addReference({
    keyName: "songId",
    name: "song",
    otherType: _songMetadata
});

_songTagMetadata.addReference({
    keyName: "tagId",
    name: "tag",
    otherType: _tagMetadata
});

_tagMetadata.addReference({
    keyName: "tagTypeId",
    name: "tagType",
    otherType: _tagTypeMetadata
});

export var albumMetadata = _albumMetadata;
export var albumTagMetadata = _albumTagMetadata;
export var artistMetadata = _artistMetadata;
export var songMetadata = _songMetadata;
export var songTagMetadata = _songTagMetadata;
export var tagMetadata = _tagMetadata;
export var tagTypeMetadata = _tagTypeMetadata;
