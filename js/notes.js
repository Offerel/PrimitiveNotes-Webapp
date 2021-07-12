/**
 * Notes
 *
 * @version 1.0.0
 * @author Offerel
 * @copyright Copyright (c) 2021, Offerel
 * @license GNU General Public License, version 3
 */
var mde;
var tagify;
var cval;
var filelist = [];

document.addEventListener("DOMContentLoaded", function() {
	if(document.getElementById('lform')) {
		document.getElementById("user").focus();
		document.querySelector('html').classList.add('login');
	}
	
	let cookie = decodeURIComponent(document.cookie).split('; ');
	cookie.forEach(function(element){
		if(element.indexOf('primitivenotes=') == 0) {
			cval = JSON.parse(element.substring(15));
		}
	});

	document.querySelectorAll('#nlist li').forEach(element => element.addEventListener('click', showNote));
	document.querySelectorAll('#nlist li').forEach(element => element.addEventListener('contextmenu', onContextMenu));
	
	if(document.getElementById('left')) {
		document.getElementById('left').style.width = (cval.barw) ? cval.barw+'px':'';
		new ResizeObserver(barwidth).observe(document.getElementById('left'));
	}

	if(document.getElementById('nlist')) {
		var transitioning = false;
		document.getElementById('nlist').addEventListener("dragenter", function (e) {
			e.preventDefault();
			e.stopPropagation();
			transitioning = true;
			setTimeout(function() {
				transitioning = false;
			}, 1);
			document.getElementById('nlist').classList.add('highlight');
		});
		document.getElementById('nlist').addEventListener("dragleave", function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (transitioning === false) {
				document.getElementById('nlist').classList.remove('highlight');
			}
		});    
		document.getElementById('nlist').addEventListener("dragover", function (e) {
			e.preventDefault();
			e.stopPropagation();
		});
		document.getElementById('nlist').addEventListener("drop", function (e) {
			e.preventDefault();
			e.stopPropagation();
			document.getElementById('nlist').classList.remove('highlight');
			manageDropUpload(e.dataTransfer.files);
		});
	}

	tagify = new Tagify(document.getElementById('ntags'), {
		whitelist:[],
		dropdown : {
			classname     : "color-blue",
			enabled       : 0,
			maxItems      : 0,
			position      : "text",
			closeOnSelect : false,
			highlightFirst: true
		},
		trim: true,
		duplicates: false,
		enforceWhitelist: false,
		delimiters: ',|;| ',
		placeholder: 'Tags'
	});

	mde = new EasyMDE({
		element: document.getElementById('notesarea'),
		spellChecker: false,
		previewImagesInEditor: false,
		autofocus: false,
		promptURLs: true,
		inputStyle: 'contenteditable',
		nativeSpellcheck: true,
		indentWithTabs: true,
		sideBySideFullscreen: false,
		autoDownloadFontAwesome: false,
		renderingConfig: {
			codeSyntaxHighlighting: true,
			sanitizerFunction: function(renderedHTML) {
				return renderedHTML.replaceAll(cval.mf, document.location.pathname+'?nimg=');
			},
		},
		shortcuts: {
			Preview: "Cmd-P",
		},
		toolbar: 	[
					{ name: 'Save',
						action: saveNote,
						title: 'Save',
						icon: '<svg style="position: relative; top: -2px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"></path><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"></path></svg>',
					}, '|',
					{
						name: 'Undo',
						action: EasyMDE.undo,
						title: 'Undo',
						icon: '<svg style="width: 20px;height: 20px;" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z"></path></svg>'
					}, {
						name: 'Redo',
						action: EasyMDE.redo,
						title: 'Redo',
						icon: '<svg style="width: 20px;height: 20px;" viewBox="0 0 24 24"><path fill="currentColor" d="M10.5,7A6.5,6.5 0 0,0 4,13.5A6.5,6.5 0 0,0 10.5,20H14V18H10.5C8,18 6,16 6,13.5C6,11 8,9 10.5,9H16.17L13.09,12.09L14.5,13.5L20,8L14.5,2.5L13.08,3.91L16.17,7H10.5M18,18H16V20H18V18Z"></path></svg>'
					}, '|', {
						name: 'Bold',
						action: EasyMDE.toggleBold,
						title: 'Bold',
						icon: '<svg style="width:20px;height:20px;position: relative;top: 1px;" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z" /></svg>'
					}, {
						name: 'Italic',
						action: EasyMDE.toggleItalic,
						title: 'Italic',
						icon: '<svg style="width:20px;height:20px;position: relative;top: 1px;" viewBox="0 0 24 24"><path fill="currentColor" d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z" /></svg>'
					}, 
					{
						name: 'Striketrough',
						title: 'Striketrough',
						action: EasyMDE.toggleStrikethrough,
						icon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M6.85,7.08C6.85,4.37,9.45,3,12.24,3c1.64,0,3,0.49,3.9,1.28c0.77,0.65,1.46,1.73,1.46,3.24h-3.01 c0-0.31-0.05-0.59-0.15-0.85c-0.29-0.86-1.2-1.28-2.25-1.28c-1.86,0-2.34,1.02-2.34,1.7c0,0.48,0.25,0.88,0.74,1.21 C10.97,8.55,11.36,8.78,12,9H7.39C7.18,8.66,6.85,8.11,6.85,7.08z M21,12v-2H3v2h9.62c1.15,0.45,1.96,0.75,1.96,1.97 c0,1-0.81,1.67-2.28,1.67c-1.54,0-2.93-0.54-2.93-2.51H6.4c0,0.55,0.08,1.13,0.24,1.58c0.81,2.29,3.29,3.3,5.67,3.3 c2.27,0,5.3-0.89,5.3-4.05c0-0.3-0.01-1.16-0.48-1.94H21V12z"/></g></g></g></svg>'
					},
					{
						name: 'Clean block',
						title: 'Clean block',
						action: EasyMDE.cleanBlock,
						icon: '<svg style="width: 18px;height: 18px;position: relative;top: -1px;" viewBox="0 0 24 24"><path fill="currentColor" d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z"></path></svg>'
					}, '|', 
					{
						name: 'Heading',
						title: 'Heading',
						action: EasyMDE.toggleHeading1,
						icon: '<svg style="width: 20px;height: 20px;" viewBox="0 0 24 24"><path fill="currentColor" d="M5,4V7H10.5V19H13.5V7H19V4H5Z"></path></svg>'
					}, '|',
					{
						name: 'Code',
						title: 'Code',
						action: EasyMDE.toggleCodeBlock,
						icon: '<svg style="width: 20px;height: 20px;" viewBox="0 0 24 24"><path fill="currentColor" d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z"></path></svg>'
					}, 
					{
						name: 'Quote',
						title: 'Quote',
						action: EasyMDE.toggleBlockquote,
						icon: '<svg style="width: 20px;height: 20px;" viewBox="0 0 24 24"><path fill="currentColor" d="M10,7L8,11H11V17H5V11L7,7H10M18,7L16,11H19V17H13V11L15,7H18Z"></path></svg>'
					}, 
					{
						name: 'Generic List',
						title: 'Generic List',
						action: EasyMDE.toggleUnorderedList,
						icon: '<svg style="width: 20px;height: 20px;" viewBox="0 0 24 24"><path fill="currentColor" d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z"></path></svg>'
					},
					{
						name: 'Numbered List',
						title: 'Numbered List',
						action: EasyMDE.toggleOrderedList,
						icon: '<svg style="width: 20px;height: 20px;" viewBox="0 0 24 24"><path fill="currentColor" d="M7,13V11H21V13H7M7,19V17H21V19H7M7,7V5H21V7H7M3,8V5H2V4H4V8H3M2,17V16H5V20H2V19H4V18.5H3V17.5H4V17H2M4.25,10A0.75,0.75 0 0,1 5,10.75C5,10.95 4.92,11.14 4.79,11.27L3.12,13H5V14H2V13.08L4,11H2V10H4.25Z"></path></svg>'
					}, '|',
					{
						name: 'Link',
						title: 'Create Link',
						action: EasyMDE.drawLink,
						icon: '<svg style="width:20px;height:20px" viewBox="0 0 24 24"><path fill="currentColor" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" /></svg>'
					},
					{ 
						name: 'RImage',
						title: 'Add image from URL',
						action: uplInsertImage,
						icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"></path><path d="M23 18V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zM8.5 12.5l2.5 3.01L14.5 11l4.5 6H5l3.5-4.5z"></path></svg>'
					},
					{ 
						name: 'LImage',
						title: 'Upload and insert local image',
						action: uplLocalImage,
						icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"></path><path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"></path></svg>'
					},
					{
						name: 'Table',
						title: 'Insert table',
						action: EasyMDE.drawTable,
						icon: '<svg style="width: 18px;height: 20px;" viewBox="0 0 24 24"><path fill="currentColor" d="M4,3H20A2,2 0 0,1 22,5V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V5A2,2 0 0,1 4,3M4,7V10H8V7H4M10,7V10H14V7H10M20,10V7H16V10H20M4,12V15H8V12H4M4,20H8V17H4V20M10,12V15H14V12H10M10,20H14V17H10V20M20,20V17H16V20H20M20,12H16V15H20V12Z"></path></svg>'
					}, '|',
					{
						name: 'Preview',
						title: 'Toggle Preview',
						action: tpreview,
						icon: '<svg style="width: 20px;height: 20px;" viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"></path></svg>'
					}, 
					{
						name: 'SideBySide',
						title: 'Toggle Side by Side',
						action: EasyMDE.toggleSideBySide,
						icon: '<svg style="top: -1px; position: relative;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px"><path d="M-74 29h48v48h-48V29zM0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"></path><path d="M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15h-9V6h9v13z"></path></svg>'
					},
					{
						name: 'Fullscreen',
						title: 'Toggle Fullscreen',
						action: EasyMDE.toggleFullScreen,
						icon: '<svg style="width: 24px;height: 24px;top: 2px;position: relative;" viewBox="0 0 24 24"><path fill="currentColor" d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z"></path></svg>'
					}, 
					{
						name: 'Delete',
						title: 'Delete Note',
						action: deleteNote,
						icon: '<svg style="width:21px;height:21px;" viewBox="0 0 25 25"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path></svg>'
					}, 
					{
						name: 'Guide',
						title: 'Markdown Guide',
						action: 'https://www.markdownguide.org/basic-syntax/',
						icon: '<svg style="position: relative;top: -1px;" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px"><g><rect fill="none" height="24" width="24"></rect><path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M12.01,18 c-0.7,0-1.26-0.56-1.26-1.26c0-0.71,0.56-1.25,1.26-1.25c0.71,0,1.25,0.54,1.25,1.25C13.25,17.43,12.72,18,12.01,18z M15.02,10.6 c-0.76,1.11-1.48,1.46-1.87,2.17c-0.16,0.29-0.22,0.48-0.22,1.41h-1.82c0-0.49-0.08-1.29,0.31-1.98c0.49-0.87,1.42-1.39,1.96-2.16 c0.57-0.81,0.25-2.33-1.37-2.33c-1.06,0-1.58,0.8-1.8,1.48L8.56,8.49C9.01,7.15,10.22,6,11.99,6c1.48,0,2.49,0.67,3.01,1.52 C15.44,8.24,15.7,9.59,15.02,10.6z"></path></g></svg>'
					}, 
					{ 
						name: 'Meta',
						action: togglemData,
						title: 'Display Metadata',
						icon: '<svg style="position: relative;top: -1px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"></path><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>'
					}, '|' ,
					{
						name:	'LogoutB',
						action:	logOut,
						title:	'Logout',
						icon:	'<svg style="width:24px;height:24px;position: relative;top: 2px;" viewBox="0 0 24 24"><path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V9H5V5H19V19H5V15H3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M10.08,15.58L11.5,17L16.5,12L11.5,7L10.08,8.41L12.67,11H3V13H12.67L10.08,15.58Z"></path></svg>'
					}
					],
	});

	if(document.querySelector('.EasyMDEContainer')) {
		document.querySelector('.EasyMDEContainer').addEventListener('paste', pasteParse, true);
		document.getElementById('source').addEventListener('click', oSource);
		document.getElementById('nsearch').addEventListener('keyup', searchList, false);
		document.getElementById('localFile').addEventListener('change', uploadFile, false);
		disableButtons('edit');
		document.getElementById('ntitle').value = '';
		tagify.removeAllTags();
		document.getElementById('author').value = '';
		document.getElementById('author').readOnly = false;
		document.getElementById('date').value = '';
		document.getElementById('updated').value = '';
		document.getElementById('source').value = '';
		document.getElementById('source').readOnly = false;
		tagify.settings.whitelist = document.getElementById('allTags').value.split(',');
	}
}, false);

