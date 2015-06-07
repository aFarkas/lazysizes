(function(window, document){
	'use strict';
	if(!window.addEventListener){return;}

	var addObserver = function(){

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

				if(target.nodeName.toLowerCase() == 'source' && target.parentNode){
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
			new MutationObserver(onMutation).observe( docElem, { subtree: true, attributes: true, attributeFilter: Object.keys(attributes)} );
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
					if(e.newValue && attributes[e.attrName]){
						modifications.push({target: e.target, attributeName: e.attrName});
						if(!runs){
							setTimeout(callMutations);
							runs = true;
						}
					}
				};
			})(), true);
		}

		removeEventListener('lazybeforeunveil', addObserver);
	};


	addEventListener('lazybeforeunveil', addObserver);
})(window, document);
