import { DuplicateTypeRegistration } from './errors';
import { SerializableType } from './SerializableType';

/**
 * TODO
 * 
 * @export
 * @class Resolver
 */
export class Resolver {
    private static _instance: Resolver;

    public static get instance(): Resolver {
        if (!Resolver._instance) {
            Resolver._instance = new Resolver();
        }
        return Resolver._instance;
    }

    private types: { [name: string]: SerializableType } = {};

    private constructor() { }

    /**
     * TODO
     * 
     * @memberOf Resolver
     */
    public reset(): void {
        this.types = {};
    }

    /**
     * TODO
     * 
     * @param {SerializableType} model
     * 
     * @memberOf Resolver
     */
    public addType(type: SerializableType): void {
        if (this.types[type.name]) {
            throw new DuplicateTypeRegistration(type.name);
        }

        this.types[type.name] = type;
    }

    /**
     * TODO
     * 
     * @param {string} name
     * @returns {(SerializableType | undefined)}
     * 
     * @memberOf Resolver
     */
    public getType(name: string): SerializableType | undefined {
        return this.types[name];
    }

    /**
     * 
     * 
     * @param {*} obj
     * @returns {(SerializableType | undefined)}
     * 
     * @memberOf Resolver
     */
    public getTypeByObject(obj: any): SerializableType | undefined {
        return Object.keys(this.types)
            .map(key => this.types[key])
            .find(o => obj.constructor === o.ctor);
    }
}