function barwidth() {
	let dWidth = document.getElementById('left').offsetWidth - 1;
	var cookies = decodeURIComponent(document.cookie).split('; ');
	cookies.forEach(function(cookie) {
		if(cookie.indexOf('primitivenotes') === 0) {
			let acookie = JSON.parse(cookie.substr(15));
			let date = new Date();
	        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
	        let expires = "expires=" + date.toUTCString();
	        acookie.barw = dWidth;
	        let cValue = encodeURIComponent(JSON.stringify(acookie));	
			document.cookie = 'primitivenotes' + "=" + cValue + "; SameSite=Strict; Secure; " + expires + '; path='+location.href.substring(0, location.href.lastIndexOf("/")+1);
		}
	});
}
	
function manageDropUpload(files) {
	addLoader();
	
	for (let f of files) {
		filelist.push(f); 
	}
	
    doDropUpload();
}

function doDropUpload() {
    if(filelist.length > 0) {
        let data = new FormData();
        let thisfile = filelist[0];
        filelist.shift();
        data.append('dropFile', thisfile);
        let xhr = new XMLHttpRequest();
        xhr.open("POST", document.location.pathname);
        xhr.onload = function () {
    		let response = JSON.parse(xhr.response);
    		console.info(thisfile.name+' uploaded');
            doDropUpload();	

    		switch (response) {
    			case 0:
    				loadList();
    				break;
    			case 1:
    				alert('Upload not successfull. Please check server log.');
    				break;
    			case 2:
    				alert('File not allowed.');
    				break;
    			default:
    				break;
    		}
        };
        
        xhr.onerror = function(evt){
    		alert('There was an error during upload!');
    		console.error('There was an error during upload!');
            doDropUpload();
        };
    
        xhr.send(data);
    } else {
        removeLoader();
    }
}

