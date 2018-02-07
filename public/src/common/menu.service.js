(function () {
"use strict";

angular.module('common')
.service('MenuService', MenuService);


MenuService.$inject = ['$http', 'ApiPath'];
function MenuService($http, ApiPath) {
  var service = this;
  service.price = 0;
  service.ordered = [];
  service.getCategories = function () {
    return $http.get('json/categories').then(function (response) {
      return response.data;
    });
  };
  
  service.buyDeal = function(menuItem){
	  var price = isNaN(parseFloat(menuItem.price_small)) ? parseFloat(menuItem.price_large) : parseFloat(menuItem.price_small);console.log(service.ordered)
	  var temp = [];
	  var doubleflag = false;
	  var revalue = 0;
	  for (var i in service.ordered){
		  if (menuItem.id == service.ordered[i].id){
			  doubleflag = true;
			  continue;
		  }
		  temp.push(service.ordered[i]);
	  }
	  if (!doubleflag){console.log(service.price + '@' + price)
		  service.price += price;
		  temp.push(menuItem);
	  } else {
		  service.price -= price;
	  }
	  service.ordered = temp;
	  // service.ordered.push(menuItem);
	  return;
  }


  service.getMenuItems = function (category) {
    var config = {};
    if (category) {
      config.params = {'category': category};
    }

    return $http.get('json/menu_items', config).then(function (response) {
      return response.data;
    });
  };


  service.getMenuItems = function (shortName) {
    var config = {};
    if (shortName) {
      config.params = {category: shortName};
    }

    return $http.get('json/menu_items', config).then(function (response) {
      return response.data;
    });
  }


  service.getCategory = function (shortName) {
	  var config = {};
    if (shortName) {
      config.params = {category: shortName};
    }
    return $http.get('json/category_items/',config).then(function (response) {
      return response.data;
    });
  };


  service.getMenuItem = function(shortName) {
    return $http.get('json/menu_items/' + shortName + '.json')
    .then(function(response) {
      return response.data;
    });
  };


  service.saveMenuItem = function (menuItem) {console.log(menuItem)
    // return $http.put(ApiPath + '/menu_items/' + menuItem.short_name, menuItem)
    return $http.put(ApiPath + '/menu_items/' + menuItem.short_name, menuItem)
    .then(function (response) {
      return response.data;
    });
  };
  service.delCategory = function (category){
    return $http.post('json/delcategory/', category)
    .then(function (response) {
      return response.data;
    });
  }
  service.delItem = function (shortname){
    return $http.post('json/delitem/', {'shortname':shortname})
    .then(function (response) {
      return response.data;
    });
  }
  service.saveCategory = function (category) {
    return $http.post('json/addcategory/', category)
    .then(function (response) {
      return response.data;
    });
  };

}



})();
