import { Resolver } from './Resolver';
/**
 * Main element of this library. Is responsible for the serialization and deserialization of the object structure.
 * Throw it a list (or single) of objects which types are registered and it creates a json string out of it.
 * On the other side, deserialize the whole stream back into instantiated objects.
 *
 * @export
 * @class TsSerializer
 */
export declare class TsSerializer {
    private references;
    /**
     * Instance of the type resolver.
     *
     * @readonly
     * @type {Resolver}
     * @memberOf TsSerializer
     */
    readonly resolver: Resolver;
    /**
     * Serializes a registered object or an array of objects. Creates a special formatted string that can be
     * transmitted and deserialized on the other side.
     *
     * @param {*} objectOrArray The object or array of objects that needs to be serialized.
     * @returns {string}
     *
     * @memberOf TsSerializer
     */
    serialize(objectOrArray: any): string;
    /**
     * Deserializes a string that was serialized by {@link TsSerializer#serialize()}. Does parse the whole
     * string into instantiated objects.
     *
     * @template T
     * @param {string} json Serialized json string.
     * @returns {T}
     *
     * @memberOf TsSerializer
     */
    deserialize<T>(json: string): T;
    /**
     * Recursive function that serializes the objects. Returns a structure of the value and the type reference.
     * References to already existing objects (like circular references) are also resolved.
     *
     * @private
     * @param {*} obj
     * @returns {TransportObject}
     *
     * @memberOf TsSerializer
     */
    private serializeObject(obj);
    /**
     * Recursive deserialize function that resolves the type names to their instantiated types.
     * References are resolved at last, since the whole object tree needs to be built first.
     *
     * @private
     * @param {TransportObject} obj
     * @returns {*}
     *
     * @memberOf TsSerializer
     */
    private deserializeObject(obj);
    /**
     * Resolves the referenced objects to actual instances as soon as the whole object tree is built. Is only needed
     * during deserialization.
     *
     * @private
     * @param {*} obj
     * @returns {void}
     *
     * @memberOf TsSerializer
     */
    private resolveReferences(obj);
}
