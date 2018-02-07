(function () {
"use strict";

angular.module('public')
.controller('MenuController', MenuController);

MenuController.$inject = ['menuCategories','MenuService'];
function MenuController(menuCategories,MenuService) {
  var $ctrl = this;
  $ctrl.menuCategories = menuCategories;
  $ctrl.price = MenuService.price;
}


})();
