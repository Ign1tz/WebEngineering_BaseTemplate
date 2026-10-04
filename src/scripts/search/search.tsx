import { useState, type FormEvent, type ReactElement } from 'react';

interface SearchProps {
    onSearch: (searchTerm: string) => void;
}

function Search({ onSearch }: SearchProps): ReactElement {
    const [inputValue, setInputValue] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        onSearch(inputValue.trim());
    }

    return (
        <form className="search" onSubmit={handleSubmit}>
            <input
                type="search"
                name="q"
                placeholder="Search query"
                value={inputValue}
                onChange={(event) => {
                    setInputValue(event.target.value);
                }}
            />

            <input type="submit" value="Go!" />
        </form>
    );
}

export default Search;