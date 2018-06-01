import { BaseModel } from './../interfaces/base-model.interface';

export class Update<T extends BaseModel> {

    constructor(
        public method: string,
        public value: T
    ) {}

}