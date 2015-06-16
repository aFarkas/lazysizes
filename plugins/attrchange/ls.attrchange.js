(function(window, document){
	'use strict';
	if(!window.addEventListener){return;}

	var addObserver = function(){
		var connect, disconnect, observer, connected;
		var lazySizes = window.lazySizes;
		var lsCfg = lazySizes.cfg;
		var attributes = {'data-bgset': 1, 'data-include': 1, 'data-poster': 1, 'data-bg': 1, 'data-script': 1};
		var classTest = '(' + lsCfg.loadedClass + '|' + lsCfg.loadingClass + ')';
		var docElem = document.documentElement;

		var onMutation = function(mutations){
			var i, len, mutation, target;
			for(i = 0, len = mutations.length; i < len; i++){
				mutation = mutations[i];
				target = mutation.target;

				if(!target.getAttribute(mutation.attributeName)){continue;}

				if(target.localName == 'source' && target.parentNode){
					target = target.parentNode.querySelector('img');
				}

				if(target && lazySizes.hC(target, classTest)){
					lazySizes.rC(target, lsCfg.loadedClass);
					lazySizes.aC(target, lsCfg.lazyClass);
				}
			}
		};

		attributes[lsCfg.srcAttr] = 1;
		attributes[lsCfg.srcsetAttr] = 1;

		if(window.MutationObserver){
			observer = new MutationObserver(onMutation);

			connect = function(){
				if(!connected){
					connected = true;
					observer.observe( docElem, { subtree: true, attributes: true, attributeFilter: Object.keys(attributes)} );
				}
			};
			disconnect = function(){
				if(connected){
					connected = false;
					observer.disconnect();
				}
			};
		} else {
			docElem.addEventListener('DOMAttrModified', (function(){
				var runs;
				var modifications = [];
				var callMutations = function(){
					onMutation(modifications);
					modifications = [];
					runs = false;
				};
				return function(e){
					if(connected && attributes[e.attrName] && e.newValue){
						modifications.push({target: e.target, attributeName: e.attrName});
						if(!runs){
							setTimeout(callMutations);
							runs = true;
						}
					}
				};
			})(), true);

			connect = function(){
				connected = true;
			};
			disconnect = function(){
				connected = false;
			};
		}

		addEventListener('lazybeforeunveil', disconnect, true);
		addEventListener('lazybeforeunveil', connect);

		addEventListener('lazybeforesizes', disconnect, true);
		addEventListener('lazybeforesizes', connect);
		connect();

		removeEventListener('lazybeforeunveil', addObserver);
	};


	addEventListener('lazybeforeunveil', addObserver);
})(window, document);
