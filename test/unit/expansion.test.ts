/// <reference path="../../node_modules/@types/jasmine/index.d.ts" />
import { Expansion } from "../../src";

import {
    albumMetadata,
    artistMetadata
} from "../common/entities";

describe("expansion", () => {
    describe("toPaths()", () => {
        it("albums/{songs/album/{artist,songs},tags} should equal albums/songs/album/artist,albums/songs/album/songs,albums/tags", () => {
            let exp = Expansion.parse(artistMetadata, `albums/{songs/album/{artist,songs},tags}`);
            let paths = exp[0].toPaths();

            expect(paths.map(p => p.toString()).join(",")).toEqual("albums/songs/album/artist,albums/songs/album/songs,albums/tags");
        });
    });

    describe("toString()", () => {
        it("albums should equal albums", () => {
            let exp = Expansion.parse(artistMetadata, `albums`);

            expect(exp.toString()).toEqual("albums");
        });

        it("albums/songs should equal albums/songs", () => {
            let exp = Expansion.parse(artistMetadata, `albums/songs`);

            expect(exp.toString()).toEqual("albums/songs");
        });

        it("albums/{songs,tags} should equal albums/{songs,tags}", () => {
            let exp = Expansion.parse(artistMetadata, `albums/{songs,tags}`);

            expect(exp.toString()).toEqual("albums/{songs,tags}");
        });
    });

    describe("extract()", () => {
        it("should work", () => {
            let exp = Expansion.parse(artistMetadata, `albums/{songs/album/artist,tags}`);
            // let tagsProp = albumMetadata.navigationProperties.find(n => n.name == "tags");
            // let songsAlbumProp = songMetadata.navigationProperties.find(n => n.name == "album");
            let artistProp = albumMetadata.navigationProperties.find(n => n.name == "artist");
            let extracted = exp[0].extract([artistProp])[0];

            console.log(extracted.path.toString());
            console.log(extracted.extracted.toString());
        });
    });
});
