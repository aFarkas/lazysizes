import { LazySizesConfigPartial, LazySizesConfig } from './lazysizes-config';

export { LazySizesConfigPartial, LazySizesConfig };

export interface LazyUnveilReadEvent extends CustomEvent {
	target: Element;
	type: 'lazyunveilread';
	detail: {
		instance: any; // lazySizes
		[key: string]: any;
	}
}

export interface LazyBeforeUnveilEvent extends CustomEvent {
	target: Element;
	type: 'lazybeforeunveil';
	preventAble: true;
	detail: {
		instance: any; // lazySizes
		[key: string]: any;
	}
}

export interface LazyBeforeSizesEvent extends CustomEvent {
	type: 'lazybeforesizes';
	detail: {
		width: number;
		dataAttr: boolean;
		instance: any; // lazySizes
		[key: string]: any;
	}
}

declare global {
	interface Window {
		lazySizesConfig?: LazySizesConfigPartial;
	}

	interface WindowEventMap {
		lazyunveilread: LazyUnveilReadEvent;
		lazybeforeunveil: LazyBeforeUnveilEvent;
		lazybeforesizes: LazyBeforeSizesEvent;
	}

	interface DocumentEventMap {
		lazyunveilread: LazyUnveilReadEvent;
		lazybeforeunveil: LazyBeforeUnveilEvent;
		lazybeforesizes: LazyBeforeSizesEvent;
	}

	interface ElementEventMap {
		lazyunveilread: LazyUnveilReadEvent;
		lazybeforeunveil: LazyBeforeUnveilEvent;
		lazybeforesizes: LazyBeforeSizesEvent;
	}
}
