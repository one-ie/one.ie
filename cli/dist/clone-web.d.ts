export declare function cloneWeb(orgProfile: {
    name: string;
    slug: string;
    domain: string;
}): Promise<{
    alreadyExists: boolean;
    cloned?: undefined;
} | {
    cloned: boolean;
    alreadyExists?: undefined;
}>;
//# sourceMappingURL=clone-web.d.ts.map