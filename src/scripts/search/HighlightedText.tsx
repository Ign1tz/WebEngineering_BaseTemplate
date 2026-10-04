import type { ReactElement, ReactNode } from 'react';

interface HighlightedTextProps {
    text: string;
    searchTerm: string;
}

function HighlightedText({
                             text,
                             searchTerm,
                         }: HighlightedTextProps): ReactElement {
    const trimmedSearchTerm = searchTerm.trim();

    if (trimmedSearchTerm === '') {
        return <>{text}</>;
    }

    const escapedSearchTerm = trimmedSearchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );

    const regularExpression = new RegExp(
        `(${escapedSearchTerm})`,
        'gi'
    );

    const parts = text.split(regularExpression);

    const highlightedParts: ReactNode[] = parts.map((part, index) => {
        const isMatch =
            part.toLowerCase() === trimmedSearchTerm.toLowerCase();

        if (isMatch) {
            return (
                <mark
                    className="highlight"
                    key={`${index}-${part}`}
                >
                    {part}
                </mark>
            );
        }

        return part;
    });

    return <>{highlightedParts}</>;
}

export default HighlightedText;