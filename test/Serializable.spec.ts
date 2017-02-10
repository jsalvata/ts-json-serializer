import { DuplicateTypeRegistration, NoFactoryProvidedError, NoNameProvided } from '../errors';
import { Serializable } from '../';
import { Resolver } from '../Resolver';
import 'reflect-metadata';
import chai = require('chai');

const should = chai.should();

describe('Serializable decorator', () => {

    const resolver = Resolver.instance,
        anyResolver: any = resolver;

    afterEach(() => {
        resolver.reset();
    });

    it('should add a type reference to the resolver.', () => {
        @Serializable()
        class Model {
        }

        should.exist(anyResolver.types);
        should.exist(anyResolver.types['Model']);
        should.not.exist(anyResolver.types['Model'].factory);
    });

    it('should add a named type reference to the resolver.', () => {
        @Serializable({ name: 'foobar' })
        class Model {
        }

        should.exist(anyResolver.types);
        should.exist(anyResolver.types['foobar']);
        should.not.exist(anyResolver.types['foobar'].factory);
    });

    it('should add a type reference with factory to the resolver.', () => {
        @Serializable({ factory: body => new Model(body) })
        class Model {
            constructor(body: any) { }
        }

        should.exist(anyResolver.types);
        should.exist(anyResolver.types['Model']);
        should.exist(anyResolver.types['Model'].factory);
    });

    it('should throw if a non standard constructor is used without factory.', () => {
        const fn = () => {
            @Serializable()
            class Model {
                constructor(foobar: string) { }
            }
        };

        fn.should.throw(NoFactoryProvidedError);
    });

    it('should throw on a duplicate registration.', () => {
        const fn = () => {
            @Serializable()
            class Model {
                constructor() { }
            }
            
            @Serializable({name: 'Model'})
            class Model2 {
                constructor() { }
            }
        };

        fn.should.throw(DuplicateTypeRegistration);
    });

});
