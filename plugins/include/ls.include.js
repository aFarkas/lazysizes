/*
 This plugin extends lazySizes to lazyLoad and/or conditionally load content
 */

(function(window, document){
	/*jshint eqnull:true */
	'use strict';

	if(!document.getElementsByClassName) {
		return;
	}
	var config, includeConfig, baseContentElement, basePseudos;
	var regSplitCan = /\s*,+\s+/;
	var uniqueUrls = {};
	var regWhite = /\s+/;
	var regTypes = /^(amd|css|module)\:(.+)/i;
	var regUrlCan = /(.+)\s+(\(\s*(.+)\s*\))/;
	var regCleanPseudos = /['"]/g;
	var docElem = document.documentElement;
	var conditionalIncludes = document.getElementsByClassName('lazyconditionalinclude');

	var getStyles = function (element, pseudo) {
		var view = element.ownerDocument.defaultView;

		if (!view.opener) {
			view = window;
		}

		return view.getComputedStyle(element, pseudo || null) || {getPropertyValue: function(){}, isNull: true};
	};

	var queue = (function(){
		var lowTreshold = 2;
		var highTreshold = 3;
		var queueThreshold = lowTreshold;
		var inProgress = 0;
		var priosInProgress = 0;
		var queue = [];
		var resetQueue = (function(){
			var timer;
			var reset = function(){
				if(queue.length){
					inProgress = 0;
					queue.d();
				}
			};

			return function(){
				clearTimeout(timer);
				timer = setTimeout(reset, 999);
			};
		})();

		return {
			q: function(element){
				var isPrio = element.getAttribute('data-lazyqueue') == null;
				if(isPrio){
					priosInProgress++;
					queueThreshold = highTreshold;
				}

				if(inProgress > queueThreshold){
					queue[isPrio ? 'unshift' : 'push'](element);
				} else if(findLoadCandidate(element)) {
					inProgress++;
					resetQueue();
				}
			},
			d: function(){
				if(inProgress){
					inProgress--;
				}
				if(priosInProgress > 0){
					priosInProgress--;

					if(!priosInProgress){
						queueThreshold = lowTreshold;
					}
				}

				if(inProgress > queueThreshold){
					return;
				}

				while(queue.length){
					if(findLoadCandidate(queue.shift())){
						inProgress++;
						break;
					}
				}
				resetQueue();
			}
		};
	})();
	var refreshIncludes = (function(){
		var timer;
		var run = function(){
			var i = 0;
			var len = conditionalIncludes.length;
			for(; i < len; i++){
				if(!lazySizes.hC(conditionalIncludes[i], config.lazyClass) && findCandidate(conditionalIncludes[i])){
					lazySizes.aC(conditionalIncludes[i], config.lazyClass);
				}
			}
		};
		return function(e){
			clearTimeout(timer);
			basePseudos = null;
			timer = setTimeout(run, e.type == 'resize' ? 31 : 0);
		};
	})();

	config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

	if(!config){
		config = {};
		window.lazySizesConfig = config;
	}

	if(!config.include){
		config.include = {};
	}

	includeConfig = config.include;

	if(!includeConfig.contentElement){
		includeConfig.contentElement = 'html';
	}

	if(!includeConfig.conditions){
		includeConfig.conditions = {};
	}

	if(!includeConfig.map){
		includeConfig.map = {};
	}

	function addUrl(url){
		/*jshint validthis:true */
		if(url.match(regTypes)){
			this.urls[RegExp.$1] = includeConfig.map[RegExp.$2] || RegExp.$2;
		} else {
			this.urls.include = includeConfig.map[url] || url;
		}
	}

	function parseCandidate(input){
		var output, map, url;
		input = input.trim();

		input = includeConfig.map[input] || input;

		map = input.match(regUrlCan);

		if(map){
			url = RegExp.$1;
			output = {
				condition: config.include.conditions[RegExp.$3] || config.customMedia[RegExp.$3] || RegExp.$2 || null,
				name: RegExp.$3
			};
		} else {
			url = input;
			output = {
				condition: null,
				name: ''
			};
		}

		output.urls = {};

		(includeConfig.map[url] || url).split(regWhite).forEach(addUrl, output);

		if(!output.urls.include && output.urls.amd){
			/*jshint validthis:true */
			this.saved = true;
			output.initial = this;
		}

		return output;
	}

	function getIncludeData(elem){
		var len;
		var includeStr = (elem.getAttribute('data-include') || '');
		var includeData = elem.lazyInclude;
		var initialContent;
		if(!includeData || includeData.str != includeStr || includeConfig.allowReload){
			initialContent = {saved: false, content: null};
			includeData = {
				str: includeStr,
				candidates: (includeConfig.map[includeStr] || includeStr).split(regSplitCan).map(parseCandidate, initialContent)
			};

			if(!(len = includeData.candidates.length) || includeData.candidates[len - 1].condition){
				initialContent.saved = true;

				includeData.candidates.push({
					urls: {},
					condition: null,
					name: 'initial',
					content: initialContent
				});
			} else if(initialContent.saved && includeData.candidates.length == 1){
				initialContent.saved = false;
			}

			includeData.initialContent = initialContent;
			if(initialContent.saved){
				initialContent.content = elem.innerHTML;
			}

			elem.lazyInclude = includeData;
			if(includeData.candidates.length > 1){
				lazySizes.aC(elem, 'lazyconditionalinclude');
			} else {
				lazySizes.rC(elem, 'lazyconditionalinclude');
			}
		}
		return includeData;
	}

	function matchesCondition(elem, candidate){
		var matches = !candidate.condition;

		if(candidate.condition){
			createPseudoCondition();
			if(basePseudos[candidate.name]){
				matches = true;
			} else if(window.matchMedia && typeof candidate.condition == 'string'){
				matches = (matchMedia(candidate.condition) || {}).matches;
			} else if(typeof candidate.condition == 'function'){
				matches = candidate.condition(elem, candidate);
			}
		}
		return matches;
	}


	function createPseudoCondition(){
		var cStyle;

		if(!basePseudos){

			if(!baseContentElement){
				baseContentElement = document.querySelector(includeConfig.contentElement);
			}

			if(baseContentElement){
				cStyle = (getStyles(baseContentElement, ':after').getPropertyValue('content') || 'none').replace(regCleanPseudos, '');

				basePseudos = {};

				if(cStyle){
					basePseudos[cStyle] = 1;
				}
				cStyle = (getStyles(baseContentElement, ':before').getPropertyValue('content') || 'none').replace(regCleanPseudos, '');
				if(cStyle){
					basePseudos[cStyle] = 1;
				}
			} else {
				basePseudos = {};
			}
		}

	}

	function findCandidate(elem){
		var i, candidate;
		var includeData = elem.lazyInclude;
		if(includeData && includeData.candidates){
			for(i = 0; i < includeData.candidates.length; i++){
				candidate = includeData.candidates[i];
				if(matchesCondition(elem, candidate)){
					break;
				}
			}
		}
		if(!candidate || candidate == includeData.current){
			candidate = null;
		}
		return candidate;
	}

	function loadInclude(detail, includeCallback){
		var request = new XMLHttpRequest();

		request.addEventListener('readystatechange', function () {
			var DONE = this.DONE || 4;
			if (this.readyState === DONE){

				includeCallback(request);
				request = null;
			}
		}, false);

		request.open.apply(request, detail.openArgs);
		request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		if(detail.xhrModifier){
			detail.xhrModifier(request, elem, candidate);
		}
		request.send(detail.sendData);
	}

	function loadRequire(urls, callback){
		urls = urls.split('|,|');
		require(urls, callback);
	}

	function loadStyle(url){
		if(!uniqueUrls[url]){
			var elem = document.createElement('link');
			var insertElem = document.getElementsByTagName('script')[0];

			elem.rel = 'stylesheet';
			elem.href = url;
			insertElem.parentNode.insertBefore(elem, insertElem);
			uniqueUrls[url] = true;
			uniqueUrls[elem.href] = true;
		}
	}

	function loadStyles(urls){
		urls = urls.split('|,|');
		urls.forEach(loadStyle);
	}

	function transformInclude(module){
		if(module && typeof module.lazytransform == 'function'){
			/*jshint validthis:true */
			module.lazytransform(this);
		}
	}

	function unloadModule(module){
		if(module && typeof module.lazyunload == 'function'){
			/*jshint validthis:true */
			module.lazyunload(this);
		}
	}

	function loadModule(module){
		if(module && typeof module.lazyload == 'function'){
			/*jshint validthis:true */
			module.lazyload(this);
		}
	}

	function loadCandidate(elem, candidate){
		var include, xhrObj, modules;
		var old = elem.lazyInclude.current || null;
		var detail = {
			candidate: candidate,
			openArgs: ['GET', candidate.urls.include, true],
			sendData: null,
			xhrModifier: null,
			content: candidate.content && candidate.content.content || candidate.content,
			oldCandidate: old
		};
		var event = lazySizes.fire(elem, 'lazyincludeload', detail);

		if(event.defaultPrevented){
			queue.d();
			return;
		}

		include = function(){
			var event, loadRequireImportCB;
			var status = xhrObj.status;
			var content = xhrObj.content || xhrObj.responseText;
			var reset = !!(content == null && old && old.urls.include);
			var detail = {
				candidate: candidate,
				content: content,
				text: xhrObj.responseText || xhrObj.content,
				response: xhrObj.response,
				xml: xhrObj.responseXML,
				isSuccess: ('status' in xhrObj) ? status >= 200 && status < 300 || status === 304 : true,
				oldCandidate: old,
				insert: true,
				resetHTML: reset
			};
			var moduleObj = {target: elem, details: detail, detail: detail};

			candidate.modules = modules;

			if(old && old.modules){
				old.modules.forEach(unloadModule, moduleObj);
				old.modules = null;

				if(detail.resetHTML && detail.content == null && candidate.initial && candidate.initial.saved){
					detail.content = candidate.initial.content;
				}
			}


			modules.forEach(transformInclude, moduleObj);

			event = lazySizes.fire(elem, 'lazyincludeloaded', detail);

			if(detail.insert && detail.isSuccess && !event.defaultPrevented && detail.content != null && detail.content != elem.innerHTML){
				if(window.jQuery){
					jQuery(elem).html(detail.content);
				} else {
					elem.innerHTML = detail.content;
				}
			}

			queue.d();

			modules.forEach(loadModule, moduleObj);

			setTimeout(function(){
				lazySizes.fire(elem, 'lazyincluded', detail);
			});

			xhrObj = null;
			modules = null;
		};

		elem.lazyInclude.current = candidate;
		elem.setAttribute('data-currentinclude', candidate.name);

		if(candidate.urls.css){
			loadStyles(candidate.urls.css);
		}
		if(detail.content == null && candidate.urls.include){
			loadInclude(detail, function(data){
				xhrObj = data;
				if(modules){
					include();
				}
			});
		} else {
			xhrObj = detail;
		}

		if(candidate.urls.amd || candidate.urls.module){
			loadRequireImportCB = function(){
				modules = Array.prototype.slice.call(arguments);
				if(xhrObj){
					include();
				}
			};
			if(candidate.urls.module && window.System && System.import){
				System.import(candidate.urls.module).then(loadRequireImportCB);
			} else if(window.require) {
				loadRequire(candidate.urls.amd, loadRequireImportCB);
			}
		} else {
			modules = [];
		}

		if(xhrObj && modules){
			include();
		}
	}

	function findLoadCandidate(elem){
		var candidate;
		var includeData = getIncludeData(elem);
		if(!includeData.candidates.length || !docElem.contains(elem) ){return;}
		candidate = findCandidate(elem);
		if(candidate){
			loadCandidate(elem, candidate);
		}
		return true;
	}

	function beforeUnveil(e){
		if(e.defaultPrevented || !e.target.getAttribute('data-include')){return;}
		queue.q(e.target);
		e.detail.firesLoad = true;
	}

	addEventListener('lazybeforeunveil', beforeUnveil, false);

	addEventListener('resize', refreshIncludes, false);
	addEventListener('lazyrefreshincludes', refreshIncludes, false);

})(window, document);
