import {JSX, useEffect} from 'react';
import { initializeSearch } from './scripts/search';
import { initializeComments } from './scripts/comments';
import { initializeBears } from './scripts/bears';

function App(): JSX.Element {
    useEffect(() => {
        initializeSearch();
        initializeComments();
        void initializeBears();
    }, []);

    return (
        <>
            <div className="header">
                <h1>Welcome to our wildlife website</h1>
            </div>

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

                <form className="search">
                    <input type="search" name="q" placeholder="Search query" />
                    <input type="submit" value="Go!" />
                </form>
            </div>

            <main>
                <article>
                    <h1>The trouble with Bears</h1>

                    <p>By Evan Wild</p>

                    <p>
                        Tall, lumbering, angry, dangerous. The real live bears of this world
                        are proud, independent creatures, self-serving and always on the
                        hunt for food.
                    </p>

                    <h2>Types of bear</h2>

                    <table>
                        <thead>
                        <tr>
                            <td>Bear Type</td>
                            <td>Coat</td>
                            <td>Adult size</td>
                            <td>Habitat</td>
                            <td>Lifespan</td>
                            <td>Diet</td>
                        </tr>
                        </thead>

                        <tbody>
                        <tr>
                            <td>Wild</td>
                            <td>Brown or black</td>
                            <td>1.4 to 2.8 meters</td>
                            <td>Woods and forests</td>
                            <td>25 to 28 years</td>
                            <td>Fish, meat, plants</td>
                        </tr>

                        <tr>
                            <td>Urban</td>
                            <td>North Face</td>
                            <td>18 to 22</td>
                            <td>Condos and coffee shops</td>
                            <td>20 to 32 years</td>
                            <td>Starbucks, sushi</td>
                        </tr>
                        </tbody>
                    </table>

                    <h2>Habitats and Eating habits</h2>

                    <p>
                        Wild bears eat a variety of meat, fish, fruit, nuts, and other
                        natually growing ingredients...
                    </p>

                    <img src="media/wild-bear.jpg" alt="Wild bear in forest" />

                    <p>
                        Urban (gentrified) bears on the other hand have largely abandoned
                        the old ways...
                    </p>

                    <img
                        src="media/urban-bear.jpg"
                        alt="Urban bear near buildings"
                    />

                    <h2>Mating rituals</h2>

                    <p>Bears are romantic creatures by nature...</p>

                    <audio controls>
                        <source src="media/bear.mp3" type="audio/mp3" />
                        <source src="media/bear.ogg" type="audio/ogg" />
                        <p>
                            It looks like your browser doesn't support HTML5 audio players.
                        </p>
                    </audio>

                    <aside>
                        <h2>About the author</h2>
                        <p>Evan Wild is an unemployed plumber from Doncaster...</p>
                    </aside>

                    <section className="comments">
                        <div className="show-hide">Show comments</div>

                        <div className="comment-wrapper">
                            <h1>Add comment</h1>

                            <form className="comment-form">
                                <div className="flex-pair">
                                    Your name:
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="flex-pair">
                                    Your comment:
                                    <input
                                        type="text"
                                        name="comment"
                                        id="comment"
                                        placeholder="Enter your comment"
                                    />
                                </div>

                                <div>
                                    <input type="submit" value="Submit comment" />
                                </div>
                            </form>

                            <h1>Comments</h1>

                            <ul className="comment-container">
                                <li>
                                    <p>Bob Fossil</p>
                                    <p>
                                        Oh I am so glad you taught me all about the big brown angry
                                        guys...
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="more_bears">
                        <h2>More Bears</h2>
                    </section>
                </article>

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