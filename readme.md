# ng-falcor: Use Falcor in Angular 1.x Projects

## Installation

```
npm install ng-falcor
```

Alternatively, copy the [UMD](https://github.com/umdjs/umd) file `dist/ng-falcor.js` in this repo and put it wherever you want.

## How does it work?

See the [Falcor website](https://netflix.github.io/falcor/) for how Falcor works.
This lib provide an Angular factory that wraps Falcor and exposes it to your logic and templates.
Subsequently, Angular bindings operate against a single source of truth; a central Falcor model containing all your application data.
From then on, it's simply a matter of manipulating the JSON graph.

**Note:** this lib is pre-1.0.
Pending any feedback and/or lessons learned it may change substantially before hitting 1.0.

## API

### `ngFalcor.create(opts)`

The main export of `ng-falcor` has but one method `create()` which returns an Angular factory function.
Pass it an options hash:

 * **router** (string) If provided, a new `falcor.HttpDataSource` is created using this and added to the model.
 * **cache** (object) Pre-populate the model cache. Useful for bootstrapping data for example.

### `ngf`

This is the singleton object that gets injected into your controllers by the factory.
You can name it whatever you want, but `ngf` is nice and short.
It has several methods:

 * `ngf('path.to.something')` or `ngf('path','to','something')` - Synchronous getter for one-way binding. May trigger a call to the datasource as a side effect.
 * `ngf.twoWay(path)` - Returns a function that serves as an `ng-model` in a two-way binding scenario. Must be used in conjunction with `ng-model-options="{getterSetter:true}"`. This should only be used in save-as-you-type / save-as-you-click type of scenarios.
 * `ngf.get(...args)` - Alias to [`get(...args)`](https://netflix.github.io/falcor/doc/Model.html#get) on the internal Falcor model.
 * `ngf.getValue(...args)` - Alias to [`getValue(...args)`](https://netflix.github.io/falcor/doc/Model.html) on the internal Falcor model.
 * `ngf.set(...args)` - Alias to [`set(...args)`](https://netflix.github.io/falcor/doc/Model.html#set) on the internal Falcor model.
 * `ngf.call(...args)` - Alias to [`call(...args)`](https://netflix.github.io/falcor/doc/Model.html#call) on the internal Falcor model.

## Example

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

```html
<img src="{{ ngf('users.u12345.avatar.src') }}"/>
<button ng-click="ngf.set('users.u12345.isOnline', true)"/>
<button ng-click="ngf.call('users.create')"/>
<checkbox ng-model="ngf.twoWay('users.u12345.isOnline')" ng-model-options="{ getterSetter: true }"/>
```

## Credit

Credit due to [@rolaveric](https://github.com/rolaveric/angular-falcor) for inspiration and providing some useful pieces to this puzzle. And of course the [Falcor](https://netflix.github.io/falcor/) and [Angular](https://angularjs.org/) teams.
