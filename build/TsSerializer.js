"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./errors");
var Resolver_1 = require("./Resolver");
/**
 * Referenced object during deserialization. Since the whole type tree needs to be built before the references
 * can be resolved, this intermediate object does serve this purpose.
 *
 * @class ReferencedObject
 */
var ReferencedObject = (function () {
    function ReferencedObject(referenceInfo) {
        this.type = referenceInfo.type;
        this.index = referenceInfo.index;
    }
    return ReferencedObject;
}());
/**
 * Main element of this library. Is responsible for the serialization and deserialization of the object structure.
 * Throw it a list (or single) of objects which types are registered and it creates a json string out of it.
 * On the other side, deserialize the whole stream back into instantiated objects.
 *
 * @export
 * @class TsSerializer
 */
var TsSerializer = (function () {
    function TsSerializer() {
    }
    Object.defineProperty(TsSerializer.prototype, "resolver", {
        /**
         * Instance of the type resolver.
         *
         * @readonly
         * @type {Resolver}
         * @memberOf TsSerializer
         */
        get: function () {
            return Resolver_1.Resolver.instance;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Serializes a registered object or an array of objects. Creates a special formatted string that can be
     * transmitted and deserialized on the other side.
     *
     * @param {*} objectOrArray The object or array of objects that needs to be serialized.
     * @returns {string}
     *
     * @memberOf TsSerializer
     */
    TsSerializer.prototype.serialize = function (objectOrArray) {
        var _this = this;
        if (objectOrArray === undefined) {
            throw new errors_1.UndefinedInputError('serialize');
        }
        this.references = {};
        var serialized;
        if (objectOrArray !== null && objectOrArray.constructor === Array) {
            serialized = objectOrArray.filter(function (o) { return o !== undefined; }).map(function (o) { return _this.serializeObject(o); });
        }
        else {
            serialized = this.serializeObject(objectOrArray);
        }
        return JSON.stringify(serialized);
    };
    /**
     * Deserializes a string that was serialized by {@link TsSerializer#serialize()}. Does parse the whole
     * string into instantiated objects.
     *
     * @template T
     * @param {string} json Serialized json string.
     * @returns {T}
     *
     * @memberOf TsSerializer
     */
    TsSerializer.prototype.deserialize = function (json) {
        var _this = this;
        if (json === undefined) {
            throw new errors_1.UndefinedInputError('deserialize');
        }
        this.references = {};
        var parsed = JSON.parse(json);
        var deserialized;
        if (parsed !== null && parsed.constructor === Array) {
            deserialized = parsed.map(function (o) { return _this.deserializeObject(o); });
        }
        else {
            deserialized = this.deserializeObject(parsed);
        }
        this.resolveReferences(deserialized);
        return deserialized;
    };
    /**
     * Recursive function that serializes the objects. Returns a structure of the value and the type reference.
     * References to already existing objects (like circular references) are also resolved.
     *
     * @private
     * @param {*} obj
     * @returns {TransportObject}
     *
     * @memberOf TsSerializer
     */
    TsSerializer.prototype.serializeObject = function (obj) {
        var _this = this;
        if (obj === null) {
            return {
                __type: 'null',
                __value: null
            };
        }
        else if (obj === undefined || !obj.constructor) {
            return {
                __type: 'undefined',
                __value: undefined
            };
        }
        else if (obj.constructor === Date) {
            return {
                __type: 'Date',
                __value: obj
            };
        }
        else if (obj.constructor === Array) {
            return {
                __type: 'Array',
                __value: obj.map(function (o) { return _this.serializeObject(o); }).filter(function (o) { return o !== undefined; })
            };
        }
        else if (typeof obj === 'object') {
            var type = this.resolver.getTypeByObject(obj), transformedObj = {};
            if (!type) {
                throw new errors_1.TypeNotRegisteredError(obj);
            }
            if (!this.references[type.name]) {
                this.references[type.name] = [];
            }
            var alreadyIndexed = this.references[type.name].find(function (o) { return o === obj; });
            if (alreadyIndexed) {
                return {
                    __type: 'ref',
                    __value: {
                        type: type.name,
                        index: this.references[type.name].indexOf(obj)
                    }
                };
            }
            else {
                this.references[type.name].push(obj);
            }
            for (var _i = 0, _a = Object.keys(obj).filter(function (o) { return typeof obj[o] !== 'function' && typeof obj[o] !== 'undefined'; }); _i < _a.length; _i++) {
                var property = _a[_i];
                transformedObj[property] = this.serializeObject(obj[property]);
            }
            return {
                __type: type.name,
                __value: transformedObj
            };
        }
        else {
            return {
                __type: obj.constructor.name,
                __value: obj
            };
        }
    };
    /**
     * Recursive deserialize function that resolves the type names to their instantiated types.
     * References are resolved at last, since the whole object tree needs to be built first.
     *
     * @private
     * @param {TransportObject} obj
     * @returns {*}
     *
     * @memberOf TsSerializer
     */
    TsSerializer.prototype.deserializeObject = function (obj) {
        var _this = this;
        if (!obj) {
            return;
        }
        switch (obj.__type) {
            case 'undefined':
                return;
            case 'null':
                return null;
            case 'Date':
                return new Date(obj.__value);
            case 'Number':
                return Number(obj.__value);
            case 'String':
                return String(obj.__value);
            case 'Boolean':
                return Boolean(obj.__value);
            case 'Array':
                return obj.__value.map(function (o) { return _this.deserializeObject(o); });
            case 'ref':
                return new ReferencedObject(obj.__value);
            default:
                var type = this.resolver.getType(obj.__type), transformedObj = {};
                if (!type) {
                    throw new errors_1.TypeNotRegisteredError(obj);
                }
                for (var _i = 0, _a = Object.keys(obj.__value); _i < _a.length; _i++) {
                    var property = _a[_i];
                    transformedObj[property] = this.deserializeObject(obj.__value[property]);
                }
                var createdObj = type.factory ?
                    type.factory(transformedObj) :
                    Object.assign(new type.ctor(), transformedObj);
                if (!this.references[type.name]) {
                    this.references[type.name] = [];
                }
                this.references[type.name].push(createdObj);
                return createdObj;
        }
    };
    /**
     * Resolves the referenced objects to actual instances as soon as the whole object tree is built. Is only needed
     * during deserialization.
     *
     * @private
     * @param {*} obj
     * @returns {void}
     *
     * @memberOf TsSerializer
     */
    TsSerializer.prototype.resolveReferences = function (obj) {
        if (obj === null) {
            return;
        }
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var property = _a[_i];
            var prop = obj[property];
            if (prop instanceof ReferencedObject) {
                if (!this.references[prop.type]) {
                    throw new errors_1.ReferenceObjectNotFoundError();
                }
                obj[property] = this.references[prop.type][prop.index];
            }
            else if (typeof prop === 'object') {
                this.resolveReferences(prop);
            }
        }
    };
    return TsSerializer;
}());
exports.TsSerializer = TsSerializer;
