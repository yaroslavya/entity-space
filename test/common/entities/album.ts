import { Artist } from "./artist";
import { Song } from "./song";
import { Tag } from "./tag";

export interface Album {
    id: number;
    name: string;
    artistId: number;
    artist: Artist;
    songs: Song[];
    tags: Tag[];
}
