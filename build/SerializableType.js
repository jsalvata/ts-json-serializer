"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Instance of a serializable type. Contains the necessary information for the system to serialize
 * and deserialize the types into the json string.
 *
 * @export
 * @class SerializableType
 */
var SerializableType = (function () {
    /**
     * Creates an instance of SerializableType.
     *
     * @param {string} name The name of the registered type.
     * @param {Function} ctor The constructor of the type.
     * @param {(json: any) => T} [factory] Optional factory when the constructor is not default.
     *
     * @memberOf SerializableType
     */
    function SerializableType(name, ctor, factory) {
        this.name = name;
        this.ctor = ctor;
        this.factory = factory;
    }
    return SerializableType;
}());
exports.SerializableType = SerializableType;
