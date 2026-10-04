import Search from '../search/Search';
import {JSX} from "react";

interface NavigationProps {
    onSearch: (searchTerm: string) => void;
}

function Navigation({ onSearch }: NavigationProps): JSX.Element {
    return (
        <div className="nav">
            <ul>
                <li>
                    <a href="#">Home</a>
                </li>
                <li>
                    <a href="#">Our team</a>
                </li>
                <li>
                    <a href="#">Projects</a>
                </li>
                <li>
                    <a href="#">Blog</a>
                </li>
            </ul>

            <Search onSearch={onSearch} />
        </div>
    );
}

export default Navigation;