export interface Bear {
    name: string;
    binomial: string;
    image: string;
    range: string;
}

export interface WikipediaParseResponse {
    parse: {
        wikitext: {
            '*': string;
        };
    };
}

export interface WikipediaImageResponse {
    query: {
        pages: Record<
            string,
            {
                imageinfo: Array<{
                    url: string;
                }>;
            }
        >;
    };
}
