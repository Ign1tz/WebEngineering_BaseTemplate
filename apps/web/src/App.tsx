import { type JSX, useState } from 'react';
import { Link, Route, Routes, useSearchParams } from 'react-router-dom';
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
    const [params, setParams] = useSearchParams();
    const search = params.get('search') ?? '';

    return (
        <main>
            <Link to="/">Back to article</Link>
            <h1>Bears</h1>

            <label>
                Search bears
                <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                        const value = event.target.value;
                        const next = new URLSearchParams(params);

                        if (value === '') {
                            next.delete('search');
                        } else {
                            next.set('search', value);
                        }

                        setParams(next, { replace: true });
                    }}
                />
            </label>

            <BearList search={search} standalone />
        </main>
    );
}

export default function App(): JSX.Element {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bears" element={<BearListPage />} />
            <Route path="/bears/:bearId" element={<BearDetail />} />
            <Route path="*" element={<Link to="/bears">Browse bears</Link>} />
        </Routes>
    );
}
