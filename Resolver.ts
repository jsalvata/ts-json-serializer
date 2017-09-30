import { DuplicateTypeRegistration } from './errors';
import { SerializableType } from './SerializableType';

/**
 * Resolving instance. Holds the registered types and is the central type "database" for the system.
 * 
 * @export
 * @class Resolver
 */
export class Resolver {
    private static _instance: Resolver;

    /**
     * Actual instance (singleton).
     * 
     * @readonly
     * @static
     * @type {Resolver}
     * @memberOf Resolver
     */
    public static get instance(): Resolver {
        if (!Resolver._instance) {
            Resolver._instance = new Resolver();
        }
        return Resolver._instance;
    }

    /**
     * Hashmap of registered types.
     * 
     * @private
     * @type {{ [name: string]: SerializableType }}
     * @memberOf Resolver
     */
    private types: { [name: string]: SerializableType<any> } = {};

    private constructor() { }

    /**
     * Resets the registered types.
     * May be useful for unit testing.
     * 
     * @memberOf Resolver
     */
    public reset(): void {
        this.types = {};
    }

    /**
     * Add a type to the resolver. Throws if the type is already registered.
     * 
     * @param {SerializableType} model
     * 
     * @memberOf Resolver
     */
    public addType(type: SerializableType<any>): void {
        if (this.types[type.name]) {
            throw new DuplicateTypeRegistration(type.name);
        }

        this.types[type.name] = type;
    }

    /**
     * Searches and returns a type by name.
     * 
     * @param {string} name
     * @returns {(SerializableType | undefined)}
     * 
     * @memberOf Resolver
     */
    public getType(name: string): SerializableType<any> | undefined {
        return this.types[name];
    }

    /**
     * Searches and returns a type by a given object (does compare the contructors).
     * 
     * @param {*} obj
     * @returns {(SerializableType | undefined)}
     * 
     * @memberOf Resolver
     */
    public getTypeByObject(obj: any): SerializableType<any> | undefined {
        return Object.keys(this.types)
            .map(key => this.types[key])
            .find(o => obj.constructor === o.ctor);
    }
}
