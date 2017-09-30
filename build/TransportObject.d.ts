/**
 * Typedefinition for a transport object. Contains the type information and the transformed value.
 *
 * @typedef {TransportObject}
 * @property {string} __type Name of the used type.
 * @property {*} __value Transformed value of the type.
 */
export declare type TransportObject = {
    /**
     * Name of the used type.
     *
     * @type {string}
     */
    __type: string;
    /**
     * Transformed value of the type.
     *
     * @type {*}
     */
    __value: any;
};
