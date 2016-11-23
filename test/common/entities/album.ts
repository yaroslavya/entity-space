import { Entity } from "../../../src";
import { Artist } from "./artist";
import { Song } from "./song";
import { AlbumTag } from "./album-tag";

@Entity({
    name: "Album",
    primaryKey: { name: "id" },
    primitives: [{ name: "name", index: true }],
    references: [{
        keyName: "artistId",
        name: "artist",
        otherType: () => Artist
    }],
    collections: [
        {
            backReferenceKeyName: "albumId",
            backReferenceName: "album",
            name: "songs", otherType: () => Song
        },
        {
            backReferenceKeyName: "albumId",
            backReferenceName: "album",
            name: "tags",
            otherType: () => AlbumTag
        }
    ]
})
export class Album {
    id: number;
    name: string;
    artistId: number;
    artist: Artist;
    songs: Song[];
    tags: AlbumTag[];
}
