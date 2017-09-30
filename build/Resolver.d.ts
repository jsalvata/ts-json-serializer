import { SerializableType } from './SerializableType';
/**
 * Resolving instance. Holds the registered types and is the central type "database" for the system.
 *
 * @export
 * @class Resolver
 */
export declare class Resolver {
    private static _instance;
    /**
     * Actual instance (singleton).
     *
     * @readonly
     * @static
     * @type {Resolver}
     * @memberOf Resolver
     */
    static readonly instance: Resolver;
    /**
     * Hashmap of registered types.
     *
     * @private
     * @type {{ [name: string]: SerializableType }}
     * @memberOf Resolver
     */
    private types;
    private constructor();
    /**
     * Resets the registered types.
     * May be useful for unit testing.
     *
     * @memberOf Resolver
     */
    reset(): void;
    /**
     * Add a type to the resolver. Throws if the type is already registered.
     *
     * @param {SerializableType} model
     *
     * @memberOf Resolver
     */
    addType(type: SerializableType<any>): void;
    /**
     * Searches and returns a type by name.
     *
     * @param {string} name
     * @returns {(SerializableType | undefined)}
     *
     * @memberOf Resolver
     */
    getType(name: string): SerializableType<any> | undefined;
    /**
     * Searches and returns a type by a given object (does compare the contructors).
     *
     * @param {*} obj
     * @returns {(SerializableType | undefined)}
     *
     * @memberOf Resolver
     */
    getTypeByObject(obj: any): SerializableType<any> | undefined;
}
