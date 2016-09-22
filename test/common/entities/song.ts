import { Album } from "./album";

export interface Song {
    id: number;
    name: string;
    albumId: number;
    album: Album;
}
