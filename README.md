# ts json serializer
This typescript serializer project should bring ease when using objects on both ends of a
json based communication. Most of the time, `interfaces` are sufficent since there are no methods
on the communication objects. But what happens when "calculated fields" are used (like a read only
property). This library does register the used type as classes in a type system and uses a 
special notation to transfer the objects over the wire. After that, the deserialized objects are
real instances (so `instanceof` does work), even with references to other types (i.e. in circular
references).

##### Shield me.

[![Build Status](https://travis-ci.org/buehler/ts-json-serializer.svg?maxAge=3600)](https://travis-ci.org/buehler/ts-json-serializer)
[![npm](https://img.shields.io/npm/v/ts-json-serializer.svg?maxAge=3600)](https://www.npmjs.com/package/ts-json-serializer)
[![Coverage status](https://img.shields.io/coveralls/buehler/ts-json-serializer.svg?maxAge=3600)](https://coveralls.io/github/buehler/ts-json-serializer)
[![license](https://img.shields.io/github/license/buehler/ts-json-serializer.svg?maxAge=2592000)](https://github.com/buehler/ts-json-serializer)

## Installation

To install this package, simply run

[![NPM](https://nodei.co/npm/ts-json-serializer.png?downloads=true&stars=true)](https://nodei.co/npm/ts-json-serializer/)

## Usage

To use the `ts-json-serializer` instantiate an instance of it and throw your decorated models in it.

`models.ts`:
```typescript
import { Serializable } from 'ts-json-serializer';

@Serializable()
export class User {
    public name: string;
    public surname: string;
    public address: Address;
}

@Serializable()
export class Address {
    public street: string;
    public city: string;
    public zip: number;
}
```

Now when you wan't to send your models to another client, just use the `TsSerializer`:

```typescript
import { User, Address } from './models';
import { TsSerializer } from 'ts-json-serializer';

const address = new Address();
address.street = 'Foobar';
address.city = 'SomewhereThere';
address.zip = 1337

const user1 = new User();
user1.name = 'Sally';
user1.surname = `O'Brien`;
user1.address = address;

const user2 = new User();
user2.name = 'Jake';
user2.surname = `O'Brien`;
user2.address = address;

const serializer = new TsSerializer();

serializer.serialize([user1, user2]); // <- This returns a transmittable string
```

To deserialize, just use the json string that is returned by `serialize` and reverse the process.

```typescript

const deserializer = new TsSerializer();

const deserialized = deserializer.deserialize<User[]>(jsonString);

const user1 = deserialized[0];
const user2 = deserialized[1];

user1.address === user2.address; // --> TRUE.
```

Actually, you can serialize normal objects, or array of objects. The library does recognize the array
and does parse the objects one by one. The generic type `T` is not mandatory, but strongly recommended.
This is especally useful, if you transmit multiple objects that can be identified by an interface or an
abstract class. The types are instantiated with the concrete class, but you could use the interface
as type generic information and just parse them all:

```typescript
interface Foobar {
    sayHello(): void;
}

class FooOne implements Foobar {
    public sayHello(): void {
        console.log('hello from FooOne');
    }
}

class FooTwo implements Foobar {
    public sayHello(): void {
        console.log('hello from FooTwo');
    }
}

const serializer = new TsSerializer();

const foobarThings = serializer.deserializer<Foobar[]>(string);

for(let foo of foobarThings){
    foo.sayHello();
}
```

## Changelog

The changelog is based on [keep a changelog](http://keepachangelog.com) and is located here:

[Changelog](CHANGELOG.md)

## Licence

This software is licenced under the [MIT](LICENSE) licence.
