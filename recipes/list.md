# Displaying a list

In this example we display the first five people followed by a user represented by a given `userId`. We assume the `userId` comes from client-side URL state, as in `/users/:userId`.

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
$scope.ngf = ngf;
```

In the directive template:

```html
<ul>
  <li ng-repeat="idx in ngf.range(0, 4)">
    <img src="{{ followees(idx, 'avatar') }}"/><br/>
    Handle: {{ followees(idx, 'handle') }}<br/>
  </li>
</ul>
```
