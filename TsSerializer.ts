import { ReferenceObjectNotFoundError, TypeNotRegisteredError, UndefinedInputError } from './errors';
import { Resolver } from './Resolver';
import { TransportObject } from './TransportObject';

/**
 * Hash that holds the references to the serialized or deserialized objects. Used to resolve references.
 */
type SerializationReferences = {
    [type: string]: any[];
};

/**
 * Referenced object during deserialization. Since the whole type tree needs to be built before the references
 * can be resolved, this intermediate object does serve this purpose.
 * 
 * @class ReferencedObject
 */
class ReferencedObject {
    /**
     * The typename of the reference.
     * 
     * @type {string}
     * @memberOf ReferencedObject
     */
    public type: string;

    /**
     * Then index of the referenced object in the type instance array.
     * 
     * @type {number}
     * @memberOf ReferencedObject
     */
    public index: number;

    constructor(referenceInfo: { type: string, index: number }) {
        this.type = referenceInfo.type;
        this.index = referenceInfo.index;
    }
}

/**
 * Main element of this library. Is responsible for the serialization and deserialization of the object structure.
 * Throw it a list (or single) of objects which types are registered and it creates a json string out of it.
 * On the other side, deserialize the whole stream back into instantiated objects.
 * 
 * @export
 * @class TsSerializer
 */
export class TsSerializer {
    private references: SerializationReferences;

    /**
     * Instance of the type resolver.
     * 
     * @readonly
     * @type {Resolver}
     * @memberOf TsSerializer
     */
    public get resolver(): Resolver {
        return Resolver.instance;
    }

    /**
     * Serializes a registered object or an array of objects. Creates a special formatted string that can be
     * transmitted and deserialized on the other side.
     * 
     * @param {*} objectOrArray The object or array of objects that needs to be serialized.
     * @returns {string}
     * 
     * @memberOf TsSerializer
     */
    public serialize(objectOrArray: any): string {
        if (objectOrArray === undefined) {
            throw new UndefinedInputError('serialize');
        }
        this.references = {};
        let serialized: any;
        if (objectOrArray !== null && objectOrArray.constructor === Array) {
            serialized = objectOrArray.map(o => this.serializeObject(o)).filter(o => o !== undefined);
        } else {
            serialized = this.serializeObject(objectOrArray);
        }
        return JSON.stringify(serialized);
    }

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
    public deserialize<T>(json: string): T {
        if (json === undefined) {
            throw new UndefinedInputError('deserialize');
        }
        this.references = {};
        const parsed = JSON.parse(json);
        let deserialized: any;
        if (parsed !== null && parsed.constructor === Array) {
            deserialized = parsed.map(o => this.deserializeObject(o));
        } else {
            deserialized = this.deserializeObject(parsed);
        }
        this.resolveReferences(deserialized);
        return deserialized;
    }

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
    private serializeObject(obj: any): TransportObject | undefined {
        if (obj === undefined || (obj && !obj.constructor)) {
            return;
        } else if (obj === null) {
            return {
                __type: 'null',
                __value: null
            };
        } else if (obj.constructor === Date) {
            return {
                __type: 'Date',
                __value: obj
            };
        } else if (obj.constructor === Array) {
            return {
                __type: 'Array',
                __value: obj.map(o => this.serializeObject(o))
            };
        } else if (typeof obj === 'object') {
            const type = this.resolver.getTypeByObject(obj),
                transformedObj: any = {};
            if (!type) {
                throw new TypeNotRegisteredError(obj);
            }

            if (!this.references[type.name]) {
                this.references[type.name] = [];
            }

            const alreadyIndexed = this.references[type.name].find(o => o === obj);

            if (alreadyIndexed) {
                return {
                    __type: 'ref',
                    __value: {
                        type: type.name,
                        index: this.references[type.name].indexOf(obj)
                    }
                };
            } else {
                this.references[type.name].push(obj);
            }

            for (let property of Object.keys(obj).filter(o => typeof obj[o] !== 'function' && typeof obj[o] !== 'undefined')) {
                transformedObj[property] = this.serializeObject(obj[property]);
            }
            return {
                __type: type.name,
                __value: transformedObj
            };
        } else {
            return {
                __type: obj.constructor.name,
                __value: obj
            };
        }
    }

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
    private deserializeObject(obj: TransportObject): any {
        switch (obj.__type) {
            case 'null':
                return null;
            case 'Date':
                return new Date(obj.__value);
            case 'Number':
                return Number(obj.__value);
            case 'String':
                return String(obj.__value);
            case 'Boolean':
                return Boolean(obj.__value);
            case 'Array':
                return obj.__value.map(o => this.deserializeObject(o));
            case 'ref':
                return new ReferencedObject(obj.__value);
            default:
                const type = this.resolver.getType(obj.__type),
                    transformedObj: any = {};

                if (!type) {
                    throw new TypeNotRegisteredError(obj);
                }

                for (let property of Object.keys(obj.__value)) {
                    transformedObj[property] = this.deserializeObject(obj.__value[property]);
                }

                const createdObj = type.factory ?
                    type.factory(transformedObj) :
                    Object.assign(new (type as any).ctor(), transformedObj);

                if (!this.references[type.name]) {
                    this.references[type.name] = [];
                }
                this.references[type.name].push(createdObj);

                return createdObj;
        }
    }

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
    private resolveReferences(obj: any): void {
        if (obj === null) {
            return;
        }
        for (let property of Object.keys(obj)) {
            const prop = obj[property];
            if (prop instanceof ReferencedObject) {
                if (!this.references[prop.type]) {
                    throw new ReferenceObjectNotFoundError();
                }
                obj[property] = this.references[prop.type][prop.index];
            } else if (typeof prop === 'object') {
                this.resolveReferences(prop);
            }
        }
    }
}
