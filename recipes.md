# Recipes

AKA, how to handle various common scenarios with ng-falcor.
These recipes aren't authoritative, just the current state of my thinking on how to do this stuff.
They'll likely evolve as time goes on.

## Detail Page

A detail page displays a single item, such as a user, product, or post.
It would typically have a userstate identifier taken from the client's URL, which is used to lookup the item in question.
We'll explore two scenarios, user profile and product detail.

### User Profile

Client URL route:

```
/users/:username
```

JSON graph:

```
usersByUsername
|--anne1979: $ref(usersById/a64db3c5)
|--greim: $ref(usersById/35f7ab53)
`--...
usersById
|--a64db3c5: { ... }
|--35f7ab53: { ... }
`--...
```

Controller:

```js
function($scope, ngf, $stateParams) {
  $scope.username = $stateParams.username;
  $scope.ngf = ngf;
}
```

Template:

```html
<div>
  <span>First name: {{ ngf('usersByUsername', username, 'first_name') }}</span>
  <span>Last name: {{ ngf('usersByUsername', username, 'last_name') }}</span>
</div>
```

### Product Detail

Client URL route:

```
/products/:productId
```

JSON graph:

```
productsById
|--a194dc72fa1: { ... }
|--84a46ce8f9a: { ... }
`--...
```

Controller:

```js
function($scope, ngf, $stateParams) {
  $scope.id = $stateParams.productId;
  $scope.ngf = ngf;
}
```

Template:

```html
<div>
  <span>Name: {{ ngf('productsById', id, 'name') }}</span>
  <span>Price: {{ ngf('productsById', id, 'price') | currency }}</span>
</div>
```

## Pagination

A pagination UI needs the following info:

 * Items indexed by sequential integers
 * Total count of available items
 * Page count, AKA how many items to display per page
 * Offset into the list to start viewing

The items and total count are server-provided, while page count and offset are userstate.

JSON graph:

```
things
|--0: $ref
|--1: $ref
|--2: $ref
|--...
|--N: $ref
`--count: 120
```

Controller:

```js
function($scope, ngf) {

  var pageCount = 20;
  var offset = 0;

  $scope.indices = function() {
    var result = [];
    for (var i=offset; i<offset+pageCount; i++) {
      result.push(i);
    }
    return result;
  }

  $scope.pages = function() {
    var result = [];
    var count = ngf('things.count');
    if (count !== undefined) {
      for (var i=offset; i<count; i+=pageCount) {
        result.push(Math.floor(i / pageCount));
      }
    }
    return result;
  }

  $scope.hasNext = function() {
    return offset + pageCount < ngf('things.count');
  }

  $scope.hasPrev = function() {
    return offset - pageCount > 0;
  }

  $scope.pageNext = function(n) {
    offset += pageCount;
  }

  $scope.pagePrev = function(n) {
    offset -= pageCount;
  }

  $scope.pageTo = function(pageIdx) {
    offset = pageIdx * pageCount;
  }

  $scope.ngf = ngf;
}
```

Template:

```html
<ul>
  <li ng-repeat="idx in indices()"
      ng-show="ngf('things', idx, 'id')">
    <span>Foo: {{ ngf('things', idx, 'foo') }}</span>
    <span>Bar: {{ ngf('things', idx, 'bar') }}</span>
  </li>
</ul>

<button ng-click="pagePrev()"
        ng-disabled="!hasPrev()">&lt;</button>

<button ng-repeat="pageIndex in pages()"
        ng-click="pageTo(pageIndex)">{{pageIndex + 1}}</button>

<button ng-click="pageNext()"
        ng-disabled="!hasNext()">&gt;</button>
```

## Naïve Infinite Scrolling

Infinite scrolling requires a "load more" button to be positioned below the list, which when activated appends to the list.
An infinite scrolling UI needs the following info:

 * Items indexed by sequential integers
 * Total count of available items
 * Load count, AKA how many items to append when loading more
 * Amount of items currently being displayed (grows as you scroll)

The items and total count are server-provided, while load count and amount are userstate.
This is very similar to pagination.

JSON graph:

```
thingsByIndex
|--0: $ref(thingsById/...)
|--1: $ref(thingsById/...)
|--...
|--N: $ref(thingsById/...)
`--count: 120
thingsById
|--a57b4ec3: { ... }
`--...
```

Controller:

```js
function($scope, ngf) {

  var loadCount = 20;
  var amount = loadCount;

  $scope.indices = function() {
    var result = [];
    for (var i=0; i<amount; i++) {
      result.push(i);
    }
    return result;
  }

  $scope.loadMore = function() {
    amount += loadCount;
  }

  $scope.hasMore = function() {
    return amount + 1 < ngf('thingsByIndex.count');
  }

  $scope.ngf = ngf;
}
```

Finally, the template.

```html
<ul>
  <li ng-repeat="idx in indices()"
      ng-show="ngf('thingsByIndex', idx, 'id')">
    <span>Foo: {{ ngf('thingsByIndex', idx, 'foo') }}</span>
    <span>Bar: {{ ngf('thingsByIndex', idx, 'bar') }}</span>
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
A load more request would be anchored to a maxdate determined by the oldest item in the previous call, or current time if no calls are yet made.
This prevents dupes from shifting into next pages of results.

JSON graph:

```
thingsByMaxDate
|--2015-12-16T21:43:55.737Z
|  |--0: $ref(thingsById/...)
|  |--1: $ref(thingsById/...)
|  |--...
|  `--N: $ref(thingsById/...)
|--2015-12-15T20:12:21.863Z
|  `--...
`--...
thingsById
|--a57b4ec3: { ... }
`--...
```

Controller:

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

Template:

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

## Infinite Scrolling A Sublist

This combines aspects of detail pages and infinite scroll.
This example explores the followers of a user.

Client URL route:

```
/users/:userId/followers
```

JSON graph:

```
usersById
|--a57b4ec3
|  |--username: micky123
|  `--followers
|     |--count: 113
|     |--0: $ref(usersById/...)
|     |--1: $ref(usersById/...)
|     |--...
|     `--N: $ref(usersById/...)
`--...
```

Controller:

```js
function($scope, ngf, $stateParams) {

  var userId = $stateParams.userId;
  var loadCount = 20;
  var amount = loadCount;

  $scope.indices = function() {
    var result = [];
    for (var i=0; i<amount; i++) {
      result.push(i);
    }
    return result;
  }

  $scope.loadMore = function() {
    amount += loadCount;
  }

  $scope.hasMore = function() {
    var count = ngf('usersById', userId, 'followers', 'count');
    return amount + 1 < count;
  }

  $scope.ngf = ngf;
}
```

Finally, the template.

```html
<ul>
  <li ng-repeat="idx in indices()"
      ng-show="ngf('usersById', userId, 'followers', idx, 'id')">
    <span>
      First name:
      {{ ngf('usersById', userId, 'followers', idx, 'first_name') }}
    </span>
    <span>
      Last name:
      {{ ngf('usersById', userId, 'followers', idx, 'last_name') }}
    </span>
  </li>
</ul>

<button ng-click="loadMore()"
        ng-disabled="!hasMore()">Load More</button>
```
