import { ReferenceObjectNotFoundError, TypeNotRegisteredError } from './errors';
import { Resolver } from './Resolver';
import { TransportObject } from './TransportObject';

type RerializationReferences = {
    [type: string]: any[];
};

/**
 * 
 * 
 * @class ReferencedObject
 */
class ReferencedObject {
    public type: string;
    public index: number;

    constructor(referenceInfo: { type: string, index: number }) {
        this.type = referenceInfo.type;
        this.index = referenceInfo.index;
    }
}

/**
 * TODO
 * 
 * @export
 * @class TsSerializer
 */
export class TsSerializer {
    private references: RerializationReferences;

    /**
     * TODO
     * 
     * @readonly
     * @type {Resolver}
     * @memberOf TsSerializer
     */
    public get resolver(): Resolver {
        return Resolver.instance;
    }

    /**
     * 
     * 
     * @param {*} objectOrArray
     * @returns {string}
     * 
     * @memberOf TsSerializer
     */
    public serialize(objectOrArray: any): string {
        this.references = {};
        let serialized: any;
        if (objectOrArray.constructor === Array) {
            serialized = objectOrArray.map(o => this.serializeObject(o));
        } else {
            serialized = this.serializeObject(objectOrArray);
        }
        // this.resolveObjectReferences(serialized);
        return JSON.stringify(serialized);
    }

    /**
     * 
     * 
     * @template T
     * @param {string} json
     * @returns {T}
     * 
     * @memberOf TsSerializer
     */
    public deserialize<T>(json: string): T {
        this.references = {};
        const parsed = JSON.parse(json);
        let deserialized: any;
        if (parsed.constructor === Array) {
            deserialized = parsed.map(o => this.deserializeObject(o));
        } else {
            deserialized = this.deserializeObject(parsed);
        }
        this.resolveReferences(deserialized);
        return deserialized;
    }

    /**
     */
    private serializeObject(obj: any): TransportObject {
        if (obj.constructor === Date) {
            return {
                __type: 'Date',
                __value: obj
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

            for (let property of Object.keys(obj).filter(o => typeof obj[o] !== 'function')) {
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
     * 
     * 
     * @private
     * @param {TransportObject} obj
     * @returns {*}
     * 
     * @memberOf TsSerializer
     */
    private deserializeObject(obj: TransportObject): any {
        switch (obj.__type) {
            case 'Date':
                return new Date(obj.__value);
            case 'Number':
                return Number(obj.__value);
            case 'String':
                return String(obj.__value);
            case 'Boolean':
                return Boolean(obj.__value);
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
     * 
     * 
     * @private
     * @param {*} obj
     * @returns {void}
     * 
     * @memberOf TsSerializer
     */
    private resolveReferences(obj: any): void {
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
