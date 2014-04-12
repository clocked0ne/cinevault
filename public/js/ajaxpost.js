// AJAX file uploading with progress bar

function uploadCall() {
var messageWrp = $('#fileDataMsg', content);
					
			$('#fileToUpload', content).change(function(){
				
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

      $('#uploadFileBtn', content).click(function () {
      	// Form data.
        var fd = new FormData();
        fd.append("fileToUpload", document.getElementById('fileToUpload').files[0]);
        
        var xhr = new XMLHttpRequest();
				
				// Progress listerner.
				xhr.upload.addEventListener("progress", function (evt) {
				  if (evt.lengthComputable) {
				    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
				    messageWrp.html(percentComplete.toString() + '%');
				  }
				  else {
				    messageWrp.html('unable to compute');
				  }
				}, false);
				
				// On finished.
        xhr.addEventListener("load", function (evt) {
	      	
	      	// Parse json.
	      	var obj = $.parseJSON(evt.target.responseText);
	      
	      	window.location.hash = 'File';
	      
	        // Show success message.
	        MVC.message.show({text: obj.message, hideDealy: 2000});
	      }, false);
	      
	      // On failed.
        xhr.addEventListener("error", function (evt) {
	      	MVC.message.show({text: 'There was an error attempting to upload the file.', 
	      		hideDealy: 2000});
	      }, false);
        
        // On cancel.
        xhr.addEventListener("abort", function (evt) {
	      	MVC.message.show({text: 'The upload has been cancelled by the user or the browser dropped the connection.', 
	      		hideDealy: 2000});
	      }, false);
	      
        xhr.open("POST", "quotes/upload");
        xhr.send(fd);
        return false;
      });
	  
}