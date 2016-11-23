import { Entity } from "../../../src";
import { Album } from "./album";

@Entity({
    name: "Artist",
    primaryKey: { name: "id" },
    primitives: [{ name: "name" }],
    collections: [{
        backReferenceKeyName: "artistId",
        backReferenceName: "artist",
        name: "albums",
        otherType: () => Album
    }]
})
export class Artist {
    id: number;
    name: string;
    albums: Album[];
}
