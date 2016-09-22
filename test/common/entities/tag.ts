import { Album } from "./album";
import { TagType } from "./tag-type";

export interface Tag {
    id: number;
    albumId: number;
    album: Album;
    tagTypeId: number;
    tagType: TagType;
}
