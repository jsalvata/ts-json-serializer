/**
 * TODO
 * 
 * @export
 * @class SerializableType
 */
export class SerializableType {
    constructor(public name: string, public ctor: Function, public factory?: <T>(json: any) => T) { }
}
