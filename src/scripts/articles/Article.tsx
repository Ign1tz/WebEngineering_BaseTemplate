import type { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import BearList from '../bears/BearList';
import Comments from '../comments/Comments';
import HighlightedText from '../search/HighlightedText';

function Article(): ReactElement {
    const [searchParams] = useSearchParams();

    const searchTerm =
        searchParams.get('q') ?? '';

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
                src="/media/wild-bear.jpg"
                alt="Wild bear in forest"
            />

            <p>
                <HighlightedText
                    text="Urban (gentrified) bears on the other hand have largely abandoned the old ways..."
                    searchTerm={searchTerm}
                />
            </p>

            <img
                src="/media/urban-bear.jpg"
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
                <source
                    src="/media/bear.mp3"
                    type="audio/mp3"
                />
                <source
                    src="/media/bear.ogg"
                    type="audio/ogg"
                />

                <p>
                    It looks like your browser doesn't support
                    HTML5 audio players.
                </p>
            </audio>

            <aside>
                <h2>About the author</h2>

                <p>
                    Evan Wild is an unemployed plumber from
                    Doncaster...
                </p>
            </aside>

            <Comments searchTerm={searchTerm} />

            <BearList />
        </article>
    );
}

export default Article;