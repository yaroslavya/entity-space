import { Album } from "./album";

export interface Artist {
    id: number;
    name: string;
    albums: Album[];
}
