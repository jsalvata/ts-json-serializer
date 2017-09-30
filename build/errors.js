"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Error that is thrown when a class has a constructor with parameters. So you need to provide a factory
 * method to actually instantiate the class and call the constructor by yourself.
 *
 * @export
 * @class NoFactoryProvidedError
 */
var NoFactoryProvidedError = (function () {
    function NoFactoryProvidedError(typeName) {
        this.message = "The constructor of \"" + typeName + "\" is not parameterless, please provide a factory function.";
    }
    return NoFactoryProvidedError;
}());
exports.NoFactoryProvidedError = NoFactoryProvidedError;
/**
 * Error hat is thrown when a type is duplicated. Either use the naming system or call it by another name ;-)
 *
 * @export
 * @class DuplicateTypeRegistration
 */
var DuplicateTypeRegistration = (function () {
    function DuplicateTypeRegistration(typeName) {
        this.message = "The type \"" + typeName + "\" is duplicated.";
    }
    return DuplicateTypeRegistration;
}());
exports.DuplicateTypeRegistration = DuplicateTypeRegistration;
/**
 * Error hat is thrown when function.name is not callable (when using in the browser or so). So you need to
 * provide a name for the resolver system.
 *
 * @export
 * @class NoNameProvided
 */
var NoNameProvided = (function () {
    function NoNameProvided() {
        this.message = "A type has no name provided, either function.name is not possible (ES5? IE?)" +
            " or no name parameter was provided.";
    }
    return NoNameProvided;
}());
exports.NoNameProvided = NoNameProvided;
/**
 * Error hat is thrown when a type that is beeing serialized or deserialized is not found in the resolver system.
 * A possible cause could be that you forgot @Serializabe() on the type.
 *
 * @export
 * @class TypeNotRegisteredError
 */
var TypeNotRegisteredError = (function () {
    function TypeNotRegisteredError(obj) {
        this.message = "The object \"" + obj + "\" is not found in the type registration. Did you forget the @Serializable" +
            " decorator?";
    }
    return TypeNotRegisteredError;
}());
exports.TypeNotRegisteredError = TypeNotRegisteredError;
/**
 * Error hat is thrown when a referenced object is not found.
 *
 * @export
 * @class ReferenceObjectNotFoundError
 */
var ReferenceObjectNotFoundError = (function () {
    function ReferenceObjectNotFoundError() {
        this.message = 'The reference object was not found in the previous deserialized objects';
    }
    return ReferenceObjectNotFoundError;
}());
exports.ReferenceObjectNotFoundError = ReferenceObjectNotFoundError;
/**
 * Error that is thrown when an input to deserialize or serialize is undefined.
 *
 * @export
 * @class UndefinedInputError
 */
var UndefinedInputError = (function () {
    function UndefinedInputError(functionname) {
        this.message = "The input of your '" + functionname + "' call was undefined.\n Undefined can't be serlialized or deserialized.";
    }
    return UndefinedInputError;
}());
exports.UndefinedInputError = UndefinedInputError;
