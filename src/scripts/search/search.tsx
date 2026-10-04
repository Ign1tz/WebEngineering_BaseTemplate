import {FormEvent, JSX, useState} from 'react';

interface SearchProps {
    onSearch: (searchTerm: string) => void;
}

function Search({onSearch}: SearchProps): JSX.Element {
    const [searchTerm, setSearchTerm] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        onSearch(searchTerm.trim());
    }

    return (
        <form className="search" onSubmit={handleSubmit}>
    <input
        type="search"
    name="q"
    placeholder="Search query"
    value={searchTerm}
    onChange={(event) => {
        setSearchTerm(event.target.value);
    }}
    />

    <input type="submit" value="Go!" />
        </form>
);
}

export default Search;