function oSource() {
    if(this.value.length > 0) {
        window.open(this.value, '_blank').focus();
    }
}

function addLoader() {
    let loader = document.createElement("div");
	loader.id = "loader";
	document.getElementById("parent").appendChild(loader);
	
	let loaderbg = document.createElement("div");
	loaderbg.id = "loaderbg";
	document.getElementById("parent").appendChild(loaderbg);
}

function removeLoader() {
    document.getElementById("loader").remove();
    document.getElementById("loaderbg").remove();
}

function deleteNote(note) {
	let notename = (typeof note === 'object') ? document.getElementById('fname').value:note;
	let rload = (typeof note === 'object') ? true:false;
	
	if(notename.length < 1) {
		console.warn('No note to delete...');
		return;
	}
	
	addLoader();
	let data = 'action=dNote&note='+notename;
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			let response = JSON.parse(xhr.responseText);
			if(response.erg == 1) {
				removeLoader()
				console.info(response.message);
				if(response.data.length > 0) {
					if(confirm(response.message)) {
						let datad = 'action=dMedia&media='+encodeURIComponent(JSON.stringify(response.data));
						let xhrd = new XMLHttpRequest();
						xhrd.onreadystatechange = function () {
							if(this.readyState == 4 && this.status == 200) {
								let response = JSON.parse(xhr.responseText);
								alert(response);
							}
						}
						xhrd.open("POST", document.location.pathname, true);
						xhrd.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
						xhrd.send(datad);
					}
					(rload) ? window.location.href = document.location.pathname:loadList();
				}
			} else {
				console.warn(response.message);
				removeLoader();
			}
			
			(rload) ? window.location.href = document.location.pathname:loadList();
		}
	}
	xhr.open("POST", document.location.pathname, true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
}

