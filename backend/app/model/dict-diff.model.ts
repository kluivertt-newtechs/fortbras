export interface DictDiff {
    file: string;
    fields: DictDiffField[]
}

export interface DictDiffField {
    name: string;
    diffs: DiffValue[]
}

export interface DiffValue {
    old: string[];
    new: string[]
}
