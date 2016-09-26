import { Query, Expansion } from "../../src/";

import {
    albumMetadata,
    artistMetadata,
    songMetadata,
} from "../common/entities";

describe("data-query", () => {
    // todo: more combinations are possiberu
    // todo: byKey & byIndex combinations are missing
    describe("isSuperset()/isSubsetOf()", () => {
        it("all:artist/albums/{songs,tags} should be superset of all:artist", () => {
            let a = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            let b = new Query.All({
                entityType: artistMetadata
            });

            expect(a.isSuperSetOf(b)).toEqual(true);
            expect(b.isSuperSetOf(a)).toEqual(false);
            expect(a.isSubsetOf(b)).toEqual(false);
            expect(b.isSubsetOf(a)).toEqual(true);
        });

        it("all:artist/albums/{songs,tags} should be superset of all:artist/albums", () => {
            let a = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            let b = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums`)
            });

            expect(a.isSuperSetOf(b)).toEqual(true);
            expect(b.isSuperSetOf(a)).toEqual(false);
            expect(a.isSubsetOf(b)).toEqual(false);
            expect(b.isSubsetOf(a)).toEqual(true);
        });

        it("all:artist/albums/{songs,tags} should be superset of all:artist/albums/songs", () => {
            let a = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            let b = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/songs`)
            });

            expect(a.isSuperSetOf(b)).toEqual(true);
            expect(b.isSuperSetOf(a)).toEqual(false);
            expect(a.isSubsetOf(b)).toEqual(false);
            expect(b.isSubsetOf(a)).toEqual(true);
        });

        it("all:artist/albums/{songs,tags} should be superset of all:artist/albums/{songs,tags}", () => {
            let a = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            let b = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            expect(a.isSuperSetOf(b)).toEqual(true);
            expect(b.isSuperSetOf(a)).toEqual(true);
            expect(a.isSubsetOf(b)).toEqual(true);
            expect(b.isSubsetOf(a)).toEqual(true);
        });

        it("all:artist/albums/{songs,tags} should be superset of all:artist/albums/{tags,songs}", () => {
            let a = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            let b = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            expect(a.isSuperSetOf(b)).toEqual(true);
            expect(b.isSuperSetOf(a)).toEqual(true);
            expect(a.isSubsetOf(b)).toEqual(true);
            expect(b.isSubsetOf(a)).toEqual(true);
        });

        it("all:artist/albums/{songs,tags} should be superset of byKey:artist/albums/{songs,tags}", () => {
            let a = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            let b = new Query.ByKey({
                key: 1,
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            expect(a.isSuperSetOf(b)).toEqual(true);
            expect(b.isSuperSetOf(a)).toEqual(false);
            expect(a.isSubsetOf(b)).toEqual(false);
            expect(b.isSubsetOf(a)).toEqual(true);
        });

        it("all:albums/{songs,tags} should be superset of byIndex:albums/{songs,tags}", () => {
            let a = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(albumMetadata, `songs,tags`)
            });

            let b = new Query.ByIndex({
                index: "artistId",
                value: 1,
                entityType: artistMetadata,
                expansions: Expansion.parse(albumMetadata, `songs,tags`)
            });

            expect(a.isSuperSetOf(b)).toEqual(true);
            expect(b.isSuperSetOf(a)).toEqual(false);
            expect(a.isSubsetOf(b)).toEqual(false);
            expect(b.isSubsetOf(a)).toEqual(true);
        });
    });

    describe("toString()", () => {
        it("all: Artist/albums/{songs,tags}", () => {
            let q = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            expect(q.toString()).toEqual("Artist/albums/{songs,tags}");
        });

        it("byKey: Artist(64)/albums/{songs,tags}", () => {
            let q = new Query.ByKey({
                key: 64,
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            expect(q.toString()).toEqual("Artist(64)/albums/{songs,tags}");
        });

        it("byKeys: Artist(64,1337,42,23)/albums/{songs,tags}", () => {
            let q = new Query.ByKeys({
                keys: [64, 1337, 42, 23],
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            expect(q.toString()).toEqual("Artist(64,1337,42,23)/albums/{songs,tags}");
        });
    });

    describe("extract()", () => {
        it("should work (simple)", () => {
            let q = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs,tags}`)
            });

            let songsProp = albumMetadata.navigationProperties.find(np => np.name == "songs");
            let tagsProp = albumMetadata.navigationProperties.find(np => np.name == "tags");

            let extracted = q.extract([
                songsProp
            ]);

            expect(q.toString()).toEqual(`Artist/albums/tags`);
            expect(extracted[0].path.toString()).toEqual("albums");
            expect(extracted[0].extracted.toString()).toEqual("songs");

            extracted = q.extract([
                tagsProp
            ]);

            expect(q.toString()).toEqual(`Artist/albums`);
            expect(extracted[0].path.toString()).toEqual("albums");
            expect(extracted[0].extracted.toString()).toEqual("tags");
        });

        it("should work (complex #1)", () => {
            let q = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs/album/artist,tags}`)
            });

            let artistProp = albumMetadata.navigationProperties.find(np => np.name == "artist");
            let songAlbumProp = songMetadata.navigationProperties.find(np => np.name == "album");

            let extracted = q.extract([
                artistProp
            ]);

            expect(q.toString()).toEqual(`Artist/albums/{songs/album,tags}`);
            expect(extracted[0].path.toString()).toEqual("albums/songs/album");
            expect(extracted[0].extracted.toString()).toEqual("artist");

            extracted = q.extract([
                songAlbumProp
            ]);

            expect(q.toString()).toEqual(`Artist/albums/{songs,tags}`);
            expect(extracted[0].path.toString()).toEqual("albums/songs");
            expect(extracted[0].extracted.toString()).toEqual("album");
        });

        it("should work (complex #2)", () => {
            let q = new Query.All({
                entityType: artistMetadata,
                expansions: Expansion.parse(artistMetadata, `albums/{songs/album/artist,tags}`)
            });

            let artistProp = albumMetadata.navigationProperties.find(np => np.name == "artist");
            let songsProp = albumMetadata.navigationProperties.find(np => np.name == "songs");

            let extracted = q.extract([
                artistProp
            ]);

            expect(q.toString()).toEqual(`Artist/albums/{songs/album,tags}`);
            expect(extracted[0].path.toString()).toEqual("albums/songs/album");
            expect(extracted[0].extracted.toString()).toEqual("artist");

            extracted = q.extract([
                songsProp
            ]);

            expect(q.toString()).toEqual(`Artist/albums/tags`);
            expect(extracted[0].path.toString()).toEqual("albums");
            expect(extracted[0].extracted.toString()).toEqual("songs/album");
        });
    });
});
