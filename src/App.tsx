import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Article from './scripts/articles/Article';
import BearDetail from './scripts/bears/BearDetail';
import Navigation from './scripts/nav/Navigation';

function BearListPage(): ReactElement {
    return (
        <>
            <div className="header">
                <h1>Welcome to our wildlife website</h1>
            </div>

            <Navigation />

            <main>
                <Article />

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

function App(): ReactElement {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/bears" replace />} />

            <Route path="/bears" element={<BearListPage />} />

            <Route path="/bears/:bearId" element={<BearDetail />} />

            <Route path="*" element={<Navigate to="/bears" replace />} />
        </Routes>
    );
}

export default App;
