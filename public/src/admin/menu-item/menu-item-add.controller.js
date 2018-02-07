(function() {
"use strict";

angular.module('admin')
.controller('MenuItemAddController', MenuItemAddController);


MenuItemAddController.$inject = ['$stateParams', '$state', '$log'];
function MenuItemAddController($stateParams, $state, $log) {
  var $ctrl = this;console.log(this)
  $ctrl.menuItem = {};//this.$resolve.$stateParams.categoryId
  // $ctrl.menuItem = menuItem;
  $ctrl.onSave = function (menuItem) {
    $state.go('admin.auth.category',
              {categoryId: menuItem.category_short_name},
              {reload: true}); // tells resolves to refresh
  };

  $ctrl.onCancel = function () {
    $state.go('admin.auth.category',
              {categoryId: menuItem.category_short_name});
  };

  $ctrl.onError = function (response) {
    $log.error(response); // for debugging
  };

}


})();
