/// <reference path="../../typings/index.d.ts" />
import { Workspace } from "../../src";
import {
    Album, albumMetadata,
    Artist, artistMetadata,
    Song, songMetadata
} from "../common/entities";


// todo: do expects
xdescribe("data-workspace", () => {
    it("byIndex()", () => {
        let dws = new Workspace();
        dws.addType(albumMetadata);
        dws.addType(artistMetadata);
        dws.addType(songMetadata);

        let numArtists = 10;
        let numAlbums = 3;
        let numSongs = 10;

        let albumId = 1;
        let songId = 1;
        let now = new Date();

        for (let i = 0; i < numArtists; ++i) {
            let artist = <Artist>{
                id: i,
                name: i.toString()
            };

            let albums = new Array<Album>();

            for (let e = 0; e < numAlbums; ++e) {
                let album = <Album>{
                    id: albumId++,
                    artist: artist,
                    artistId: artist.id
                };

                album.name = album.id.toString()

                let songs = new Array<Song>();

                for (let j = 0; j < numSongs; ++j) {
                    let song = <Song>{
                        id: songId++,
                        album: album,
                        albumId: album.id
                    };

                    song.name = song.id.toString();
                    songs.push(song);
                }

                album.songs = songs;
                albums.push(album);
            }

            artist.albums = albums;

            dws.add({
                entity: artist,
                type: "Artist",
                expansion: `albums/songs`
            });
        }

        console.log(`adding took ${new Date().getTime() - now.getTime()}ms`);
        now = new Date();

        // let artists = dws.byIndex({
        //     type: Album,
        //     index: "artistId",
        //     value: 300,
        //     expansion: `songs,artist`
        // });

        console.log(`loading took ${new Date().getTime() - now.getTime()}ms`);
    });

    it("all()", () => {
        let dws = new Workspace();
        dws.addType(albumMetadata);
        dws.addType(artistMetadata);
        dws.addType(songMetadata);

        let numArtists = 10;
        let numAlbums = 3;
        let numSongs = 10;

        let albumId = 1;
        let songId = 1;
        let now = new Date();

        for (let i = 0; i < numArtists; ++i) {
            let artist = <Artist>{
                id: i,
                name: i.toString()
            };

            let albums = new Array<Album>();

            for (let e = 0; e < numAlbums; ++e) {
                let album = <Album>{
                    id: albumId++,
                    artist: artist,
                    artistId: artist.id
                };

                album.name = album.id.toString()

                let songs = new Array<Song>();

                for (let j = 0; j < numSongs; ++j) {
                    let song = <Song>{
                        id: songId++,
                        album: album,
                        albumId: album.id
                    };

                    song.name = song.id.toString();

                    songs.push(song);
                }

                album.songs = songs;
                albums.push(album);
            }

            artist.albums = albums;

            dws.add({
                entity: artist,
                type: "Artist",
                expansion: `albums/songs`
            });
        }

        console.log(`adding took ${new Date().getTime() - now.getTime()}ms`);
        now = new Date();

        let artists = dws.all({
            type: "Artist",
            expansion: `albums/{songs/album, artist}`
        });

        console.log(`loading took ${new Date().getTime() - now.getTime()}ms`);
        // console.log(artists);
    });
});
