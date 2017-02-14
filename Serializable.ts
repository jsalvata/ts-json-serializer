import { SerializableType } from './SerializableType';
import { Resolver } from './Resolver';
import { NoFactoryProvidedError, NoNameProvided } from './errors';

/**
 * Interface for the options object that can be used to configure the type in the resolver.
 * 
 * @export
 * @interface SerializableOptions
 */
export interface SerializableOptions {
    /**
     * The name of the type. When the class mangled or function.name does not work,
     * you should add a name for the resolver.
     * 
     * @type {string}
     * @memberOf SerializableOptions
     */
    name?: string;

    /**
     * Factory function of the type. Must be used when the class has no default, parameterless constructor.
     * Does receive the json / plain object version of the object and should instantiate the effective type.
     * 
     * @type {<T>(json: any) => T}
     * @memberOf SerializableOptions
     */
    factory?: <T>(json: any) => T;
};

/**
 * Class decorator for serializable types. Those registered type can be translated into the transport-json
 * structure. All types (with exception of the primitive and date types) must be registered to be transportable.
 * 
 * @export
 * @param {SerializableOptions} [options] Configuration object for the type, contains an optional name and factory.
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
