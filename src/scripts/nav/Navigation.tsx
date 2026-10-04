import type { ReactElement } from 'react';
import Search from '../search/Search';

function Navigation(): ReactElement {
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

            <Search />
        </div>
    );
}

export default Navigation;
