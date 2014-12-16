/*
 This plugin extends lazySizes to lazyLoad:

 */

(function(window, document){
	'use strict';
	if(!document.getElementsByClassName) {
		return;
	}
	var config;
	var regSplitCan = /\s*,+\s+/;
	var regUrlCan = /(.+)\s+(\(\s*(.+)\s*\))/;
	var conditionalIncludes = document.getElementsByClassName('lazyconditionalinclude');

	var q = (function(){
		var queueThreshold = 3;
		var inProgress = 0;
		var queue = [];
		return {
			queue: function(element){
				if(inProgress > queueThreshold){
					queue[element.getAttribute('data-lazyqueue') != null ? 'push' : 'unshift'](element);
				} else if(findLoadCandidate(element)) {
					inProgress++;
				}
			},
			dequeue: function(){
				inProgress--;
				while(queue.length){
					if(findLoadCandidate(queue.shift())){
						break;
					}
				}
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
			timer = setTimeout(run, e.type == 'resize' ? 31 : 0);
		};
	})();


	config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

	if(window.lazySizesConfig){
		config = {};
		window.lazySizesConfig = config;
	}

	if(!config.include){
		config.include = {};
	}

	if(!config.include.conditions){
		config.include.conditions = {};
	}

	if(!('preloadAfterLoad' in config)){
		config.preloadAfterLoad = true;
	}

	function parseCandidate(input){
		var output, map;
		input = input.trim();

		map = input.match(regUrlCan);

		if(map){
			output = {
				url: RegExp.$1,
				condition: config.include.conditions[RegExp.$3] || RegExp.$2,
				name: RegExp.$3
			};
		} else {
			output = {
				url: input,
				condition: null,
				name: ''
			};
		}
		return output;
	}

	function getIncludeData(elem){
		var len;
		var includeData = elem._lazyInclude;
		if(!includeData){
			includeData = {
				srces: (elem.getAttribute('data-include') || '').split(regSplitCan).map(parseCandidate)
			};

			if(!(len = includeData.srces.length) || includeData.srces[len - 1].condition){
				includeData.srces.push({
					url: '',
					condition: null,
					name: 'initial',
					content: elem.innerHTML
				});
			}

			elem._lazyInclude = includeData;
			if(includeData.srces.length > 1){
				lazySizes.aC(elem, 'lazyconditionalinclude');
			}
		}
		return includeData;
	}

	function matchesCondition(elem, candidate){
		var matches = true;
		if(candidate.condition){
			if(typeof candidate.condition == 'string'){
				matches = matchMedia(candidate.condition).matches;
			} else if(typeof candidate.condition == 'function'){
				matches = candidate.condition.call(elem, candidate);
			}
		}
		return matches;
	}

	function findCandidate(elem){
		var i, candidate;
		var includeData = elem._lazyInclude;
		if(includeData && includeData.srces){
			for(i = 0; i < includeData.srces.length; i++){
				candidate = includeData.srces[i];
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

	function loadCandidate(elem, candidate){
		var request, include;
		var details = {
			candidate: candidate,
			openArgs: ['GET', candidate.url, true],
			sendData: null,
			xhrModifier: null,
			content: candidate.content
		};
		var event = lazySizes.fire(elem, 'lazyincludeload', details);

		if(event.defaultPrevented){
			q.dequeue();
			return;
		}

		include = function(obj){
			var status = obj.status;
			var details = {
				candidate: candidate,
				content: obj.content || obj.responseText,
				text: obj.responseText || obj.content,
				response: obj.response,
				xml: obj.responseXML,
				isSuccess: ('status' in obj) ? status >= 200 && status < 300 || status === 304 : true
			};
			var event = lazySizes.fire(elem, 'lazyincludeloaded', details);

			if(details.isSuccess && !event.defaultPrevented && details.content != elem.innerHTML){
				elem.innerHTML = details.content;
			}
			q.dequeue();
			lazySizes.fire(elem, 'lazyincluded', details);
		};

		elem._lazyInclude.current = candidate;
		elem.setAttribute('data-currentinclude', candidate.name);

		if(details.content){
			include(details);
			return;
		}

		request = new XMLHttpRequest();

		request.addEventListener('readystatechange', function () {
			var DONE = this.DONE || 4;
			if (this.readyState === DONE){

				include(request);
				request = null;
			}
		}, false);

		request.open.apply(request, details.openArgs);
		request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		if(details.xhrModifier){
			details.xhrModifier(request, elem, candidate);
		}
		request.send(details.sendData);
	}

	function findLoadCandidate(elem){
		var candidate;
		var includeData = getIncludeData(elem);
		if(!includeData.srces.length || !document.contains(elem) ){return;}
		candidate = findCandidate(elem);
		if(candidate){
			loadCandidate(elem, candidate);
		}
		return true;
	}

	function beforeUnveil(e){
		if(e.defaultPrevented || !e.target.getAttribute('data-include')){return;}
		q.queue(e.target);
		e.details.stopSwtichClass = true;
	}

	document.addEventListener('lazybeforeunveil', beforeUnveil, false);

	addEventListener('resize', refreshIncludes, false);
	addEventListener('lazyrefreshincludes', refreshIncludes, false);

})(window, document);