function tpreview() {
	if(mde.isPreviewActive()) {
		document.getElementById('ntitle').disabled = false;
		document.getElementById('author').readOnly = false;
		document.getElementById('source').readOnly = false;
		disableButtons('edit');
		tagify.setReadonly(false);
		document.querySelector('#noteheader .tagify').classList.add('tedit');
		if(document.getElementById('tocButton')) document.getElementById("tocButton").remove();
	} else {
		document.getElementById('ntitle').disabled = true;
		document.getElementById('author').readOnly = true;
		document.getElementById('source').readOnly = true;
		disableButtons('view');
		tagify.setReadonly(true);
		document.querySelector('#noteheader .tagify').classList.remove('tedit');
		getTOC();
	}

	mde.togglePreview();
}

function togglemData() {
    document.getElementById('ndata').classList.toggle('mtoggle');
}

function showNote() {
    addLoader();
	let fname = this.dataset.na;
	let data = 'action=vNote&note='+fname+'&type='+this.children[0].title;
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			let response = xhr.responseText.split('---');
			removeLoader();
			var yobj = {};
			var nbody;
			if(response.length > 1) {
				let yaml = response[1].trim().split(/\r?\n/);
				yaml.forEach(function(element){
					let e = element.split(': ');
					yobj[e[0].trim()] = e[1].trim();
				});

				nbody = response[2].trim();
				document.getElementById('fname').value = fname;
				document.getElementById('ntitle').value = yobj['title'];
				let tstr = (yobj['tags']) ? yobj['tags']:'';
				document.getElementById('ntags').value = tstr;
				document.getElementById('author').value = (yobj['author']) ? yobj['author']:'';
				document.getElementById('date').value = (yobj['date']) ? yobj['date']:'';
				document.getElementById('updated').value = (yobj['updated']) ? yobj['updated']:'';
				document.getElementById('source').value = (yobj['source']) ? yobj['source']:'';
				tagify.removeAllTags();
				tagify.addTags(tstr.split(' '));
			} else {
				nbody = response[0].trim();
				document.getElementById('fname').value = fname;
				document.getElementById('ntitle').value = fname.substr(0,fname.lastIndexOf('.'));
				document.getElementById('ntags').value = '';
				document.getElementById('author').value = '';
				document.getElementById('date').value = '';
				document.getElementById('updated').value = '';
				document.getElementById('source').value = '';
				tagify.removeAllTags();
			}
			
			window.document.title = cval.title+' - '+document.getElementById('ntitle').value;
			
			if(yobj['source'])
				document.getElementById('source').classList.add('iurl');
			else
				document.getElementById('source').classList.remove('iurl');
				
			document.getElementById('ndata').classList.add('mtoggle');
			mde.value(nbody);
			
			if(!mde.isPreviewActive()) mde.togglePreview();
			document.getElementById('ntitle').disabled = true;
			document.getElementById('author').readOnly = true;
			document.getElementById('source').readOnly = true;
			disableButtons('view');
			tagify.setReadonly(true);
			document.querySelector('#noteheader .tagify').classList.remove('tedit');
			getTOC();
		}
	}
	xhr.open("POST", document.location.pathname, true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
}

