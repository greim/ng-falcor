# Editing Data in a Form

Suppose you want to display a subset of your JSON graph in a form, which you can edit. When you press the "save" button, all of that data is saved back through Falcor in one operation.

Controller:

```js
function($scope, ngf) {
  $scope.ngf = ngf;
  $scope.startEdits = function() {
    ngf.detach({
      firstName: ['users', loggedInUserId, 'first_name'],
      lastName: ['users', loggedInUserId, 'last_name'],
      email: ['users', loggedInUserId, 'email']
    }).then(edits => $scope.edits = edits);
  };
  $scope.cancelEdits = function() {
    delete $scope.edits;
  };
  $scope.saveEdits = function() {
    return ngf.reattach($scope.edits);
  };
}
```

Template:

```html
<form ng-submit="saveEdits()">
  <h2>User Info</h2>
  <button ng-if="!edits" ng-click="startEdits()">Edit</button>
  <button ng-if="edits" ng-click="cancelEdits()">Cancel</button>
  <button ng-if="edits" ng-click="saveEdits()">Save</button>
  <p>
    <strong>First Name:</strong>
    <span ng-if="!edits">{{ngf('self', 'first_name')}}</span>
    <span ng-if="edits"><input type="text" model="edits.firstName"></span>
  </p>
  <p>
    <strong>Last Name:</strong>
    <span ng-if="!edits">{{ngf('self', 'last_name')}}</span>
    <span ng-if="edits"><input type="text" model="edits.lastName"></span>
  </p>
  <p>
    <strong>Email:</strong>
    <span ng-if="!edits">{{ngf('self', 'email')}}</span>
    <span ng-if="edits"><input type="text" model="edits.email"></span>
  </p>
</form>
```
