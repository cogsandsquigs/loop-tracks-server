import { TrainData } from "./train";

export interface Source {
    name: string;
    getData(): Promise<TrainData>;
}

export interface SourceConstructor {
    name: string;
    // allows us to call the constructor with an api key
    // which makes more generic code possible
    new (apiKey: string): Source;
}
