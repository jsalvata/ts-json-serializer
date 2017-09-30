"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Error that is thrown when a class has a constructor with parameters. So you need to provide a factory
 * method to actually instantiate the class and call the constructor by yourself.
 *
 * @export
 * @class NoFactoryProvidedError
 */
var NoFactoryProvidedError = (function (_super) {
    tslib_1.__extends(NoFactoryProvidedError, _super);
    function NoFactoryProvidedError(typeName) {
        return _super.call(this, "The constructor of \"" + typeName + "\" is not parameterless, please provide a factory function.") || this;
    }
    return NoFactoryProvidedError;
}(Error));
exports.NoFactoryProvidedError = NoFactoryProvidedError;
/**
 * Error hat is thrown when a type is duplicated. Either use the naming system or call it by another name ;-)
 *
 * @export
 * @class DuplicateTypeRegistration
 */
var DuplicateTypeRegistration = (function (_super) {
    tslib_1.__extends(DuplicateTypeRegistration, _super);
    function DuplicateTypeRegistration(typeName) {
        return _super.call(this, "The type \"" + typeName + "\" is duplicated.") || this;
    }
    return DuplicateTypeRegistration;
}(Error));
exports.DuplicateTypeRegistration = DuplicateTypeRegistration;
/**
 * Error hat is thrown when function.name is not callable (when using in the browser or so). So you need to
 * provide a name for the resolver system.
 *
 * @export
 * @class NoNameProvided
 */
var NoNameProvided = (function (_super) {
    tslib_1.__extends(NoNameProvided, _super);
    function NoNameProvided() {
        return _super.call(this, "A type has no name provided, either function.name is not possible (ES5? IE?)" +
            " or no name parameter was provided.") || this;
    }
    return NoNameProvided;
}(Error));
exports.NoNameProvided = NoNameProvided;
/**
 * Error hat is thrown when a type that is beeing serialized or deserialized is not found in the resolver system.
 * A possible cause could be that you forgot @Serializabe() on the type.
 *
 * @export
 * @class TypeNotRegisteredError
 */
var TypeNotRegisteredError = (function (_super) {
    tslib_1.__extends(TypeNotRegisteredError, _super);
    function TypeNotRegisteredError(obj) {
        return _super.call(this, "The object \"" + obj + "\" is not found in the type registration. Did you forget the @Serializable" +
            " decorator?") || this;
    }
    return TypeNotRegisteredError;
}(Error));
exports.TypeNotRegisteredError = TypeNotRegisteredError;
/**
 * Error hat is thrown when a referenced object is not found.
 *
 * @export
 * @class ReferenceObjectNotFoundError
 */
var ReferenceObjectNotFoundError = (function (_super) {
    tslib_1.__extends(ReferenceObjectNotFoundError, _super);
    function ReferenceObjectNotFoundError() {
        return _super.call(this, 'The reference object was not found in the previous deserialized objects') || this;
    }
    return ReferenceObjectNotFoundError;
}(Error));
exports.ReferenceObjectNotFoundError = ReferenceObjectNotFoundError;
/**
 * Error that is thrown when an input to deserialize or serialize is undefined.
 *
 * @export
 * @class UndefinedInputError
 */
var UndefinedInputError = (function (_super) {
    tslib_1.__extends(UndefinedInputError, _super);
    function UndefinedInputError(functionname) {
        return _super.call(this, "The input of your '" + functionname + "' call was undefined.\n Undefined can't be serlialized or deserialized.") || this;
    }
    return UndefinedInputError;
}(Error));
exports.UndefinedInputError = UndefinedInputError;
