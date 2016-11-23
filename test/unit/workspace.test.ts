import { Workspace } from "../../src";
import {
    Album,
    Artist,
    Song
} from "../common/entities";


// todo: do expects
describe("data-workspace", () => {
    it("byIndex()", () => {
        let ws = new Workspace();
        let numArtists = 200;
        let numAlbums = 3;
        let numSongs = 10;
        let albumId = 1;
        let songId = 1;

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

            ws.add({
                entity: artist,
                type: Artist,
                expansion: `albums/songs`
            });
        }

        let albums = ws.byIndex<Album>({
            type: Album,
            index: "artistId",
            value: 64,
            expansion: `songs,artist`
        })._toArray();

        expect(albums.length).toBe(numAlbums);
        expect(albums.map(a => a.songs.length).reduce((a, b) => a + b)).toBe(numAlbums * numSongs);
    });

    it("all()", () => {
        let ws = new Workspace();
        let numArtists = 10;
        let numAlbums = 3;
        let numSongs = 10;
        let albumId = 1;
        let songId = 1;

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

            ws.add({
                entity: artist,
                type: Artist,
                expansion: `albums/songs`
            });
        }

        let artists = ws.all<Artist>({
            type: Artist,
            expansion: `albums/{songs/album, artist}`
        })._toArray();

        let numLoadedAlbums = artists.map(a => a.albums.length).reduce((p, c) => p + c);
        let numLoadedSongs = artists.map(a => a.albums.map(a => a.songs.length).reduce((a, c) => a + c)).reduce((p, c) => p + c);

        expect(numLoadedAlbums).toBe(numArtists * numAlbums);
        expect(numLoadedSongs).toBe(numArtists * numAlbums * numSongs);
    });
});
