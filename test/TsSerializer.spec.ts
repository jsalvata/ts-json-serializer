import 'reflect-metadata';
import { Serializable } from '../';
import { TypeNotRegisteredError, UndefinedInputError } from '../errors';
import { Resolver } from '../Resolver';
import { TsSerializer } from '../TsSerializer';
import chai = require('chai');

const should = chai.should();

describe('TsSerializer', () => {

    const resolver = Resolver.instance,
        serializer = new TsSerializer();

    afterEach(() => {
        resolver.reset();
    });

    describe('serialize', () => {

        it('should serialize a primitive type normally', () => {
            serializer.serialize(1337).should.equal('{"__type":"Number","__value":1337}');
            serializer.serialize('1337').should.equal('{"__type":"String","__value":"1337"}');
            serializer.serialize(true).should.equal('{"__type":"Boolean","__value":true}');
        });

        it('should serialize a simple date to string', () => {
            const date = new Date(2017, 1, 1, 15, 0, 0, 50);
            serializer.serialize(date).should.equal('{"__type":"Date","__value":"2017-02-01T14:00:00.050Z"}');
        });

        it('should serialize a simple model', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            const obj = new Model();
            obj.name = 'foobar';

            serializer.serialize(obj).should.equal(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"}}}'
            );
        });

        it('should serialize a model within a model', () => {
            @Serializable()
            class Model {
                public name: string;
                public submodel: Model;
            }

            const obj = new Model();
            obj.name = 'foobar';
            obj.submodel = new Model();
            obj.submodel.name = 'submodel';

            serializer.serialize(obj).should.equal(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"},' +
                '"submodel":{"__type":"Model","__value":{"name":{"__type":"String","__value":"submodel"}}}}}'
            );
        });

        it('should serialize another model in a model', () => {
            @Serializable()
            class Model {
                public name: string;
                public submodel: Submodel;
            }

            @Serializable()
            class Submodel {
                public name: string;
            }

            const obj = new Model();
            obj.name = 'the model';
            obj.submodel = new Submodel();
            obj.submodel.name = 'the sub model';

            serializer.serialize(obj).should.equal(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"the model"},"submodel":' +
                '{"__type":"Submodel","__value":{"name":{"__type":"String","__value":"the sub model"}}}}}'
            );
        });

        it('should serialize primitive objects in an array', () => {
            serializer
                .serialize([1337, 'foobar', true])
                .should.equal(
                '[{"__type":"Number","__value":1337},{"__type":"String"' +
                ',"__value":"foobar"},{"__type":"Boolean","__value":true}]'
                );
        });

        it('should serialize a model in an array', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            const obj = new Model();
            obj.name = 'foobar';

            serializer.serialize([obj]).should.equal(
                '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"}}}]'
            );
        });

        it('should serialize a model in a model in an array', () => {
            @Serializable()
            class Model {
                public name: string;
                public submodel: Model;
            }

            const obj = new Model();
            obj.name = 'foobar';
            obj.submodel = new Model();
            obj.submodel.name = 'submodel';

            serializer.serialize([obj]).should.equal(
                '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"},' +
                '"submodel":{"__type":"Model","__value":{"name":{"__type":"String","__value":"submodel"}}}}}]'
            );
        });

        it('should serialize multiple models in an array', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            const obj = new Model();
            obj.name = 'foobar';

            const obj2 = new Model();
            obj2.name = 'foobar2';

            serializer.serialize([obj, obj2]).should.equal(
                '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"}}},' +
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar2"}}}]'
            );
        });

        it('should serialize multiple models with submodels in an array', () => {
            @Serializable()
            class Model {
                public name: string;
                public submodel: Submodel;
            }

            @Serializable()
            class Submodel {
                public name: string;
            }

            const obj = new Model();
            obj.name = 'the model';
            obj.submodel = new Submodel();
            obj.submodel.name = 'the sub model';

            const obj2 = new Model();
            obj2.name = 'the model 2';
            obj2.submodel = new Submodel();
            obj2.submodel.name = 'the sub model 2';

            serializer.serialize([obj, obj2]).should.equal(
                '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"the model"},"submodel":' +
                '{"__type":"Submodel","__value":{"name":{"__type":"String","__value":"the sub model"}}}}},' +
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"the model 2"},"submodel":' +
                '{"__type":"Submodel","__value":{"name":{"__type":"String","__value":"the sub model 2"}}}}}]'
            );
        });

        it('should serialize the same object as the same reference in an array', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            const obj = new Model();
            obj.name = 'foobar';

            serializer.serialize([obj, obj]).should.equal(
                '[{"__type":"Model","__value":{"name":{"__type":"String",' +
                '"__value":"foobar"}}},{"__type":"ref","__value":{"type":"Model","index":0}}]'
            );
        });

        it('should serialize the same object as the same reference in a submodule (recursive)', () => {
            @Serializable()
            class Model {
                public name: string;
                public mod: Model;
            }

            const obj = new Model();
            obj.name = 'foobar';
            obj.mod = obj;

            serializer.serialize(obj).should.equal(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"},' +
                '"mod":{"__type":"ref","__value":{"type":"Model","index":0}}}}'
            );
        });

        it('should serialize an object as a reference in another object (when in an array)', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            @Serializable()
            class OtherModel {
                public model: Model;
            }

            const obj = new Model();
            obj.name = 'foobar';
            const otherObj = new OtherModel();
            otherObj.model = obj;

            serializer.serialize([obj, otherObj]).should.equal(
                '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"}}},' +
                '{"__type":"OtherModel","__value":{"model":{"__type":"ref","__value":{"type":"Model","index":0}}}}]'
            );
        });

        it('should serialize an object as a reference in another object (when in an array reversed)', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            @Serializable()
            class OtherModel {
                public model: Model;
            }

            const obj = new Model();
            obj.name = 'foobar';
            const otherObj = new OtherModel();
            otherObj.model = obj;

            serializer.serialize([otherObj, obj]).should.equal(
                '[{"__type":"OtherModel","__value":{"model":{"__type":"Model","__value":{"name":' +
                '{"__type":"String","__value":"foobar"}}}}},{"__type":"ref","__value":{"type":"Model","index":0}}]'
            );
        });

        it('should serialize mutliple referenced models', () => {
            @Serializable()
            class A {
                public b: B;
            }

            @Serializable()
            class B {
                public c: C;
            }

            @Serializable()
            class C {
                public a: A;
                public d: D;
            }

            @Serializable()
            class D {
                public b: B;
            }

            const a = new A();
            a.b = new B();
            a.b.c = new C();
            a.b.c.a = a;
            a.b.c.d = new D();
            a.b.c.d.b = a.b;

            serializer.serialize(a).should.equal(
                '{"__type":"A","__value":{"b":{"__type":"B","__value":{"c":{"__type":"C","__value":{"a":' +
                '{"__type":"ref","__value":{"type":"A","index":0}},"d":{"__type":"D",' +
                '"__value":{"b":{"__type":"ref","__value":{"type":"B","index":0}}}}}}}}}}'
            );
        });

        it('should serialize a model with a constructor', () => {
            @Serializable({
                factory: data => new Model(data.name)
            })
            class Model {
                constructor(public name: string) { }
            }

            serializer.serialize(new Model('ctor model')).should.equal(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"ctor model"}}}'
            );
        });

        it('should serialize a model in a model with a constructor', () => {
            @Serializable({
                factory: data => new Model()
            })
            class Model {
                constructor(public name: string = 'model', public sub: SubModel = new SubModel()) { }
            }

            @Serializable({
                factory: data => new Model(data.name)
            })
            class SubModel {
                constructor(public name: string = 'sub model') { }
            }

            serializer.serialize(new Model()).should.equal(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"model"},"sub":' +
                '{"__type":"SubModel","__value":{"name":{"__type":"String","__value":"sub model"}}}}}'
            );
        });

        it('should serialize an array of models in a model', () => {
            @Serializable()
            class Model {
                public primitive: any[] = ['string', true, 1337];
                public mixed: any[] = ['string', new ArrayModel('arr_1'), 1337, new ArrayModel('arr_2')];
                public single: ArrayModel[] = [new ArrayModel('arr_3'), new ArrayModel('arr_4')];
            }

            @Serializable({ factory: json => new ArrayModel(json.name) })
            class ArrayModel {
                constructor(public name: string) { }
            }

            serializer.serialize(new Model()).should.equal(
                '{"__type":"Model","__value":{"primitive":{"__type":"Array","__value":[{"__type":"String",' +
                '"__value":"string"},{"__type":"Boolean","__value":true},{"__type":"Number","__value":1337}]},' +
                '"mixed":{"__type":"Array","__value":[{"__type":"String","__value":"string"},{"__type":"ArrayModel"' +
                ',"__value":{"name":{"__type":"String","__value":"arr_1"}}},{"__type":"Number","__value":1337},' +
                '{"__type":"ArrayModel","__value":{"name":{"__type":"String","__value":"arr_2"}}}]},"single":' +
                '{"__type":"Array","__value":[{"__type":"ArrayModel","__value":{"name":{"__type":"String",' +
                '"__value":"arr_3"}}},{"__type":"ArrayModel","__value":{"name":{"__type":"String",' +
                '"__value":"arr_4"}}}]}}}'
            );
        });

        it('should throw when a model is not registered', () => {
            class Model {
                public name: string;
            }

            const obj = new Model(),
                fn = () => serializer.serialize(obj);

            fn.should.throw(TypeNotRegisteredError);
        });

        it('should throw when a submodel in a model is not registered', () => {
            @Serializable()
            class Model {
                public name: string;
                public mod: Submodel;
            }

            class Submodel {
                public name: string;
            }

            const obj = new Model();
            obj.name = 'foobar';
            obj.mod = new Submodel();
            obj.mod.name = 'submodel';

            const fn = () => serializer.serialize(obj);

            fn.should.throw(TypeNotRegisteredError);
        });

        it('should throw when a model in an array is not registered', () => {
            class Model {
                public name: string;
            }

            const obj = new Model(),
                fn = () => serializer.serialize([obj]);

            fn.should.throw(TypeNotRegisteredError);
        });

        it('should throw when a submodel in a model in an array is not registered', () => {
            @Serializable()
            class Model {
                public name: string;
                public mod: Submodel;
            }

            class Submodel {
                public name: string;
            }

            const obj = new Model();
            obj.name = 'foobar';
            obj.mod = new Submodel();
            obj.mod.name = 'submodel';

            const fn = () => serializer.serialize([obj]);

            fn.should.throw(TypeNotRegisteredError);
        });

        it('should serialize null as a value', () => {
            const nullValue = null;
            serializer.serialize(nullValue)!.should.equal('{"__type":"null","__value":null}');
        });

        it('should serialize null in an object', () => {
            @Serializable()
            class Model {
                public name: string | null = null;
            }

            serializer.serialize(new Model()).should.equal('{"__type":"Model","__value":{"name":{"__type":"null","__value":null}}}');
        });

        it('should serialize null in an array', () => {
            serializer.serialize(['string', null])
                .should.equal('[{"__type":"String","__value":"string"},{"__type":"null","__value":null}]');
        });

        it('should throw on undefined input', () => {
            const fn = () => serializer.serialize(undefined);

            fn.should.throw(UndefinedInputError);
        });

        it('should filter undefined in an array', () => {
            serializer.serialize(['1337', undefined, 1337])
                .should.equal('[{"__type":"String","__value":"1337"},{"__type":"Number","__value":1337}]');
        });

        it('should filter undefined in an object', () => {
            @Serializable()
            class Model {
                public name?: string;
            }

            serializer.serialize(new Model()).should.equal('{"__type":"Model","__value":{}}');
        });

    });

    describe('deserialize', () => {

        it('should deserialize a primitive type', () => {
            serializer.deserialize('{"__type":"Number","__value":1337}').should.equal(1337);
            serializer.deserialize('{"__type":"String","__value":"1337"}').should.equal('1337');
            serializer.deserialize('{"__type":"Boolean","__value":true}').should.equal(true);
        });

        it('should deserialize a simple date', () => {
            serializer
                .deserialize<Date>('{"__type":"Date","__value":"2017-02-01T14:00:00.050Z"}')
                .getMilliseconds()
                .should.equal(50);
        });

        it('should deserialize a simple model', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            const deserialized = serializer.deserialize<Model>(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"}}}'
            );

            deserialized.should.be.an.instanceof(Model);
            deserialized.name.should.equal('foobar');
        });

        it('should deserialize a model within a model', () => {
            @Serializable()
            class Model {
                public name: string;
                public submodel: Model;
            }

            const deserialized = serializer.deserialize<Model>(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"},' +
                '"submodel":{"__type":"Model","__value":{"name":{"__type":"String","__value":"submodel"}}}}}'
            );

            deserialized.should.be.an.instanceof(Model);
            deserialized.submodel.should.be.an.instanceof(Model);
            deserialized.submodel.name.should.equal('submodel');
        });

        it('should deserialize another model within a model', () => {
            @Serializable()
            class Model {
                public name: string;
                public submodel: Submodel;
            }

            @Serializable()
            class Submodel {
                public name: string;
            }

            const deserialized = serializer.deserialize<Model>(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"the model"},"submodel":' +
                '{"__type":"Submodel","__value":{"name":{"__type":"String","__value":"the sub model"}}}}}'
            );

            deserialized.should.be.an.instanceof(Model);
            deserialized.submodel.should.be.an.instanceof(Submodel);
            deserialized.submodel.name.should.equal('the sub model');
        });

        it('should deserialize primitive objects in an array', () => {
            const deserialized = serializer.deserialize(
                '[{"__type":"Number","__value":1337},{"__type":"String"' +
                ',"__value":"foobar"},{"__type":"Boolean","__value":true}]'
            );

            deserialized.should.be.an('array').and.have.lengthOf(3);
            should.equal(deserialized[0], 1337);
            should.equal(deserialized[1], 'foobar');
            should.equal(deserialized[2], true);
        });

        it('should deserialize a model in an array', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            const deserialized = serializer.deserialize<Model[]>(
                '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"}}}]'
            );

            deserialized.should.have.lengthOf(1);
            deserialized[0].should.be.an.instanceof(Model);
            deserialized[0].name.should.equal('foobar');
        });

        it('should deserialize a model in a model in an array', () => {
            @Serializable()
            class Model {
                public name: string;
                public submodel: Model;
            }

            const deserialized = serializer.deserialize<Model[]>(
                '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"},' +
                '"submodel":{"__type":"Model","__value":{"name":{"__type":"String","__value":"submodel"}}}}}]'
            );

            deserialized[0].should.be.an.instanceof(Model);
            deserialized[0].name.should.equal('foobar');
            deserialized[0].submodel.should.be.an.instanceof(Model);
            deserialized[0].submodel.name.should.equal('submodel');
        });

        it('should deserialize multiple models in an array', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            const deserialized = serializer.deserialize<Model[]>(
                '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"}}},' +
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar2"}}}]'
            );

            deserialized.should.have.lengthOf(2);
            deserialized[0].name.should.equal('foobar');
            deserialized[1].name.should.equal('foobar2');
        });

        it('should deserialize multiple models with submodels in an array', () => {
            @Serializable()
            class Model {
                public name: string;
                public submodel: Submodel;
            }

            @Serializable()
            class Submodel {
                public name: string;
            }

            const deserialized = serializer.deserialize<Model[]>(
                '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"the model"},"submodel":' +
                '{"__type":"Submodel","__value":{"name":{"__type":"String","__value":"the sub model"}}}}},' +
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"the model 2"},"submodel":' +
                '{"__type":"Submodel","__value":{"name":{"__type":"String","__value":"the sub model 2"}}}}}]'
            );

            deserialized[0].should.be.an.instanceof(Model);
            deserialized[0].name.should.equal('the model');
            deserialized[0].submodel.should.be.an.instanceof(Submodel);
            deserialized[0].submodel.name.should.equal('the sub model');

            deserialized[1].should.be.an.instanceof(Model);
            deserialized[1].name.should.equal('the model 2');
            deserialized[1].submodel.should.be.an.instanceof(Submodel);
            deserialized[1].submodel.name.should.equal('the sub model 2');
        });

        it('should deserialize the same object as the same reference in an array', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            const deserialized = serializer.deserialize<Model[]>(
                '[{"__type":"Model","__value":{"name":{"__type":"String",' +
                '"__value":"foobar"}}},{"__type":"ref","__value":{"type":"Model","index":0}}]'
            );

            deserialized[0].should.equal(deserialized[1]);
        });

        it('should deserialize the same object as the same reference in a submodule (recursive)', () => {
            @Serializable()
            class Model {
                public name: string;
                public mod: Model;
            }

            const deserialized = serializer.deserialize<Model>(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"},' +
                '"mod":{"__type":"ref","__value":{"type":"Model","index":0}}}}'
            );

            deserialized.mod.should.equal(deserialized);
        });

        it('should deserialize an object as a reference in another object (when in an array)', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            @Serializable()
            class OtherModel {
                public model: Model;
            }

            const deserialized = serializer.deserialize(
                '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"}}},' +
                '{"__type":"OtherModel","__value":{"model":{"__type":"ref","__value":{"type":"Model","index":0}}}}]'
            );

            deserialized[0].should.be.an.instanceof(Model);
            deserialized[0].name.should.equal('foobar');

            deserialized[1].should.be.an.instanceof(OtherModel);
            deserialized[1].model.should.equal(deserialized[0]);
        });

        it('should deserialize an object as a reference in another object (when in an array reversed)', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            @Serializable()
            class OtherModel {
                public model: Model;
            }

            const deserialized = serializer.deserialize(
                '[{"__type":"OtherModel","__value":{"model":{"__type":"Model","__value":{"name":' +
                '{"__type":"String","__value":"foobar"}}}}},{"__type":"ref","__value":{"type":"Model","index":0}}]'
            );

            deserialized[0].should.be.an.instanceof(OtherModel);
            deserialized[0].model.should.be.an.instanceof(Model);

            deserialized[1].should.equal(deserialized[0].model);
        });

        it('should deserialize multiple referenced objects', () => {
            @Serializable()
            class A {
                public b: B;
            }

            @Serializable()
            class B {
                public c: C;
            }

            @Serializable()
            class C {
                public a: A;
                public d: D;
            }

            @Serializable()
            class D {
                public b: B;
            }

            const deserialized = serializer.deserialize<A>(
                '{"__type":"A","__value":{"b":{"__type":"B","__value":{"c":{"__type":"C","__value":{"a":' +
                '{"__type":"ref","__value":{"type":"A","index":0}},"d":{"__type":"D",' +
                '"__value":{"b":{"__type":"ref","__value":{"type":"B","index":0}}}}}}}}}}'
            );

            deserialized.should.be.an.instanceof(A);
            deserialized.b.should.be.an.instanceof(B);
            deserialized.b.c.should.be.an.instanceof(C);
            deserialized.b.c.a.should.equal(deserialized);
            deserialized.b.c.d.should.be.an.instanceof(D);
            deserialized.b.c.d.b.should.equal(deserialized.b);
        });

        it('should deserialize a model with a constructor', () => {
            @Serializable({
                factory: data => new Model(data.name)
            })
            class Model {
                constructor(public name: string) { }
            }

            const deserialized = serializer.deserialize<Model>(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"ctor model"}}}'
            );

            deserialized.name.should.equal('ctor model');
        });

        it('should deserialize a model in a model with a constructor', () => {
            @Serializable({
                factory: data => new Model()
            })
            class Model {
                constructor(public name: string = 'model', public sub: SubModel = new SubModel()) { }
            }

            @Serializable({
                factory: data => new Model(data.name)
            })
            class SubModel {
                constructor(public name: string = 'sub model') { }
            }

            const deserialized = serializer.deserialize<Model>(
                '{"__type":"Model","__value":{"name":{"__type":"String","__value":"model"},"sub":' +
                '{"__type":"SubModel","__value":{"name":{"__type":"String","__value":"sub model"}}}}}'
            );

            deserialized.name.should.equal('model');
            deserialized.sub.should.be.an.instanceof(SubModel);
            deserialized.sub.name.should.equal('sub model');
        });

        it('should deserialize an array of models in a model', () => {
            @Serializable()
            class Model {
                public primitive: any[];
                public mixed: any[];
                public single: ArrayModel[];
            }

            @Serializable({ factory: json => new ArrayModel(json.name) })
            class ArrayModel {
                constructor(public name: string) { }
            }

            const deserialized = serializer.deserialize<Model>(
                '{"__type":"Model","__value":{"primitive":{"__type":"Array","__value":[{"__type":"String",' +
                '"__value":"string"},{"__type":"Boolean","__value":true},{"__type":"Number","__value":1337}]},' +
                '"mixed":{"__type":"Array","__value":[{"__type":"String","__value":"string"},{"__type":"ArrayModel"' +
                ',"__value":{"name":{"__type":"String","__value":"arr_1"}}},{"__type":"Number","__value":1337},' +
                '{"__type":"ArrayModel","__value":{"name":{"__type":"String","__value":"arr_2"}}}]},"single":' +
                '{"__type":"Array","__value":[{"__type":"ArrayModel","__value":{"name":{"__type":"String",' +
                '"__value":"arr_3"}}},{"__type":"ArrayModel","__value":{"name":{"__type":"String",' +
                '"__value":"arr_4"}}}]}}}'
            );

            deserialized.primitive.should.be.an('array').with.lengthOf(3);
            deserialized.mixed.should.be.an('array').with.lengthOf(4);
            deserialized.single.should.be.an('array').with.lengthOf(2);

            should.equal(deserialized.primitive[0], 'string');
            should.equal(deserialized.primitive[1], true);
            should.equal(deserialized.primitive[2], 1337);

            deserialized.mixed[0].should.equal('string');
            deserialized.mixed[1].should.be.an.instanceof(ArrayModel);
            deserialized.mixed[1].name.should.equal('arr_1');
            deserialized.mixed[2].should.equal(1337);
            deserialized.mixed[3].should.be.an.instanceof(ArrayModel);
            deserialized.mixed[3].name.should.equal('arr_2');

            deserialized.single[0].should.be.an.instanceof(ArrayModel);
            deserialized.single[0].name.should.equal('arr_3');
            deserialized.single[1].should.be.an.instanceof(ArrayModel);
            deserialized.single[1].name.should.equal('arr_4');
        });

        it('should throw when a model is not registered', () => {
            const fn = () => {
                serializer.deserialize(
                    '{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"}}}'
                );
            };

            fn.should.throw(TypeNotRegisteredError);
        });

        it('should throw when a submodel in a model is not registered', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            const fn = () => {
                serializer.deserialize(
                    '{"__type":"Model","__value":{"name":{"__type":"String","__value":"the model"},"submodel":' +
                    '{"__type":"Submodel","__value":{"name":{"__type":"String","__value":"the sub model"}}}}}'
                );
            };

            fn.should.throw(TypeNotRegisteredError);
        });

        it('should throw when a model in an array is not registered', () => {
            const fn = () => {
                serializer.deserialize(
                    '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"foobar"}}}]'
                );
            };

            fn.should.throw(TypeNotRegisteredError);
        });

        it('should throw when a submodel in a model in an array is not registered', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            const fn = () => {
                serializer.deserialize(
                    '[{"__type":"Model","__value":{"name":{"__type":"String","__value":"the model"},"submodel":' +
                    '{"__type":"Submodel","__value":{"name":{"__type":"String","__value":"the sub model"}}}}}]'
                );
            };

            fn.should.throw(TypeNotRegisteredError);
        });

        it('should deserialize null as a value', () => {
            should.equal(serializer.deserialize<any>('{"__type":"null","__value":null}'), null);
        });

        it('should deserialize null in an object', () => {
            @Serializable()
            class Model {
                public name: string | null = null;
            }

            should.equal(
                serializer.deserialize<Model>('{"__type":"Model","__value":{"name":{"__type":"null","__value":null}}}').name,
                null
            );
        });

        it('should deserialize null in an array', () => {
            const array = serializer.deserialize<any[]>('[{"__type":"String","__value":"string"},{"__type":"null","__value":null}]');

            array[0].should.equal('string');
            should.equal(array[1], null);
        });

        it('should throw on undefined input', () => {
            const fn = () => serializer.deserialize<any>(<any>undefined);

            fn.should.throw(UndefinedInputError);
        });

    });

    describe('serialize / deserialize own function and input', () => {

        it('should work with an object that has a later object in it', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            @Serializable()
            class OtherModel {
                public model: Model;
            }

            const obj = new Model();
            obj.name = 'foobar';
            const otherObj = new OtherModel();
            otherObj.model = obj;

            const json = serializer.serialize([otherObj, obj]);

            const deserialized = serializer.deserialize(json);

            deserialized[1].should.be.an.instanceof(Model);
            deserialized[1].name.should.equal('foobar');

            deserialized[0].should.be.an.instanceof(OtherModel);
            deserialized[0].model.should.equal(deserialized[1]);
        });

        it('should work with an object that has more later objects in it', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            @Serializable()
            class OtherModel {
                public model: Model;
            }

            const obj = new Model();
            obj.name = 'foobar';
            const otherObj = new OtherModel();
            otherObj.model = obj;

            const json = serializer.serialize([otherObj, obj, obj]);

            const deserialized = serializer.deserialize(json);

            deserialized[1].should.be.an.instanceof(Model);
            deserialized[1].name.should.equal('foobar');

            deserialized[0].should.be.an.instanceof(OtherModel);
            deserialized[0].model.should.equal(deserialized[1]);

            deserialized[2].should.equal(deserialized[1]);
        });

        it('should work with an object that has a previous object reference in it', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            @Serializable()
            class OtherModel {
                public model: Model;
            }

            const obj = new Model();
            obj.name = 'foobar';
            const otherObj = new OtherModel();
            otherObj.model = obj;

            const json = serializer.serialize([obj, otherObj]);

            const deserialized = serializer.deserialize(json);

            deserialized[0].should.be.an.instanceof(Model);
            deserialized[0].name.should.equal('foobar');

            deserialized[1].should.be.an.instanceof(OtherModel);
            deserialized[1].model.should.equal(deserialized[0]);
        });

        it('should work with an object that has a previous object reference in it and a normal ref', () => {
            @Serializable()
            class Model {
                public name: string;
            }

            @Serializable()
            class OtherModel {
                public model: Model;
            }

            const obj = new Model();
            obj.name = 'foobar';
            const otherObj = new OtherModel();
            otherObj.model = obj;

            const json = serializer.serialize([obj, otherObj, obj]);

            const deserialized = serializer.deserialize(json);

            deserialized[0].should.be.an.instanceof(Model);
            deserialized[0].name.should.equal('foobar');

            deserialized[1].should.be.an.instanceof(OtherModel);
            deserialized[1].model.should.equal(deserialized[0]);

            deserialized[2].should.equal(deserialized[0]);
        });

        it('should work with complex class structures', () => {
            @Serializable()
            class A {
                public b: B;
            }

            @Serializable()
            class B {
                public c: C;
            }

            @Serializable()
            class C {
                public a: A;
                public d: D;
            }

            @Serializable()
            class D {
                public b: B;
            }

            const a = new A();
            a.b = new B();
            a.b.c = new C();
            a.b.c.a = a;
            a.b.c.d = new D();
            a.b.c.d.b = a.b;

            const json = serializer.serialize(a);

            const deserialized = serializer.deserialize<A>(json);

            deserialized.should.be.an.instanceof(A);
            deserialized.b.should.be.an.instanceof(B);
            deserialized.b.c.should.be.an.instanceof(C);
            deserialized.b.c.a.should.equal(deserialized);
            deserialized.b.c.d.should.be.an.instanceof(D);
            deserialized.b.c.d.b.should.equal(deserialized.b);
        });

        it('should work with models that have constructors', () => {
            @Serializable({
                factory: data => new Model()
            })
            class Model {
                constructor(public name: string = 'model', public sub: SubModel = new SubModel()) { }
            }

            @Serializable({
                factory: data => new Model(data.name)
            })
            class SubModel {
                constructor(public name: string = 'sub model') { }
            }

            const json = serializer.serialize(new Model());

            const deserialized = serializer.deserialize<Model>(json);

            deserialized.name.should.equal('model');
            deserialized.sub.should.be.an.instanceof(SubModel);
            deserialized.sub.name.should.equal('sub model');
        });

    });

});
