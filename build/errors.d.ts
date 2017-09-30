/**
 * Error that is thrown when a class has a constructor with parameters. So you need to provide a factory
 * method to actually instantiate the class and call the constructor by yourself.
 *
 * @export
 * @class NoFactoryProvidedError
 */
export declare class NoFactoryProvidedError extends Error {
    constructor(typeName: string);
}
/**
 * Error hat is thrown when a type is duplicated. Either use the naming system or call it by another name ;-)
 *
 * @export
 * @class DuplicateTypeRegistration
 */
export declare class DuplicateTypeRegistration extends Error {
    constructor(typeName: string);
}
/**
 * Error hat is thrown when function.name is not callable (when using in the browser or so). So you need to
 * provide a name for the resolver system.
 *
 * @export
 * @class NoNameProvided
 */
export declare class NoNameProvided extends Error {
    constructor();
}
/**
 * Error hat is thrown when a type that is beeing serialized or deserialized is not found in the resolver system.
 * A possible cause could be that you forgot @Serializabe() on the type.
 *
 * @export
 * @class TypeNotRegisteredError
 */
export declare class TypeNotRegisteredError extends Error {
    constructor(obj: any);
}
/**
 * Error hat is thrown when a referenced object is not found.
 *
 * @export
 * @class ReferenceObjectNotFoundError
 */
export declare class ReferenceObjectNotFoundError extends Error {
    constructor();
}
/**
 * Error that is thrown when an input to deserialize or serialize is undefined.
 *
 * @export
 * @class UndefinedInputError
 */
export declare class UndefinedInputError extends Error {
    constructor(functionname: string);
}
