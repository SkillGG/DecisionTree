let goodB = false;
// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
	goodB = true;
}