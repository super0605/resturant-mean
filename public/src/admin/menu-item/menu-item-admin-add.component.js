(function () {
"use strict";

angular.module('admin')
.component('menuItemAdminAdd', {
  templateUrl: 'src/admin/menu-item/menu-item-admin-add.html',
  bindings: {
    menuItem: '<',
    onSave: '&',
    onError: '&',
    onCancel: '&'
  },
  controller: MenuItemAdminAddController,
        bindings: {
            param: '=' // or key: '<' it depends on what binding you need
        }
});


MenuItemAdminAddController.$inject = ['MenuService', '$state','ApiPath', 'Upload'];
function MenuItemAdminAddController(MenuService, $state,ApiPath, Upload) {
  var $ctrl = this;
  // $ctrl.apiBasePath = ApiPath + '/images';
  $ctrl.apiBasePath = 'json/images';
// console.log(this)
  // Forces browser to think it's a new image URL
  $ctrl.cacheBuster = new Date().getTime();

  $ctrl.cancel = function () {
    $ctrl.onCancel();
  };


  $ctrl.save = function () {
    $ctrl.menuItem.file = $ctrl.file;
    Upload.base64DataUrl($ctrl.file).then(function (dataUrl) {
      delete $ctrl.file.$ngfBlobUrl;
	  $ctrl.file.$ngfDataUrl = dataUrl;
	  $ctrl.menuItem.category_short_name = $ctrl.param.short_name;
      $ctrl.savemenuItem();
    });
  };

  $ctrl.savemenuItem = function () {console.log($ctrl)
		Upload.upload({
            url: 'json/additem/', //webAPI exposed to upload the file
            data:$ctrl.menuItem //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if(resp.data.error_code === 0){ //validate success
				$ctrl.onSave();
            } else {
                console.log($ctrl.file.$ngfDataUrl)
            }
        }, function (resp) { //catch error
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
		});
  };


  function getBase64(dataUrl) {
    // Make sure we have a dataurl
    if (!dataUrl) {
      return null;
    }

    // Make sure the contents are populated. Split
    // to pull out base64
    //
    // Format: data:<mimeType>;base64,<what-we-want>
    var splitDataUrl = dataUrl.split(',');
    if (splitDataUrl.length !== 2) {
      return null;
    }

    var base64 = splitDataUrl[1];
    return base64;
  }


  $ctrl.valid = function () {
    // if (!$ctrl.validatePrices()) {
    //   return false;
    // }
    if ($ctrl.form.$invalid) {
      return false;
    }
    return true;
  };

  $ctrl.validatePrices = function () {
    if (!$ctrl.menuItem.price_small && !$ctrl.menuItem.price_large) {
      $ctrl.priceErrorMessage = 'Price is required';
      return false;
    }

    if ($ctrl.menuItem.price_small && $ctrl.menuItem.price_large) {
      if (!$ctrl.menuItem.small_portion_name || !$ctrl.menuItem.large_portion_name) {
        $ctrl.priceErrorMessage = 'Portion names are required for both prices';
        return false;
      }
    }

    if ($ctrl.menuItem.small_portion_name && !$ctrl.menuItem.price_small) {
      $ctrl.priceErrorMessage = 'If portion is filled in, an associated price must be entered';
      return false;
    }

    if ($ctrl.menuItem.large_portion_name && !$ctrl.menuItem.price_large) {
      $ctrl.priceErrorMessage = 'If portion is filled in, an associated price must be entered';
      return false;
    }

    $ctrl.priceErrorMessage = '';
    return true;
  };
}


})();
