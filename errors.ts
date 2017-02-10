/**
 * TODO
 * 
 * @export
 * @class NoFactoryProvidedError
 */
export class NoFactoryProvidedError {
    public message: string;

    constructor(typeName: string) {
        this.message = `The constructor of "${typeName}" is not parameterless, please provide a factory function.`;
    }
}

/**
 * TODO
 * 
 * @export
 * @class DuplicateTypeRegistration
 */
export class DuplicateTypeRegistration {
    public message: string;

    constructor(typeName: string) {
        this.message = `The type "${typeName}" is duplicated.`;
    }
}

/**
 * TODO
 * 
 * @export
 * @class NoNameProvided
 */
export class NoNameProvided {
    public message: string;

    constructor() {
        this.message = `A type has no name provided, either function.name is not possible (ES5? IE?)` +
            ` or no name parameter was provided.`;
    }
}

/**
 * TODO
 * 
 * @export
 * @class TypeNotRegisteredError
 */
export class TypeNotRegisteredError {
    public message: string;

    constructor(obj: any) {
        this.message = `The object "${obj}" is not found in the type registration. Did you forget the @Serializable` +
            ` decorator?`;
    }
}

/**
 * 
 * 
 * @export
 * @class ReferenceObjectNotFoundError
 */
export class ReferenceObjectNotFoundError {
    public message: string;

    constructor() {
        this.message = 'The reference object was not found in the previous deserialized objects';
    }
}
