(function () {
"use strict";

angular.module('admin')
.controller('CategoryItemsController', CategoryItemsController);


CategoryItemsController.$inject = ['category', 'menuItems','MenuService'];
function CategoryItemsController(category, menuItems, MenuService) {
  var $ctrl = this;
  $ctrl.category = category;
  $ctrl.menuItems = menuItems.menu_items;
  $ctrl.delCategory = function (){
    if (confirm('Are you sure want to delete this category?'))
      MenuService.delCategory(category);
  }
  $ctrl.delItem = function (shortname){
    if (confirm('Are you sure want to delete this item?'))
      MenuService.delItem(shortname);
  }
}


})();
