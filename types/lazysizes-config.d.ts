export interface LazySizesConfig {
	lazyClass: string;
	loadedClass: string;
	loadingClass: string;
	preloadClass: string;
	errorClass: string;
	//strictClass: 'lazystrict';
	autosizesClass: string;
	fastLoadedClass: string;
	iframeLoadMode: 0 | 1;
	srcAttr: string;
	srcsetAttr: string;
	sizesAttr: string;
	preloadAfterLoad: boolean;
	minSize: number;
	customMedia: Record<string, string>;
	init: boolean;
	/**
	 * Must be over 1.
	 */
	expFactor: number;
	hFac: number;
	loadMode: 0 | 1 | 2 | 3;
	loadHidden: boolean;
	ricTimeout: number;
	throttleDelay: number;
	[key: string]: any;
}

export type LazySizesConfigPartial = Partial<LazySizesConfig>;
