import {
    useEffect,
    useState,
    type FormEvent,
    type ReactElement,
} from 'react';
import {
    useNavigate,
    useSearchParams,
} from 'react-router-dom';

function Search(): ReactElement {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const searchTerm = searchParams.get('q') ?? '';

    const [inputValue, setInputValue] =
        useState(searchTerm);

    useEffect(() => {
        setInputValue(searchTerm);
    }, [searchTerm]);

    function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ): void {
        event.preventDefault();

        const trimmedValue = inputValue.trim();

        const params = new URLSearchParams();

        if (trimmedValue !== '') {
            params.set('q', trimmedValue);
        }

        const query = params.toString();

        navigate(
            query === ''
                ? '/bears'
                : `/bears?${query}`
        );
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