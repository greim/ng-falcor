# Pagination

In this example we paginate a list of people followed by a user represented by a given `userId`. We assume the `userId` comes from client-side URL state, as in `/users/:userId`.

JSON graph:

```
users
`--:id
   `--user_followee_list
      |--length
      `--:index
```

Calling the directive:

```html
<user-list list-root="['users', userId, 'user_followee_list']"/>
```

In the directive:

```js
$scope.followees = ngf.scope(listRoot);
$scope.pager = ngf.stepper(5); // five items per page
```

In the directive template:

```html
<ul>
  <li ng-repeat="idx in pager.indices()">
    <img src="{{ followees(idx, 'avatar') }}"/><br/>
    Handle: {{ followees(idx, 'handle') }}<br/>
  </li>
</ul>
<button ng-if="pager.hasPrev()" ng-click="pager.prev()">Prev</button>
<button ng-if="pager.hasNext(followees('length'))" ng-click="pager.next()">Next</button>
```
