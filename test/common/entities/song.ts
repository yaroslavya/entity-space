import { Album } from "./album";
import { SongTag } from "./song-tag";

export interface Song {
    id: number;
    name: string;
    albumId: number;
    album: Album;
    tags: SongTag[];
}
