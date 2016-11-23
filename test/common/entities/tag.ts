import { Entity } from "../../../src";
import { Album } from "./album";
import { TagType } from "./tag-type";

@Entity({
    name: "Tag",
    primaryKey: { name: "id" },
    references: [{
        keyName: "tagTypeId",
        name: "tagType",
        otherType: () => TagType
    }]
})
export class Tag {
    id: number;
    albumId: number;
    album: Album;
    tagTypeId: number;
    tagType: TagType;
}
