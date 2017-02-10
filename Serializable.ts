import { SerializableType } from './SerializableType';
import { Resolver } from './Resolver';
import { TransportObject } from './TransportObject';
import { NoFactoryProvidedError, NoNameProvided } from './errors';

/**
 * 
 * 
 * @export
 * @interface SerializableOptions
 */
export interface SerializableOptions {
    name?: string;
    factory?: <T>(json: TransportObject) => T;
};

/**
 * TODO
 * 
 * @export
 * @param {SerializableOptions} [options]
 * @returns {ClassDecorator}
 */
export function Serializable(options?: SerializableOptions): ClassDecorator {
    return (type: Function) => {
        const name = options && options.name ? options.name : (type as any).name;
        if (type.length > 0 && (!options || !options.factory)) {
            throw new NoFactoryProvidedError(name);
        }
        if (!name) {
            throw new NoNameProvided();
        }
        Resolver.instance.addType(new SerializableType(name, type, options ? options.factory : undefined));
    };
}
