import { Album } from "./album";
import { Tag } from "./tag";

export interface AlbumTag {
    id: number;
    albumId: number;
    album: Album;
    tagId: number;
    tag: Tag;
}
