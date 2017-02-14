/**
 * Instance of a serializable type. Contains the necessary information for the system to serialize
 * and deserialize the types into the json string.
 * 
 * @export
 * @class SerializableType
 */
export class SerializableType {
    /**
     * Creates an instance of SerializableType.
     * 
     * @param {string} name The name of the registered type.
     * @param {Function} ctor The constructor of the type.
     * @param {<T>(json: any) => T} [factory] Optional factory when the constructor is not default.
     * 
     * @memberOf SerializableType
     */
    constructor(public name: string, public ctor: Function, public factory?: <T>(json: any) => T) { }
}
