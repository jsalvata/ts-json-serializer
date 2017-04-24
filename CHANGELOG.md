# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [1.2.1]
#### Fixed
- bug that caused explicitly set undefined properties to crash the serializer

## [1.2.0]
#### Added
- Possibility to serialize / deserialize `null`.

## [1.1.0]
#### Added
- Possibility to serialize arrays of objects in types.

## [1.0.1]
#### Fixed
- Build.

## [1.0.0]
#### Added
- Actual 1.0 release

#### Changed
- Made prepare script executable

## [0.9.0]
Library that does serialization and deserialization for JSON communication. It does work on nodeJS and it's planned
to support browsers as well in the future. The main reason is to use decorators to register the serializable models
and create a reliable json structure with those informations. Further information is found in the readme.

[Unreleased]: https://github.com/buehler/ts-json-serializer/compare/v1.2.1...master
[1.2.1]: https://github.com/buehler/ts-json-serializer/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/buehler/ts-json-serializer/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/buehler/ts-json-serializer/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/buehler/ts-json-serializer/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/buehler/ts-json-serializer/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/buehler/ts-json-serializer/tree/v0.9.0
