import { Artist } from "./artist";
import { Song } from "./song";
import { AlbumTag } from "./album-tag";

export interface Album {
    id: number;
    name: string;
    artistId: number;
    artist: Artist;
    songs: Song[];
    tags: AlbumTag[];
}
