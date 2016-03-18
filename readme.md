# ng-falcor: Use Falcor in Angular 1.x Projects

## Installation

```
npm install ng-falcor
```

Alternatively, copy the [UMD](https://github.com/umdjs/umd) file `dist/ng-falcor.js` in this repo and put it wherever you want.

## Experimental!

This lib is pre-1.0 and likely have breaking changes before hitting 1.0, especially as Falcor (which is also pre 1.0) continues to evolve.

## How does it work?

See the [Falcor website](https://netflix.github.io/falcor/) for how Falcor works.
This lib provides an Angular factory that wraps a Falcor model and exposes it to your logic and templates.
Subsequently, Angular bindings operate against a single source of truth consisting of a Falcor model containing all your application data.
From then on, it's simply a matter of manipulating the JSON graph via the model.

## API

### `ngFalcor.create(opts)`

The main export of `ng-falcor` has but one method `create()` which returns an Angular factory function.
Pass it an options hash:

 * **source** (DataSource) Any object that implements the Falcor [DataSource](http://netflix.github.io/falcor/doc/DataSource.html) convention.
 * **router** (string) If provided, a new [`falcor.HttpDataSource`](https://netflix.github.io/falcor/documentation/datasources.html) is created using this and added to the model. This is an alternative to `source`.
 * **headers** (object) An object containing HTTP request headers. If provided, the falcor HttpDatasource will send these headers along with every request. Only use in conjunction with `router`.
 * **timeout** (number) If provided, falcor HttpDatasource requests will timeout after this many milliseconds. Only use in conjunction with `router`.
 * **cache** (object) Pre-populate the model cache. Useful for bootstrapping data for example.

### `ngf`

This is the singleton object that gets injected into your controllers by the factory.
You can name it whatever you want, but `ngf` is nice and short.
It has several methods:

 * `ngf(path)` - Synchronous getter. Will trigger a router request as a side effect if the value isn't found in the model. As usual with Falcor, the provided path must point to a leaf node in the graph.
 * `ngf.twoWay(path)` - Returns a function that serves as an `ng-model` in a two-way binding scenario. Must be used in conjunction with `ng-model-options="{getterSetter:true}"`. Be aware this will send `set` requests to your Falcor model as the user interacts with the bound element.
 * `ngf.get(...args)` - Alias to [`get(...args)`](https://netflix.github.io/falcor/doc/Model.html#get) on the internal Falcor model.
 * `ngf.getValue(...args)` - Alias to [`getValue(...args)`](https://netflix.github.io/falcor/doc/Model.html) on the internal Falcor model.
 * `ngf.set(...args)` - Alias to [`set(...args)`](https://netflix.github.io/falcor/doc/Model.html#set) on the internal Falcor model.
 * `ngf.callModel(...args)` - Alias to [`call(...args)`](https://netflix.github.io/falcor/doc/Model.html#call) on the internal Falcor model (named `callModel` to avoid colliding with JS's `Function#call`).
 * `ngf.invalidate(...args)` - Alias to [`invalidate(...args)`](https://netflix.github.io/falcor/doc/Model.html#invalidate) on the internal Falcor model.
 * `ngf.configure(options)` - Configure your `ngf` object with a fresh configuration. Accepts same options as `ngFalcor.create(options)`. Warning: this has the side effect of deleting all cached Falcor data.
 * `ngf.reconfigure(options)` - Reconfigure your `ngf` object. Accepts same options as `ngFalcor.create(options)`. Warning: this has the side effect of deleting all cached Falcor data. The difference between this and `ngf.configure()` is that this merges the given configuration information into the existing, instead of replacing it.
 * `ngf.scope(rootPath)` - Returns a function that behaves just like `ngf(path)`, except `rootPath` is prepended to `path`. `rootPath` can also be a function that returns a path.
 * `ngf.detach(template)` - Creates a detached object containing data from the Falcor model based on the given `template`. The template object is keyed/valued by names/paths. Returns a promise for an object matching the templates, with values resolved from Falcor based on corresponding paths. This object can then be mutated arbitrarily. See also `ngf.attach()` below.
 * `ngf.reattach(detached)` - Takes an object returned from `ngf.detach()` (see above) and reattaches it to the model, calling set on the model as necessary. Presumably, the values of this object will have been mutated in some way. Returns a promise on completion.

### Iteration helpers

Often your JSON graph will contain lists, which you'll iterate using `ng-repeat`. This lib offers some helper utilities.

#### Iteration mode 1: simple ranges

`ngf.range(lo, hi)` returns an array of integers from `lo` to `hi` (inclusive). This list can be passed directly to `ng-repeat` and each integer can then be used as an index into your Falcor list. See the **recipes** section for examples.

#### Iteration mode 2: stepping pagers

A stepping pager supports the traditional paging scenario. It's an object gotten by calling `ngf.stepper(size)`, where `size` is the number of things on each page. See the **recipes** section for examples. A stepping pager has these methods:

 * `pager.prev()` - Go to the previous page.
 * `pager.next()` - Go to the next page.
 * `pager.hasPrev()` - Is there a previous page?
 * `pager.hasNext(total)` - Is there a next page? This method needs to know the total number of things in the list in order to work.
 * `pager.indices()` - Return an array of numbers representing the current page of items being viewed. This array can be passed to `ng-repeat` and each number can then be used as an index into your Falcor list.

#### Iteration mode 3: increasing pagers

An increasing pager supports the infinite scrolling scenario. It's an object gotten by calling `ngf.increaser(size)`, where `size` is the number of things to increase by each time. See the **recipes** section for examples. An increasing pager has these methods:

  * `pager.more()` - Increase the size of the list.
  * `pager.hasMore(total)` - Can the list be increased? This method needs to know the total number of things in the list in order to work.
  * `pager.indices()` - Return an array of numbers representing all the items being viewed. This array can be passed to `ng-repeat` and each number can then be used as an index into your Falcor list.

## Credit

Credit due to [@rolaveric](https://github.com/rolaveric/angular-falcor) for inspiration and providing some useful pieces to this puzzle. And of course the [Falcor](https://netflix.github.io/falcor/) and [Angular](https://angularjs.org/) teams.