function getTOC() {
    let headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if(headings.length > 0) {
		let tocButton = document.createElement('button');
		tocButton.id = 'tocButton';
		tocButton.innerText = 'ToC';
		if(document.getElementById('tocButton')) document.getElementById("tocButton").remove();
		document.getElementById('noteheader').appendChild(tocButton);

		let tocDIV = document.createElement('div');
		tocDIV.id = 'tocDIV';
		let o = 0;
		let a = 0;
		let list = 'c%';
		headings.forEach(function(element){
			a = element.tagName.substr(1,1);
			if(o < a) {
				list = list.replace('c%','<li><ul><li><a title="'+element.innerText+'" href="#' + element.id + '">' + element.innerText + '</a></li>c%</ul></li>');
			} else if(o > a) {
				list = list.replace('c%','</ul><li><a title="'+element.innerText+'" href="#' + element.id + '">' + element.innerText + '</a></li>c%');
			} else {
				list = list.replace('c%','<li><a title="'+element.innerText+'" href="#' + element.id + '">' + element.innerText + '</a></li>c%');
			}
			o = a;
		});
		list = list.replace('c%</ul>','');
		tocDIV.innerHTML = list;
        
		tocButton.addEventListener('click', function(e) {
			e.preventDefault();
			tocDIV.classList.toggle('tdhidden');
		});
        
        if(document.getElementById('tocDIV')) document.getElementById("tocDIV").remove();
		document.querySelector('.EasyMDEContainer').appendChild(tocDIV);

		document.querySelectorAll('#tocDIV a').forEach(function(elem) {
			elem.addEventListener('click', function(){
				tocDIV.classList.toggle('tdhidden');
			});
		});
	}
}

