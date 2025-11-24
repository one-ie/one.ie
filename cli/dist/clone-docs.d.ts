export declare function cloneThirdPartyDocs(): Promise<({
    name: string;
    skipped: boolean;
    cloned?: undefined;
    error?: undefined;
} | {
    name: string;
    cloned: boolean;
    skipped?: undefined;
    error?: undefined;
} | {
    name: string;
    error: any;
    skipped?: undefined;
    cloned?: undefined;
})[]>;
//# sourceMappingURL=clone-docs.d.ts.map