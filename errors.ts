/**
 * Error that is thrown when a class has a constructor with parameters. So you need to provide a factory
 * method to actually instantiate the class and call the constructor by yourself.
 * 
 * @export
 * @class NoFactoryProvidedError
 */
export class NoFactoryProvidedError extends Error {
    constructor(typeName: string) {
        super(`The constructor of "${typeName}" is not parameterless, please provide a factory function.`);
    }
}

/**
 * Error hat is thrown when a type is duplicated. Either use the naming system or call it by another name ;-)
 * 
 * @export
 * @class DuplicateTypeRegistration
 */
export class DuplicateTypeRegistration extends Error {

    constructor(typeName: string) {
        super(`The type "${typeName}" is duplicated.`);
    }
}

/**
 * Error hat is thrown when function.name is not callable (when using in the browser or so). So you need to
 * provide a name for the resolver system.
 * 
 * @export
 * @class NoNameProvided
 */
export class NoNameProvided extends Error {

    constructor() {
        super(`A type has no name provided, either function.name is not possible (ES5? IE?)` +
            ` or no name parameter was provided.`);
    }
}

/**
 * Error hat is thrown when a type that is beeing serialized or deserialized is not found in the resolver system.
 * A possible cause could be that you forgot @Serializabe() on the type.
 * 
 * @export
 * @class TypeNotRegisteredError
 */
export class TypeNotRegisteredError extends Error {

    constructor(obj: any) {
        super(`The object "${obj}" is not found in the type registration. Did you forget the @Serializable` +
            ` decorator?`);
    }
}

/**
 * Error hat is thrown when a referenced object is not found.
 * 
 * @export
 * @class ReferenceObjectNotFoundError
 */
export class ReferenceObjectNotFoundError extends Error {

    constructor() {
        super('The reference object was not found in the previous deserialized objects');
    }
}

/**
 * Error that is thrown when an input to deserialize or serialize is undefined.
 * 
 * @export
 * @class UndefinedInputError
 */
export class UndefinedInputError extends Error {

    constructor(functionname: string) {
        super(`The input of your '${functionname}' call was undefined.
 Undefined can't be serlialized or deserialized.`);
    }
}
