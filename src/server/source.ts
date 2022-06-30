import { TrainData } from "./train";

export interface Source {
    name: string;
    getData(): Promise<TrainData>;
}
