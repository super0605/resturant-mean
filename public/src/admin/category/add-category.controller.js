(function() {
"use strict";

angular.module('admin')
.controller('AddCategoryController', AddCategoryController);


AddCategoryController.$inject = ['$stateParams', '$state','$log'];
function AddCategoryController($stateParams, $state,$log) {
  var $ctrl = this;

  $ctrl.onSave = function () {alert()
    history.back();
	loaction.reload();
	$state.go('admin.auth.category',
              {reload: true}); // tells resolves to refresh
  };

  $ctrl.onCancel = function () {
    $state.go('admin.auth.category');
  };

  $ctrl.onError = function (response) {
    $log.error(response); // for debugging
  };

}


})();
