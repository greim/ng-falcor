# ng-falcor: Use Falcor in Angular 1.x Projects

## Installation

```
npm install ng-falcor
```

Alternatively, copy the [UMD](https://github.com/umdjs/umd) file `dist/ng-falcor.js` in this repo and put it wherever you want.

## How does it work?

Falcor provides asynchronous getters for client-side use, in the form of promises.
Angular 1.x templates can't bind directly to promises, so this lib mainly solves the problem of providing synchronous getters into Falcor that Angular can bind to.
This lib also provides getter/setter functions for use in two-way binding scenarios.

## Usage

```js
import ngFalcor from 'ng-falcor';

angular.module('foo', [])
.factory('ngf', ngFalcor.create({
  router: '/model.json',
  cache: { ... }
}))
.controller('myCtrl', function($scope, ngf) {
  $scope.ngf = ngf;
});
```

## API

Given the above, the injected `ngf` object can be used thusly:

 * `ngf('path.to.something')` or `ngf('path','to','something')` - Synchronous getter. May trigger a call to the datasource as a side effect.
 * `ngf.get(...args)` - Alias to `get(...args)` on the internal Falcor model.
 * `ngf.getValue(...args)` - Alias to `getValue(...args)` on the internal Falcor model.
 * `ngf.set(...args)` - Alias to `set(...args)` on the internal Falcor model.
 * `ngf.call(...args)` - Alias to `call(...args)` on the internal Falcor model.
 * `ngf.twoWay(path)` - Returns a function that serves as an `ng-model` in a two-way binding scenario. Must be used in conjunction with `ng-model-options="{getterSetter:true}"`.

Also, there are options:

 * **router** - If provided, a new `falcor.HttpDataSource` is created using this and added to the model.
 * **cache** - Pre-populate the model cache. Useful for bootstrapping data for example.

## Example

```
<img src="{{ ngf('users.u12345.avatar.src') }}"/>
<button ng-click="ngf.set('users.u12345.isOnline', true)"/>
<button ng-click="ngf.call('users.create')"/>
<checkbox ng-model="ngf.twoWay('users.u12345.isOnline')" ng-model-options="{ getterSetter: true }"/>
```
