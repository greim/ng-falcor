# Product Detail

We obtain a `productId` from client side URL state, such as `/products/:productId`. We use it to display a product detail page.

JSON graph:

```
products
`--:id
   |--name
   `--price
```

Controller:

```js
function($scope, ngf, $stateParams) {
  $scope.productId = $stateParams.productId;
  $scope.ngf = ngf;
}
```

Template:

```html
<h2>Product Detail</h2>
<div>
  <span>Name: {{ ngf(['productsById', productId, 'name']) }}</span>
  <span>Price: {{ ngf(['productsById', productId, 'price']) | currency }}</span>
</div>
```
