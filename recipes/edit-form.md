# Editing Data in a Form

Suppose you want to display a subset of your JSON graph in a form, which you can edit. When you press the "save" button, all of that data is saved back through Falcor in one operation.

In this example we have a "my profile" edit form.

JSON Graph:

```
.
|--self (reference to ['users', :id])
|--users
| `--:id
|     |--avatar (reference to ['media', :id])
|     |--first_name
|     |--last_name
|     `--email
`--media
   `--:id
       `--src
```

Controller:

```js
function($scope, ngf) {

  $scope.ngf = ngf;

  ngf.detach({
    firstName: ['self', 'first_name'],
    lastName: ['self', 'last_name'],
    email: ['self', 'email'],
    avatar: ['self', 'avatar', 'src'],
  }).then(edits => $scope.edits = edits);

  $scope.cancel = function() {
    delete $scope.edits;
  };

  $scope.save = function() {
    return ngf.reattach($scope.edits);
    delete $scope.edits;
  };
}
```

Template:

```html
<form ng-submit="save()">
  <h2>User Info</h2>
  First Name: <input type="text" model="edits.firstName"><br/>
  Last Name: <input type="text" model="edits.lastName"><br/>
  Email: <input type="text" model="edits.email"><br/>
  Avatar: <input type="text" model="edits.avatar"><br/>
  <button ng-if="edits" ng-click="cancel()">Cancel</button>
  <button ng-if="edits">Save</button>
</form>
```
