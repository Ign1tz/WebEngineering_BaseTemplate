import type { ReactElement } from 'react';
import BearList from '../bears/BearList';
import Comments from '../comments/Comments';
import HighlightedText from '../search/HighlightedText';

interface ArticleProps {
    searchTerm: string;
}

function Article({ searchTerm }: ArticleProps): ReactElement {
    return (
        <article>
            <h1>
                <HighlightedText
                    text="The trouble with Bears"
                    searchTerm={searchTerm}
                />
            </h1>

            <p>
                <HighlightedText
                    text="By Evan Wild"
                    searchTerm={searchTerm}
                />
            </p>

            <p>
                <HighlightedText
                    text="Tall, lumbering, angry, dangerous. The real live bears of this world are proud, independent creatures, self-serving and always on the hunt for food."
                    searchTerm={searchTerm}
                />
            </p>

            <h2>
                <HighlightedText
                    text="Types of bear"
                    searchTerm={searchTerm}
                />
            </h2>

            <table>
                <thead>
                <tr>
                    <td>
                        <HighlightedText text="Bear Type" searchTerm={searchTerm} />
                    </td>
                    <td>
                        <HighlightedText text="Coat" searchTerm={searchTerm} />
                    </td>
                    <td>
                        <HighlightedText text="Adult size" searchTerm={searchTerm} />
                    </td>
                    <td>
                        <HighlightedText text="Habitat" searchTerm={searchTerm} />
                    </td>
                    <td>
                        <HighlightedText text="Lifespan" searchTerm={searchTerm} />
                    </td>
                    <td>
                        <HighlightedText text="Diet" searchTerm={searchTerm} />
                    </td>
                </tr>
                </thead>

                <tbody>
                <tr>
                    <td>
                        <HighlightedText text="Wild" searchTerm={searchTerm} />
                    </td>
                    <td>
                        <HighlightedText
                            text="Brown or black"
                            searchTerm={searchTerm}
                        />
                    </td>
                    <td>
                        <HighlightedText
                            text="1.4 to 2.8 meters"
                            searchTerm={searchTerm}
                        />
                    </td>
                    <td>
                        <HighlightedText
                            text="Woods and forests"
                            searchTerm={searchTerm}
                        />
                    </td>
                    <td>
                        <HighlightedText
                            text="25 to 28 years"
                            searchTerm={searchTerm}
                        />
                    </td>
                    <td>
                        <HighlightedText
                            text="Fish, meat, plants"
                            searchTerm={searchTerm}
                        />
                    </td>
                </tr>

                <tr>
                    <td>
                        <HighlightedText text="Urban" searchTerm={searchTerm} />
                    </td>
                    <td>
                        <HighlightedText
                            text="North Face"
                            searchTerm={searchTerm}
                        />
                    </td>
                    <td>
                        <HighlightedText
                            text="18 to 22"
                            searchTerm={searchTerm}
                        />
                    </td>
                    <td>
                        <HighlightedText
                            text="Condos and coffee shops"
                            searchTerm={searchTerm}
                        />
                    </td>
                    <td>
                        <HighlightedText
                            text="20 to 32 years"
                            searchTerm={searchTerm}
                        />
                    </td>
                    <td>
                        <HighlightedText
                            text="Starbucks, sushi"
                            searchTerm={searchTerm}
                        />
                    </td>
                </tr>
                </tbody>
            </table>

            <h2>
                <HighlightedText
                    text="Habitats and Eating habits"
                    searchTerm={searchTerm}
                />
            </h2>

            <p>
                <HighlightedText
                    text="Wild bears eat a variety of meat, fish, fruit, nuts, and other natually growing ingredients..."
                    searchTerm={searchTerm}
                />
            </p>

            <img
                src="media/wild-bear.jpg"
                alt="Wild bear in forest"
            />

            <p>
                <HighlightedText
                    text="Urban (gentrified) bears on the other hand have largely abandoned the old ways..."
                    searchTerm={searchTerm}
                />
            </p>

            <img
                src="media/urban-bear.jpg"
                alt="Urban bear near buildings"
            />

            <h2>
                <HighlightedText
                    text="Mating rituals"
                    searchTerm={searchTerm}
                />
            </h2>

            <p>
                <HighlightedText
                    text="Bears are romantic creatures by nature..."
                    searchTerm={searchTerm}
                />
            </p>

            <audio controls>
                <source src="media/bear.mp3" type="audio/mp3" />
                <source src="media/bear.ogg" type="audio/ogg" />

                <p>
                    It looks like your browser doesn't support HTML5 audio players.
                </p>
            </audio>

            <aside>
                <h2>
                    <HighlightedText
                        text="About the author"
                        searchTerm={searchTerm}
                    />
                </h2>

                <p>
                    <HighlightedText
                        text="Evan Wild is an unemployed plumber from Doncaster..."
                        searchTerm={searchTerm}
                    />
                </p>
            </aside>

            <Comments searchTerm={searchTerm} />

            <BearList />
        </article>
    );
}

export default Article;