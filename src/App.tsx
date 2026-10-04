import { useState, type ReactElement } from 'react';
import Article from './scripts/articles/Article';
import Navigation from './scripts/nav/Navigation';

function App(): ReactElement {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <>
            <div className="header">
                <h1>Welcome to our wildlife website</h1>
            </div>

            <Navigation onSearch={setSearchTerm} />

            <main>
                <Article searchTerm={searchTerm} />

                <div className="secondary">
                    <h1>Related</h1>

                    <ul>
                        <li>
                            <a href="#">The trouble with Bees</a>
                        </li>
                        <li>
                            <a href="#">The trouble with Otters</a>
                        </li>
                        <li>
                            <a href="#">The trouble with Penguins</a>
                        </li>
                        <li>
                            <a href="#">The trouble with Octopi</a>
                        </li>
                        <li>
                            <a href="#">The trouble with Lemurs</a>
                        </li>
                    </ul>
                </div>
            </main>

            <footer>
                <p>©Copyright 2050 by nobody. All rights reversed.</p>
            </footer>
        </>
    );
}

export default App;