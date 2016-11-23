import { getEntityMetadata, EntityMetadata } from "../../src";
import { Album, Artist, Song } from "../common/entities";

describe("getEntityMetadata", () => {
    it("should work for Album, Artist, Song", () => {
        expect(getEntityMetadata(Album) instanceof EntityMetadata).toBe(true);
        expect(getEntityMetadata(Artist) instanceof EntityMetadata).toBe(true);
        expect(getEntityMetadata(Song) instanceof EntityMetadata).toBe(true);
    });
});
