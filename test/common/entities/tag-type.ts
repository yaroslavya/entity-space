import { Entity } from "../../../src";

@Entity({
    name: "TagType",
    primaryKey: { name: "id" },
    primitives: [{ name: "name" }]
})
export class TagType {
    id: number;
    name: string;
}
