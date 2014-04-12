window.MovieView = Backbone.View.extend({

    initialize: function () {
        this.render();

		
		console.log('monitor file browse... '+$('#fileToUpload')[0]);	
		// $('#fileToUpload', content).change(function(){
		$("#content").on("change", "#fileToUpload", function(event){
		var messageWrp = $('#fileDataMsg');
		console.log('File browse change event: ' + document.getElementById('fileToUpload').files[0].name);	
	        var file = document.getElementById('fileToUpload').files[0];
			if (file) {
                var fileSize = 0;
                if (file.size > 1024 * 1024){
					fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
				} else {
					fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
				}
				// File info message.
				messageWrp.html('Name: ' + file.name + ' Size: ' + fileSize + ' Type: ' + file.type);
			}
		});
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change"        : "change",
        "click .save"   : "beforeSave",
        "click .delete" : "deleteMovie",
        "drop #picture" : "dropHandler",
		"click #uploadFileBtn" : "uploadImage"
    },

    change: function (event) {
        // Remove any existing alert message
        utils.hideAlert();

        // Apply the change to the model
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);

        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
            utils.removeValidationError(target.id);
        }
	},

    beforeSave: function () {
        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        this.saveMovie();
        return false;
    },

    saveMovie: function () {
        var self = this;
        console.log('before save');
        this.model.save(null, {
            success: function (model) {
                self.render();
                app.navigate('movie/' + model.id, false);
                utils.showAlert('Success!', 'Movie saved successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to delete this movie', 'alert-error');
            }
        });
    },

    deleteMovie: function () {
        this.model.destroy({
            success: function () {
                alert('Movie deleted successfully');
                window.history.back();
            }
        });
        return false;
    },

    dropHandler: function (event) {
        event.stopPropagation();
        event.preventDefault();
        var e = event.originalEvent;
        e.dataTransfer.dropEffect = 'copy';
        this.pictureFile = e.dataTransfer.files[0];

        // Read the image file from the local file system and display it in the img tag
        var reader = new FileReader();
        reader.onloadend = function () {
            $('#picture').attr('src', reader.result);
        };
        reader.readAsDataURL(this.pictureFile);
    },

    uploadImage: function () {
	console.log('uploadImage function...');	

        // $('#uploadFileBtn', content).click(function () {
      	// Form data.
		$("#content").on("click", "#uploadFileBtn", function(event){
		console.log('Upload button clicked event');	
        var fd = new FormData();
        fd.append("fileToUpload", document.getElementById('fileToUpload').files[0]);
        
		var xhr = new XMLHttpRequest();
		console.log('new XMLHttpRequest');
				
				// Progress listener.
				xhr.upload.addEventListener("progress", function (evt) {
				console.log('Shifting data like a mofo');
				  if (evt.lengthComputable) {
				    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
				    messageWrp.html(percentComplete.toString() + '%');
				  }
				  else {
				    messageWrp.html('Unable to compute');
				  }
				}, false);
				
				// On finished.
        xhr.addEventListener("load", function (evt) {
	      	
	      	// Parse json.
	      	var obj = $.parseJSON(evt.target.responseText);
	      
	      	window.location.hash = 'File';
	      
	        // Show success message.
	        // MVC.message.show({text: obj.message, hideDealy: 2000});
	      }, false);
	      
	      // On failed.
        xhr.addEventListener("error", function (evt) {
	      	// MVC.message.show({text: 'There was an error attempting to upload the file.', hideDealy: 2000});
	      }, false);
        
        // On cancel.
        xhr.addEventListener("abort", function (evt) {
	      	// MVC.message.show({text: 'The upload has been cancelled by the user or the browser dropped the connection.', hideDealy: 2000});
	      }, false);
	      
        xhr.open("POST", "movies/upload");
        xhr.send(fd);
        return false;
		// });
		});
    }

});
