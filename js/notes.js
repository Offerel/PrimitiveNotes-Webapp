/**
 * Notes
 *
 * @version 1.0.3
 * @author Offerel
 * @copyright Copyright (c) 2021, Offerel
 * @license GNU General Public License, version 3
 */
 var mde;
 var tagify;
 var cval;
 var filelist = [];
 
document.addEventListener("DOMContentLoaded", function () {
	if (document.getElementById('lform')) {
		document.getElementById("user").focus();
		document.querySelector('html').classList.add('login');
	}

	let cookie = decodeURIComponent(document.cookie).split('; ');
	cookie.forEach(function (element) {
		if (element.indexOf('primitivenotes=') == 0) {
			cval = JSON.parse(element.substring(15));
		}
	});

	document.querySelectorAll('#nlist li').forEach(element => element.addEventListener('click', showNOTE));
	document.querySelectorAll('#nlist li').forEach(element => element.addEventListener('contextmenu', onContextMenu));

	if (document.getElementById('left')) {
		document.getElementById('left').style.width = (cval.barw) ? cval.barw + 'px' : '';
		new ResizeObserver(barwidth).observe(document.getElementById('left'));
	}

	if (document.getElementById('nlist')) {
		var transitioning = false;
		document.getElementById('nlist').addEventListener("dragenter", function (e) {
			e.preventDefault();
			e.stopPropagation();
			transitioning = true;
			setTimeout(function () {
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
		whitelist: [],
		dropdown: {
			classname: "color-blue",
			enabled: 0,
			maxItems: 0,
			position: "text",
			closeOnSelect: false,
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
		placeholder: "Add your note here...",
		renderingConfig: {
			markedOptions: {
				sanitize: false,
			},
			codeSyntaxHighlighting: true,
			sanitizerFunction: function (renderedHTML) {
				return renderedHTML.replaceAll(cval.mf, document.location.pathname + '?nimg=');
			}
		},
		shortcuts: {
			Preview: "Cmd-P",
		},
		toolbar: [
			{
				name: 'Save',
				className: 'ma ma-save',
				action: saveNote,
				title: 'Save',
				noDisable: true,
			},
			{
				name: 'New',
				className: 'ma ma-new',
				action: newNote,
				title: 'New',
				noDisable: true
			}, 
			{
				name: 'File',
				className: 'ma ma-file',
				title: 'File',
				children: [
					{
						name: 'Save',
						className: 'ma ma-save',
						action: saveNote,
						title: 'Save',
					},
					{
						name: 'New',
						className: 'ma ma-new',
						action: newNote,
						title: 'New'
					}
				]
			},
			'|',
			{
				name: 'Bold',
				className: 'ma ma-bold',
				action: EasyMDE.toggleBold,
				title: 'Bold',
			}, {
				name: 'Italic',
				className: 'ma ma-italic',
				action: EasyMDE.toggleItalic,
				title: 'Italic',
			},
			{
				name: 'Striketrough',
				className: 'ma ma-strikethrough',
				title: 'Striketrough',
				action: EasyMDE.toggleStrikethrough,
			},
			{
				name: 'Clean block',
				className: 'ma ma-clean',
				title: 'Clean block',
				action: EasyMDE.cleanBlock,
			}, '|',
			{
				name: 'Heading',
				className: 'ma ma-heading',
				title: 'Heading',
				action: EasyMDE.toggleHeading1,
			}, '|',
			{
				name: 'Code',
				className: 'ma ma-code',
				title: 'Code',
				action: EasyMDE.toggleCodeBlock,
			},
			{
				name: 'Quote',
				className: 'ma ma-quote',
				title: 'Quote',
				action: EasyMDE.toggleBlockquote,
			},
			{
				name: 'List',
				className: 'ma ma-glist',
				title: 'List',
				children: [
					{
						name: "Generic List",
						action: EasyMDE.toggleUnorderedList,
						className: "ma ma-glist",
						title: "Generic List",
					},
					{
						name: "Numbered List",
						action: EasyMDE.toggleOrderedList,
						className: "ma ma-olist",
						title: "Numbered List",
					}
				]
			}, '|',
			{
				name: 'Link',
				className: "ma ma-link",
				title: 'Create Link',
				action: EasyMDE.drawLink,
			},
			{
				name: 'Image',
				className: 'ma ma-image',
				title: 'Image',
				children: [
					{
						name: "RImage",
						action: uplInsertImage,
						className: "ma ma-image",
						title: "Insert Image URL",
					},
					{
						name: "LImage",
						action: uplLocalImage,
						className: "ma ma-limage",
						title: "Upload Image",
					}
				]
			},
			{
				name: 'Table',
				className: 'ma ma-table',
				title: 'Insert table',
				action: EasyMDE.drawTable,
			}, '|',
			{
				name: 'Preview',
				className: 'ma ma-preview pview',
				title: 'Toggle Preview',
				action: tpreview,
				noDisable: true,
			},
			{
				name: 'SideBySide',
				className: 'ma ma-sidebyside',
				title: 'Toggle Side by Side',
				action: EasyMDE.toggleSideBySide,
			}, '|',
			{
				name: 'Guide',
				className: 'ma ma-guide',
				title: 'Markdown Guide',
				action: 'https://www.markdownguide.org/basic-syntax/',
				noDisable: true
			},
			{
				name: 'Meta',
				className: 'ma ma-meta',
				action: togglemData,
				title: 'Display Metadata',
				noDisable: true
			}, '|',
			{
				name: 'LogoutB',
				className: 'ma ma-logout',
				action: logOut,
				title: 'Logout',
				noDisable: true,
			}
		],
	});

	if (document.querySelector('.EasyMDEContainer')) {
		document.querySelector('.EasyMDEContainer').addEventListener('paste', pasteParse, true);
		document.getElementById('source').addEventListener('click', oSource);
		document.getElementById('nsearch').addEventListener('keyup', searchList, false);
		document.getElementById('localFile').addEventListener('change', uploadFile, false);
		switchButtons('new');
		document.getElementById('ntitle').value = '';
		document.getElementById('ntitle').placeholder = 'Enter title';
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
 
function downloadNOTE() {
	let notename = String(this);
	let data = 'action=dlNote&note=' + notename;
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let blob = new Blob([xhr.response], { type: xhr.getResponseHeader("content-type") });
			let a = document.createElement("a");
			a.style = "display: none";
			document.body.appendChild(a);
			let url = window.URL.createObjectURL(blob);
			a.href = url;
			a.download = notename;
			a.click();
			window.URL.revokeObjectURL(url);
		}
	}
	xhr.open("POST", document.location.pathname, true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
	document.getElementById('dcMenu').style.display = 'none';
}

function downloadIMG() {
	let medianame = String(this);
	let data = 'action=dlMedia&media=' + medianame;
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let blob = new Blob([this.response], { type: xhr.getResponseHeader("content-type") });
			let amedia = document.createElement("a");
			amedia.style = "display: none";
			document.body.appendChild(amedia);
			let url = window.URL.createObjectURL(blob);
			amedia.href = url;
			amedia.download = medianame;
			amedia.click();
			setTimeout(function () { window.URL.revokeObjectURL(url); }, 100);
		}
	}
	xhr.open("POST", document.location.pathname, true);
	xhr.responseType = 'arraybuffer';
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
	document.getElementById('dcMenu').style.display = 'none';
};
 
function barwidth() {
	let dWidth = document.getElementById('left').offsetWidth - 1;
	var cookies = decodeURIComponent(document.cookie).split('; ');
	cookies.forEach(function (cookie) {
		if (cookie.indexOf('primitivenotes') === 0) {
			let acookie = JSON.parse(cookie.substr(15));
			let date = new Date();
			date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
			let expires = "expires=" + date.toUTCString();
			acookie.barw = dWidth;
			let cValue = encodeURIComponent(JSON.stringify(acookie));
			document.cookie = 'primitivenotes' + "=" + cValue + "; SameSite=Strict; Secure; " + expires + '; path=' + location.href.substring(0, location.href.lastIndexOf("/") + 1);
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
	if (filelist.length > 0) {
		let data = new FormData();
		let thisfile = filelist[0];
		filelist.shift();
		data.append('dropFile', thisfile);
		let xhr = new XMLHttpRequest();
		xhr.open("POST", document.location.pathname);
		xhr.onload = function () {
			let response = JSON.parse(xhr.response);
			console.info(thisfile.name + ' uploaded');
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

		xhr.onerror = function (evt) {
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
	if (this.value.length > 0) {
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

function deleteIMG() {
	let mname = String(this);
	if(confirm("Do you want to delete '" + mname + "'?")) {
		addLoader();
		removeLoader();
		let marr = [mname];
		let data = 'action=dMedia&media=' + encodeURIComponent(JSON.stringify(marr));
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				removeLoader();
				document.getElementById('dcMenu').style.display = 'none';
				showNOTE(document.getElementById('fname').value);
			}
		}
		xhr.open("POST", document.location.pathname, true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send(data)
	}
};
 
function deleteNOTE() {
	let notename = String(this);
	let rload = true;

	if (confirm("Do you want to delete '" + notename + "'?")) {
		if (notename.length < 1) {
			console.warn('No note to delete...');
			return;
		}
		addLoader();
		let data = 'action=dNote&note=' + notename;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let response = JSON.parse(xhr.responseText);
				if (response.erg == 1) {
					removeLoader();
					console.info(response.message);
					if (response.data.length > 0) {
						if (confirm(response.message)) {
							let datad = 'action=dMedia&media=' + encodeURIComponent(JSON.stringify(response.data));
							let xhrd = new XMLHttpRequest();
							xhrd.onreadystatechange = function () {
								if (this.readyState == 4 && this.status == 200) {
									let response = JSON.parse(xhr.responseText);
									alert(response);
								}
							}
							xhrd.open("POST", document.location.pathname, true);
							xhrd.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
							xhrd.send(datad);
						}
						(rload) ? window.location.href = document.location.pathname : loadList();
					}
				} else {
					console.warn(response.message);
					removeLoader();
				}

				(rload) ? window.location.href = document.location.pathname : loadList();
			}
		}
		xhr.open("POST", document.location.pathname, true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send(data);
	}

	document.getElementById('dcMenu').style.display = 'none';
}

function editNOTE(nname) {
	addLoader();
	document.querySelectorAll('#nlist li').forEach(function (e) {
		e.classList.remove('nloaded');
	});

	let fname = (typeof this.dataset === 'undefined') ? this:this.dataset.na;
	fname = (fname.length == 0) ? nname:fname;	
	let data = 'action=vNote&note=' + fname;
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let response = xhr.responseText.split('---');
			removeLoader();
			var yobj = {};
			var nbody;
			if (response.length > 1) {
				let yaml = response[1].trim().split(/\r?\n/);
				yaml.forEach(function (element) {
					let e = element.split(': ');
					yobj[e[0].trim()] = e[1].trim();
				});

				nbody = response[2].trim();
				document.getElementById('fname').value = fname;
				document.getElementById('ntitle').value = (yobj['title']) ? yobj['title'] : fname.split('.')[0];
				let tstr = (yobj['tags']) ? yobj['tags'] : '';
				document.getElementById('ntags').value = tstr;
				document.getElementById('author').value = (yobj['author']) ? yobj['author'] : '';
				document.getElementById('date').value = (yobj['date']) ? yobj['date'] : '';
				document.getElementById('updated').value = (yobj['updated']) ? yobj['updated'] : '';
				document.getElementById('source').value = (yobj['source']) ? yobj['source'] : '';
				tagify.removeAllTags();
				tagify.addTags(tstr.split(' '));
				document.querySelector("[data-na='" + fname + "']").classList.toggle('nloaded');
			} else {
				nbody = response[0].trim();
				document.getElementById('fname').value = fname;
				document.getElementById('ntitle').value = fname.substr(0, fname.lastIndexOf('.'));
				document.getElementById('ntags').value = '';
				document.getElementById('author').value = '';
				document.getElementById('date').value = '';
				document.getElementById('updated').value = '';
				document.getElementById('source').value = '';
				tagify.removeAllTags();
			}

			window.document.title = cval.title + ' - ' + document.getElementById('ntitle').value;

			if (yobj['source'])
				document.getElementById('source').classList.add('iurl');
			else
				document.getElementById('source').classList.remove('iurl');

			document.getElementById('ndata').classList.add('mtoggle');
			mde.value(nbody);

			if (mde.isPreviewActive()) mde.togglePreview();
			document.getElementById('ntitle').disabled = false;
			document.getElementById('author').readOnly = false;
			document.getElementById('source').readOnly = false;
			switchButtons('edit');
			tagify.setReadonly(false);
		}
	}
	xhr.open("POST", document.location.pathname, true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
	document.getElementById('dcMenu').style.display = 'none';
}
 
function tpreview() {
	if (document.getElementById('tocButton')) document.getElementById("tocButton").remove();
	if (document.getElementById('tocDIV')) document.getElementById("tocDIV").remove();

	if (mde.isPreviewActive()) {
		document.getElementById('ntitle').disabled = false;
		document.getElementById('author').readOnly = false;
		document.getElementById('source').readOnly = false;
		switchButtons('edit');
		tagify.setReadonly(false);
	} else {
		document.getElementById('ntitle').disabled = true;
		document.getElementById('author').readOnly = true;
		document.getElementById('source').readOnly = true;
		switchButtons('view');
		tagify.setReadonly(true);
		document.querySelector('#noteheader .tagify').classList.remove('tedit');
		getTOC();
	}

	mde.togglePreview();
}
 
function togglemData() {
	document.getElementById('ndata').classList.toggle('mtoggle');
}
 
function showNOTE(nname) {
	addLoader();
	document.querySelectorAll('#nlist li').forEach(function (e) {
		e.classList.remove('nloaded');
	});

	let fname = (typeof this.dataset === 'undefined') ? this:this.dataset.na;
	fname = (fname.length == 0) ? nname:fname;	
	let data = 'action=vNote&note=' + fname;
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let response = xhr.responseText.split(/---[\r?\n]/g);
			removeLoader();
			var yobj = {};
			var nbody;
			if (response.length > 1) {
				let yaml = response[1].trim().split(/\r?\n/);
				yaml.forEach(function (element) {
					let e = element.split(': ');
					yobj[e[0].trim()] = e[1].trim();
				});

				nbody = response[2].trim();
				document.getElementById('fname').value = fname;
				document.getElementById('ntitle').value = (yobj['title']) ? yobj['title'] : fname.split('.')[0];
				let tstr = (yobj['tags']) ? yobj['tags'] : '';
				document.getElementById('ntags').value = tstr;
				document.getElementById('author').value = (yobj['author']) ? yobj['author'] : '';
				document.getElementById('date').value = (yobj['date']) ? yobj['date'] : '';
				document.getElementById('updated').value = (yobj['updated']) ? yobj['updated'] : '';
				document.getElementById('source').value = (yobj['source']) ? yobj['source'] : '';
				tagify.removeAllTags();
				tagify.addTags(tstr.split(' '));
				document.querySelector("[data-na='" + fname + "']").classList.toggle('nloaded');
			} else {
				nbody = response[0].trim();
				document.getElementById('fname').value = fname;
				document.getElementById('ntitle').value = fname.substr(0, fname.lastIndexOf('.'));
				document.getElementById('ntags').value = '';
				document.getElementById('author').value = '';
				document.getElementById('date').value = '';
				document.getElementById('updated').value = '';
				document.getElementById('source').value = '';
				tagify.removeAllTags();
			}

			mde.value(nbody);

			window.document.title = cval.title + ' - ' + document.getElementById('ntitle').value;

			if (yobj['source'])
				document.getElementById('source').classList.add('iurl');
			else
				document.getElementById('source').classList.remove('iurl');

			document.getElementById('ndata').classList.add('mtoggle');

			if(!mde.isPreviewActive()) mde.togglePreview();

			let images = document.querySelectorAll('.editor-preview img');
			images.forEach(function (element) {
				element.addEventListener('contextmenu', onContextMenu);
			});

			
			document.getElementById('ntitle').disabled = true;
			document.getElementById('author').readOnly = true;
			document.getElementById('source').readOnly = true;
			switchButtons('view');
			tagify.setReadonly(true);
			document.querySelector('#noteheader .tagify').classList.remove('tedit');
			getTOC();
		}
	}
	xhr.open("POST", document.location.pathname, true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
	document.getElementById('dcMenu').style.display = 'none';
}
 
function getTOC() {
	if (document.getElementById('tocButton')) document.getElementById("tocButton").remove();
	if (document.getElementById('tocDIV')) document.getElementById("tocDIV").remove();

	let headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
	if (headings.length > 0) {
		let tocButton = document.createElement('button');
		tocButton.id = 'tocButton';
		tocButton.innerText = 'ToC';
		document.getElementById('noteheader').appendChild(tocButton);

		let tocDIV = document.createElement('div');
		tocDIV.id = 'tocDIV';
		let o = 0;
		let a = 0;
		let list = 'c%';
		headings.forEach(function (element) {
			a = element.tagName.substr(1, 1);
			if (o < a) {
				list = list.replace('c%', '<li><ul><li><a title="' + element.innerText + '" href="#' + element.id + '">' + element.innerText + '</a></li>c%</ul></li>');
			} else if (o > a) {
				list = list.replace('c%', '</ul><li><a title="' + element.innerText + '" href="#' + element.id + '">' + element.innerText + '</a></li>c%');
			} else {
				list = list.replace('c%', '<li><a title="' + element.innerText + '" href="#' + element.id + '">' + element.innerText + '</a></li>c%');
			}
			o = a;
		});
		list = list.replace('c%</ul>', '');
		tocDIV.innerHTML = list;

		tocButton.addEventListener('click', function (e) {
			e.preventDefault();
			tocDIV.classList.toggle('tdhidden');
		});

		if (document.getElementById('tocDIV')) document.getElementById("tocDIV").remove();
		document.querySelector('.EasyMDEContainer').appendChild(tocDIV);

		document.querySelectorAll('#tocDIV a').forEach(function (elem) {
			elem.addEventListener('click', function () {
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
		if (liTags.toUpperCase().indexOf(filter) > -1) {
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
	if (imageURL) {
		let data = 'action=uplImage&imageURL=' + imageURL;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
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
 
function switchButtons(mode) {
	let toolbarButtons = document.querySelectorAll('#notebody .editor-toolbar button');
	toolbarButtons.forEach(function (button, key) {
		if (mode == 'view') {
			document.querySelector('button.New.ma').style.display = 'inline-block';
			document.querySelector('button.Save.ma').style.display = 'none';
			document.querySelector('button.File.ma').style.display = 'none';
			document.querySelector('.ma-preview').classList.remove('pview');
			if (button.classList.contains('no-disable') == false) button.classList.add('ma-disabled');
		} else if (mode == 'new') {
			document.querySelector('button.New.ma').style.display = 'none';
			document.querySelector('button.Save.ma').style.display = 'inline-block';
			document.querySelector('button.File.ma').style.display = 'none';
			document.querySelector('.ma-preview').classList.add('pview');
			document.querySelector('#noteheader .tagify').classList.add('tedit');
			if (button.classList.contains('no-disable') == false) button.classList.remove('ma-disabled');
		} else if (mode == 'edit') {
			document.querySelector('button.New.ma').style.display = 'none';
			document.querySelector('button.Save.ma').style.display = 'none';
			document.querySelector('button.File.ma').style.display = 'inline-block';
			document.querySelector('.ma-preview').classList.add('pview');
			document.querySelector('#noteheader .tagify').classList.add('tedit');
			if (button.classList.contains('no-disable') == false) button.classList.remove('ma-disabled');
		}
	});
}
 
function newNote() {
	if (document.getElementById('tocButton')) document.getElementById("tocButton").remove();
	document.getElementById('fname').value = '';
	document.getElementById('ntitle').value = '';
	document.getElementById('ntitle').disabled = false;
	document.getElementById('ntags').value = '';
	document.getElementById('author').value = '';
	document.getElementById('author').readOnly = false;
	document.getElementById('date').value = '';
	document.getElementById('updated').value = '';
	document.getElementById('source').value = '';
	document.getElementById('source').readOnly = false;
	mde.value('');
	tagify.removeAllTags();
	tagify.setReadonly(false);
	document.querySelector('#noteheader .tagify').classList.add('tedit');
	switchButtons('new');
	window.document.title = cval.title + ' - New';
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
		nname: document.getElementById('ntitle').value,
		oname: oname[0],
		type: (oname[1]) ? oname[1] : 'md',
		tags: tags,
		content: mde.value(),
		author: (document.getElementById('author').value) ? document.getElementById('author').value : null,
		date: (document.getElementById('date').value) ? document.getElementById('date').value : null,
		source: (document.getElementById('source').value) ? document.getElementById('source').value : null,
	};

	let data = 'action=sNote&note=' + encodeURIComponent(JSON.stringify(note));
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let response = xhr.responseText;
			removeLoader();
			document.getElementById('ntitle').disabled = true;
			document.getElementById('author').readOnly = true;
			document.getElementById('source').readOnly = true;
			switchButtons('view');
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
		if (this.readyState == 4 && this.status == 200) {
			let response = JSON.parse(xhr.responseText);
			let liste = document.querySelectorAll('#nlist li');
			liste.forEach(function (element) {
				element.remove();
			});
			document.getElementById('nlist').innerHTML = response;
			document.querySelectorAll('#nlist li').forEach(element => element.addEventListener('click', showNOTE));
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

			addLoader();
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
			removeLoader();
		};

		xhr.onerror = function() {
			console.error("Error! Upload failed. Can not connect to server.");
			removeLoader();
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
	let type = (this.localName == 'img') ? this.localName:'Note';

	if(document.getElementById('cMenu')) document.getElementById('cMenu').remove();

	let mul = document.createElement('ul');
	mul.id = 'cMenu';

	let cMenu = ['Show', 'Edit', 'Download', 'Delete'];

	cMenu.forEach(function(element){
		let mli = document.createElement('li');
		mli.innerText = element;
		let fname = element.toLowerCase()+type.toUpperCase();
		let parm = String(e.target.parentElement.parentElement.dataset.na);
		parm = (parm !== 'undefined') ? parm:e.target.currentSrc.split('=').pop();
		mli.classList.add('ma-'+element.toLowerCase());
		if(type === 'img' && element === 'Edit') mli.classList.add('ma-disabled');

		mli.addEventListener('click', window[fname].bind(parm));
		mul.appendChild(mli);
	});

	let dcMenu = document.getElementById('dcMenu');
	let mTop = (window.innerHeight - 100 > e.clientY) ? e.clientY:e.clientY-100;
	dcMenu.appendChild(mul);
	dcMenu.style.left = e.clientX+'px';
	dcMenu.style.top = mTop+'px';
	dcMenu.style.display = 'block';
}

function showIMG() {
	let media = String(this);
	window.open(document.location.pathname + '?nimg='+media, '_blank');
};

function editIMG() {
	console.warn('Function currently not implemented');
};

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