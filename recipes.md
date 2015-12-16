# Recipes

AKA, how to handle various common scenarios with ng-falcor.
These recipes aren't authoritative, just the current state of my thinking on how to do this stuff.
They'll likely evolve as time goes on.

## Pagination

When building a pagination UI, we need the following information:

 * Items indexed by sequential integers
 * Total count of available items
 * Step. AKA how many items to display per page
 * Offset into the list to start viewing

The items and total count are server-provided, while step and offset are userstate.
Our JSON graph will look like this:

```
things
|--0: $ref
|--1: $ref
|--2: $ref
|--...
|--N: $ref
`--count: 120
```

Our controller looks like this:

```js
function($scope, ngf) {

  var step = 20;
  var offset = 0;

  $scope.indices = function() {
    var result = [];
    for (var i=offset; i<offset + step; i++) {
      result.push(i);
    }
    return result;
  }

  $scope.pages = function() {
    var result = [];
    var length = ngf('things.length');
    if (length !== undefined) {
      for (var i=offset; i<length; i+=step) {
        result.push(Math.floor(i / step));
      }
    }
    return result;
  }

  $scope.hasNext = function() {
    return offset + step < ngf('things.length');
  }

  $scope.hasPrev = function() {
    return offset - step > 0;
  }

  $scope.goNext = function(n) {
    return offset += step;
  }

  $scope.goPrev = function(n) {
    return offset -= step;
  }

  scope.ngf = ngf;
}
```

Finally comes the template, where everything comes together.

```html
<ul>
  <li ng-repeat="idx in indices()"
      ng-if="idx < ngf('things.length')"
      ng-show="ngf('things', idx, 'id')">
    <span>Foo: {{ ngf('things', idx, 'foo') }}</span>
    <span>Bar: {{ ngf('things', idx, 'bar') }}</span>
  </li>
</ul>

<button ng-click="goPrev()"
        ng-disabled="!hasPrev()">&lt;</button>

<button ng-repeat="pageIndex in pages()"
        ng-click="pageTo(pageIndex)">{{pageIndex + 1}}</button>

<button ng-click="goNext()"
        ng-disabled="!hasNext()">&gt;</button>
```

## Naive Infinite Scrolling

Infinite scrolling requires a load more button positioned below the list, which when activated appends to the list.
To do infinite scrolling, we need this information:

 * Items indexed by sequential integers
 * Total count of available items
 * Step. AKA how many items to append when loading more
 * Amount of items being displayed (grows as you scroll)

The items and total count are server-provided, while step and amount are userstate.
This is very similar to pagination.
The JSON graph looks like this:

```
things
|--0: $ref
|--1: $ref
|--2: $ref
|--...
|--N: $ref
`--count: 120
```

The controller looks like this:

```js
function($scope, ngf) {

  var step = 20;
  var amount = 0;

  $scope.indices = function() {
    var result = [];
    for (var i=offset; i<offset + step; i++) {
      result.push(i);
    }
    return result;
  }

  $scope.loadMore = function() {
    amount += step;
  }

  $scope.hasMore = function() {
    return amount + step < ngf('things.length');
  }

  scope.ngf = ngf;
}
```

Finally, the template.

```html
<ul>
  <li ng-repeat="idx in indices()"
      ng-if="idx < ngf('things.length')"
      ng-show="ngf('things', idx, 'id')">
    <span>Foo: {{ ngf('things', idx, 'foo') }}</span>
    <span>Bar: {{ ngf('things', idx, 'bar') }}</span>
  </li>
</ul>

<button ng-click="loadMore()"
        ng-disabled="!hasMore()">Load More</button>
```

## Anchored Infinite Scrolling

Naive infinite scrolling can be sub-optimal when when the list shifts on the server side between requests.
For example, if the list is sorted by newest first, new items might be added at the top.
If sorted alphabetically, items may drop in or out anywhere in the list over time.
If sorted by popularity, order may change arbitrarily over time.

Anchored infinite scrolling addresses the concern for recency-sorted lists by anchoring pagepoints to dates.
For example, consider a list sorted by newest first.
A load more request would be anchored to a max date determined by the oldest item in the previous call, or current time if no calls are yet made.
This prevents dupes from shifting in next pages of results.

For anchored pagination, we need a JSON graph like this:

```
thingsByMaxDate
|--2015-12-16T21:43:55.737Z
|  |--0: $ref
|  |--1: $ref
|  |--...
|  `--N: $ref
|--2015-12-15T20:12:21.863Z
|  `--...
`--...
```

Then, our controller would look like this:

```js
function($scope, ngf) {

  var size = 20;

  $scope.maxDates = [new Date().toISOString()];

  $scope.loadMore = function() {
    var earliest = getEarliest();
    $scope.maxDates.push(earliest);
  };

  $scope.hasMore = function() {
    var earliest = getEarliest();
    return ngf('thingsByMaxDate', earliest, 0, 'date');
  };

  $scope.indices = function() {
    var result = [];
    for (var i=0; i<size; i++) {
      result.push(i);
    }
    return result;
  }

  function getEarliest() {
    var lastMaxDate = $scope.maxDates[$scope.maxDates - 1];
    var earliest = ngf('thingsByMaxDate', lastMaxDate, size - 1, 'date');
    return earliest;
  }
}
```

Finally, the template.

```html
<ul ng-repeat="maxDate in maxDates">
  <li ng-repeat="idx in indices()"
      ng-show="ngf('thingsByMaxDate', maxDate, idx, 'id')">
    <span>Foo: {{ ngf('thingsByMaxDate', maxDate, idx, 'foo') }}</span>
    <span>Bar: {{ ngf('thingsByMaxDate', maxDate, idx, 'bar') }}</span>
  </li>
</ul>

<button ng-click="loadMore()"
        ng-disabled="!hasMore()">Show More</button>
```

One caveat to this is with the `var size = 20` bit, which is hard-coded and non-DRY between client and server.
I'm exploring ways around this currently.
