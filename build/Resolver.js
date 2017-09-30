"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./errors");
/**
 * Resolving instance. Holds the registered types and is the central type "database" for the system.
 *
 * @export
 * @class Resolver
 */
var Resolver = (function () {
    function Resolver() {
        /**
         * Hashmap of registered types.
         *
         * @private
         * @type {{ [name: string]: SerializableType }}
         * @memberOf Resolver
         */
        this.types = {};
    }
    Object.defineProperty(Resolver, "instance", {
        /**
         * Actual instance (singleton).
         *
         * @readonly
         * @static
         * @type {Resolver}
         * @memberOf Resolver
         */
        get: function () {
            if (!Resolver._instance) {
                Resolver._instance = new Resolver();
            }
            return Resolver._instance;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Resets the registered types.
     * May be useful for unit testing.
     *
     * @memberOf Resolver
     */
    Resolver.prototype.reset = function () {
        this.types = {};
    };
    /**
     * Add a type to the resolver. Throws if the type is already registered.
     *
     * @param {SerializableType} model
     *
     * @memberOf Resolver
     */
    Resolver.prototype.addType = function (type) {
        if (this.types[type.name]) {
            throw new errors_1.DuplicateTypeRegistration(type.name);
        }
        this.types[type.name] = type;
    };
    /**
     * Searches and returns a type by name.
     *
     * @param {string} name
     * @returns {(SerializableType | undefined)}
     *
     * @memberOf Resolver
     */
    Resolver.prototype.getType = function (name) {
        return this.types[name];
    };
    /**
     * Searches and returns a type by a given object (does compare the contructors).
     *
     * @param {*} obj
     * @returns {(SerializableType | undefined)}
     *
     * @memberOf Resolver
     */
    Resolver.prototype.getTypeByObject = function (obj) {
        var _this = this;
        return Object.keys(this.types)
            .map(function (key) { return _this.types[key]; })
            .find(function (o) { return obj.constructor === o.ctor; });
    };
    return Resolver;
}());
exports.Resolver = Resolver;
