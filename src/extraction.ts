import { Expansion } from "./expansion";
import { Path } from "./path";

export class Extraction {
    private _path: Path;
    get path(): Path { return this._path };

    private _extracted: Expansion;
    get extracted(): Expansion { return this._extracted };

    constructor(args: {
        path?: Path;
        extracted: Expansion;
    }) {
        this._path = args.path || null;
        this._extracted = args.extracted;
    }
}
