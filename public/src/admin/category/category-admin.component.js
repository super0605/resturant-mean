(function () {
"use strict";

angular.module('admin')
.component('categoryAdmin', {
  templateUrl: 'src/admin/category/category-admin.html',
  bindings: {
    onSave: '&',
    onError: '&',
    onCancel: '&'
  },
  controller: categoryAdminController
});


categoryAdminController.$inject = ['MenuService', 'ApiPath', 'Upload', '$state'];
function categoryAdminController(MenuService, ApiPath, Upload,$state) {
  var $ctrl = this;

  $ctrl.onSave = function () {
	$state.go('admin.auth.category',
              {reload: true}).then(function(){
				location.reload();
			  }); // tells resolves to refresh
  };

  $ctrl.onCancel = function () {
    $state.go('admin.auth.category');
  };

  $ctrl.onError = function (response) {
    $log.error(response); // for debugging
  };

  // $ctrl.apiBasePath = ApiPath + '/images';
  $ctrl.apiBasePath = 'json/images';

  // Forces browser to think it's a new image URL
  $ctrl.cacheBuster = new Date().getTime();

  $ctrl.cancel = function () {
    $ctrl.onCancel();
  };



	// $ctrl.save = function () {
		// Upload.upload({
			  // url: 'json/addcategory/',
			  // method: 'POST',
			  // data: $ctrl.category
		// }).then(function (category) {
		  // $ctrl.category = category;
		  // $ctrl.onSave({category: category});
		// }, function (response) {
		  // $ctrl.onError({response: response});
		// });
	// };

  $ctrl.getImgUrl = function (){
	  return $('.form-group img.img-responsive.img-rounded.admin-img').attr('src');
  }


  // $ctrl.save = function () {
		// $ctrl.category.img = $ctrl.getImgUrl();
		// $ctrl.saveCategory();
  // };

  $ctrl.save = function () {
	  $ctrl.category.file = $ctrl.file;
    Upload.base64DataUrl($ctrl.file).then(function (dataUrl) {
      delete $ctrl.file.$ngfBlobUrl;
	  $ctrl.file.$ngfDataUrl = dataUrl;
      $ctrl.saveCategory();
    });
  };


  $ctrl.saveCategory = function () {
		Upload.upload({
            url: 'json/addcategory/', //webAPI exposed to upload the file
            data:$ctrl.category //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if(resp.data.error_code === 0){ //validate success
                // $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
				$ctrl.onSave();
            } else {
                console.log($ctrl.file.$ngfDataUrl)
				// $window.alert('an error occured');
            }
        }, function (resp) { //catch error
            console.log('Error status: ' + resp.status);
            // $window.alert('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            // vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
		});
    // return MenuService.saveCategory($ctrl.category).then(function (category) {
      // $ctrl.category = category;
      // $ctrl.onSave({category: category});
    // }, function (response) {
      // $ctrl.onError({response: response});
    // })
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
    if ($ctrl.form.$invalid) {
      return false;
    }
    return true;
  };

}


})();
