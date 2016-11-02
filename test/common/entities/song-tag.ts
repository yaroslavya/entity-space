import { Song } from "./song";
import { Tag } from "./tag";

export interface SongTag {
    id: number;
    songId: number;
    song: Song;
    tagId: number;
    tag: Tag;
}
