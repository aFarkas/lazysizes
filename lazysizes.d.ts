import './types/global';

export = lazySizes;
declare var lazySizes: {
    init: () => void;
    /**
     * @type { LazySizesConfigPartial }
     */
    cfg: LazySizesConfigPartial;
    /**
     * @type { true }
     */
    noSupport: true;
    autoSizer?: undefined;
    loader?: undefined;
    uP?: undefined;
    aC?: undefined;
    rC?: undefined;
    hC?: undefined;
    fire?: undefined;
    gW?: undefined;
    rAF?: undefined;
} | {
    /**
     * @type { LazySizesConfigPartial }
     */
    cfg: LazySizesConfigPartial;
    autoSizer: {
        _: () => void;
        checkElems: () => void;
        updateElem: (elem: Element, dataAttr: any, width?: number) => void;
    };
    loader: {
        _: () => void;
        checkElems: (isPriority: any) => void;
        unveil: (elem: Element) => void;
        _aLSL: () => void;
    };
    init: () => void;
    uP: (el: any, full: any) => void;
    aC: (ele: Element, cls: string) => void;
    rC: (ele: Element, cls: string) => void;
    hC: (ele: Element, cls: string) => any;
    fire: (elem: Element, name: string, detail: any, noBubbles: boolean, noCancelable: boolean) => CustomEvent;
    gW: (elem: Element, parent: Element, width?: number) => number;
    rAF: {
        (fn: any, queue: any, ...args: any[]): void;
        _lsFlush: () => void;
    };
    /**
     * @type { true }
     */
    noSupport?: undefined;
};
declare namespace lazySizes {
    export { LazySizesConfigPartial };
}
type LazySizesConfigPartial = {
    [x: string]: any;
    lazyClass?: string;
    loadedClass?: string;
    loadingClass?: string;
    preloadClass?: string;
    errorClass?: string;
    autosizesClass?: string;
    fastLoadedClass?: string;
    iframeLoadMode?: 0 | 1;
    srcAttr?: string;
    srcsetAttr?: string;
    sizesAttr?: string;
    preloadAfterLoad?: boolean;
    minSize?: number;
    customMedia?: Record<string, string>;
    init?: boolean;
    expFactor?: number;
    hFac?: number;
    loadMode?: 0 | 1 | 2 | 3;
    loadHidden?: boolean;
    ricTimeout?: number;
    throttleDelay?: number;
};
