"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SerializableType_1 = require("./SerializableType");
var Resolver_1 = require("./Resolver");
var errors_1 = require("./errors");
;
/**
 * Class decorator for serializable types. Those registered type can be translated into the transport-json
 * structure. All types (with exception of the primitive and date types) must be registered to be transportable.
 *
 * @export
 * @param {SerializableOptions} [options] Configuration object for the type, contains an optional name and factory.
 * @returns {ClassDecorator}
 */
function Serializable(options) {
    return function (type) {
        var name = options && options.name ? options.name : type.name;
        if (type.length > 0 && (!options || !options.factory)) {
            throw new errors_1.NoFactoryProvidedError(name);
        }
        if (!name) {
            throw new errors_1.NoNameProvided();
        }
        Resolver_1.Resolver.instance.addType(new SerializableType_1.SerializableType(name, type, options ? options.factory : undefined));
    };
}
exports.Serializable = Serializable;
