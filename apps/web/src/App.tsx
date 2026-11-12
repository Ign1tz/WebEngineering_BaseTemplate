import { type JSX, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Article from './scripts/articles/Article';
import BearDetail from './scripts/bears/BearDetail';
import BearList from './scripts/bears/BearList';
import Navigation from './scripts/nav/Navigation';

function HomePage(): JSX.Element {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <>
            <header className="header">
                <h1>Welcome to our wildlife website</h1>
            </header>

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

function BearListPage(): JSX.Element {
    return (
        <main>
            <Link to="/">Back to article</Link>
            <BearList standalone />
        </main>
    );
}

export default function App(): JSX.Element {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bears" element={<BearListPage />} />
            <Route path="/bears/:bearId" element={<BearDetail />} />
            <Route path="*" element={<Link to="/">Back to article</Link>} />
        </Routes>
    );
}