function searchList() {
	var input, filter, ul, li, a, i;
	input = document.getElementById('nsearch');
	filter = input.value.toUpperCase();
	ul = document.getElementById("nlist");
	li = ul.getElementsByTagName('li');

	for (i = 0; i < li.length; i++) {
		liTags = li[i].dataset.tags;
		if(liTags.toUpperCase().indexOf(filter) > -1 ) {
			li[i].style.display = "";
		} else {
			li[i].style.display = "none";
		}
	}
}

function uplLocalImage() {
	document.getElementById('localFile').click();
}

function uplInsertImage() {
    addLoader();

	let imageURL = prompt('URL of the image', '');
	if(imageURL) {
		let data = 'action=uplImage&imageURL='+imageURL;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if(this.readyState == 4 && this.status == 200) {
				removeLoader();
				mde.codemirror.replaceSelection('![](' + xhr.responseText + ')');
			}
		}
		xhr.open("POST", document.location.pathname, true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send(data);
	} else
		return false;
}

function disableButtons(mode) {
	var abuttons = [];
	switch (mode) {
		case 'view':
			abuttons = [16,19,20,21,22];
			break;
		case 'edit':
			abuttons = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
			break;
		default:
			abuttons = [];
			break;
	}
	
	let toolbarButtons = document.querySelectorAll('#notebody .editor-toolbar button');
	toolbarButtons.forEach(function(button, key){
		button.disabled = (abuttons.includes(key)) ? false:true;
	});
}

function saveNote() {
    addLoader();

	let oname = document.getElementById('fname').value;
	oname = oname.split('.');
	
	let tObj = tagify.value;
	let tags = [];
	for (let tag in tObj) {
		tags.push(tObj[tag].value);
	}

	var note = {
		nname: 		document.getElementById('ntitle').value,
		oname: 		oname[0],
		type: 		(oname[1]) ? oname[1]:'md',
		tags: 		tags,
		content:	mde.value(),
		author:		(document.getElementById('author').value) ? document.getElementById('author').value:null,
		date:		(document.getElementById('date').value) ? document.getElementById('date').value:null,
		source:		(document.getElementById('source').value) ? document.getElementById('source').value:null,
	};

	let data = 'action=sNote&note='+encodeURIComponent(JSON.stringify(note));
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			let response = xhr.responseText;
			removeLoader();
			document.getElementById('ntitle').disabled = true;
			document.getElementById('author').readOnly = true;
			document.getElementById('source').readOnly = true;
			disableButtons('view');
			tagify.setReadonly(true);
			document.querySelector('#noteheader .tagify').classList.remove('tedit');
			getTOC();
			mde.togglePreview();
			loadList();
		}
	}
	xhr.open("POST", document.location.pathname, true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
}

function loadList() {
	let data = 'action=gNlist';
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			let response = JSON.parse(xhr.responseText);
			let liste = document.querySelectorAll('#nlist li');
			liste.forEach(function(element){
				element.remove();
			});
			document.getElementById('nlist').innerHTML = response;
			document.querySelectorAll('#nlist li').forEach(element => element.addEventListener('click', showNote));
			document.querySelectorAll('#nlist li').forEach(element => element.addEventListener('contextmenu', onContextMenu));
			document.getElementById('nlist').addEventListener("dragover", function (e) {
				e.preventDefault();
				e.stopPropagation();
			});
			document.getElementById('nlist').addEventListener("drop", function (e) {
				e.preventDefault();
				e.stopPropagation();
				document.getElementById('nlist').classList.remove('highlight');
				manageDropUpload(e.dataTransfer.files);
			});
		}
	}
	xhr.open("POST", document.location.pathname, true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
}

