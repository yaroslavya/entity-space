import { Entity } from "../../../src";
import { Album } from "./album";
import { Tag } from "./tag";

@Entity({
    name: "AlbumTag",
    primaryKey: { name: "id" },
    references: [{
        keyName: "albumId",
        name: "album",
        otherType: () => Album
    }]
})
export class AlbumTag {
    id: number;
    albumId: number;
    album: Album;
    tagId: number;
    tag: Tag;
}
