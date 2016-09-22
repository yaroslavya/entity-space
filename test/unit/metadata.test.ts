/// <reference path="../../typings/index.d.ts" />
import {
    albumMetadata,
    artistMetadata,
    songMetadata
} from "../common/entities";


describe("entity-metadata", () => {
    it("should have proper type name", () => {
        expect(albumMetadata.name).toEqual("Album");
        expect(artistMetadata.name).toEqual("Artist");
        expect(songMetadata.name).toEqual("Song");
    });
});