function uploadFile(file, alt='', title='') {
    addLoader();

	if('srcElement' in file) 
		var cfile = file.srcElement.files[0];
	else
		var cfile = file;

	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if (xhr.status == 200) {
			if(title) title = ' "'+title+'"';
			mde.codemirror.replaceSelection('!['+alt+']('+xhr.responseText+title+')');
			removeLoader();
		} else {
			alert("Error! Upload failed");
			console.error("Error! Upload failed");
		}
	};

	xhr.onerror = function() {
		alert("Error! Upload failed");
		console.error("Error! Upload failed. Can not connect to server.");
	};

	var formData = new FormData();
	formData.append("localFile", cfile);
	xhr.open('POST', document.location.pathname, true);
	xhr.send(formData);
}

function pasteParse(event) {
	event.preventDefault();
	event.stopPropagation();

    addLoader();
	
	const pastedString = event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain');

	for (var i = 0; i < event.clipboardData.items.length ; i++) {
		let item = event.clipboardData.items[i];
		if(item.type.indexOf("image") != -1) {
			let imageT = event.clipboardData.getData('text/html');
			if(imageT.indexOf('alt="') >= 0) {
				let altS = imageT.indexOf('alt="') + 5;
				let altE = imageT.indexOf('"',altS);
				var alt = imageT.substr(altS, altE - altS);
			} else var alt = '';

			if(imageT.indexOf('title="') >= 0) {
				let titleS = imageT.indexOf('title="') + 7;
				let titleE = imageT.indexOf('"',titleS);
				var title = imageT.substr(titleS, titleE - titleS);
			} else var title = '';

			removeLoader();
			uploadFile(item.getAsFile(), alt, title);
			return false;
		}
	}
	
	function uploadFile(file, alt, title) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (xhr.status == 200) {
				if(title) title = ' "'+title+'"';
				mde.codemirror.replaceSelection('!['+alt+']('+xhr.responseText+title+')');
			} else {
				console.error("Error! Upload failed");
			}
		};
	
		xhr.onerror = function() {
			console.error("Error! Upload failed. Can not connect to server.");
		};
	
		var formData = new FormData();
		formData.append("localFile", file);
		xhr.open('POST', document.location.href, true);
		xhr.send(formData);
	}
	
	let turndownOptions = {
		headingStyle: 'atx',
		hr: '-',
		bulletListMarker: '-',
		codeBlockStyle: 'fenced',
		fence: '```',
		emDelimiter: '*',
		strongDelimiter: '**',
		linkStyle: 'inlined',
		linkReferenceStyle: 'full',
		collapseMultipleWhitespaces: true,
		preformattedCode: true,
	};

	let turndownService = new window.TurndownService(turndownOptions);

	turndownService.addRule('kbd',{
		filter:['kbd'],
		replacement: function(content) {
			return '<kbd>' + content + '</kbd>';
		}
	});

	let markdownString = pastedString.startsWith('<html>') ? turndownService.turndown(pastedString):pastedString;

	if(markdownString.startsWith('---')) {
		let mdArr = markdownString.split('\n');
		let cstart = markdownString.indexOf('---',4) + 3;
		for(let i = 1; i < 10; i++) {
			if(mdArr[i] == '---') break;
			let yentry = mdArr[i].split(':');
			if(yentry[0] == 'title') document.getElementById('ntitle').value = yentry[1].trim();
			if(yentry[0] == 'tags') tagify.addTags(yentry[1]);
			if(yentry[0] == 'author') document.getElementById('author').value = yentry[1].trim();
			if(yentry[0] == 'date') document.getElementById('date').value = yentry.slice(1).join(':').trim();
			if(yentry[0] == 'updated') document.getElementById('updated').value = yentry.slice(1).join(':').trim();
			if(yentry[0] == 'source') document.getElementById('source').value = yentry.slice(1).join(':').trim();
		}
		markdownString = markdownString.substr(cstart).trim();
	}
	
	mde.codemirror.replaceSelection(markdownString);
}

function onContextMenu(e){
	e.preventDefault();
	if(confirm("Do you want to delete '"+this.title+"'?")) deleteNote(this.dataset.na);
}

function logOut() {
	console.info('Try to Logout...');
	let data = 'action=logout';
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if(this.readyState == 4 && this.status == 200) {
			window.location.href = window.location.pathname;
		}
	}
	xhr.open("POST", document.location.pathname, true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
}