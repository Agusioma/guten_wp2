import styles from "../../page.module.css";
import Link from "next/link";
import parse, { domToReact } from "html-react-parser";

export async function generateStaticParams() {
    const query =  "/wp/v2/posts/";
    const posts = await fetch(
        process.env.REST_ENDPOINT + query,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    ).then((res) => res.json());

    return posts.map((post) => ({
        id: post.id.toString(),
    }))
}

export async function getPost(id) {
    const query =  "/wp/v2/posts/" + id;
    const res = await fetch(
        process.env.REST_ENDPOINT + query,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const data = res.json();
    return data;
}

/*
 * We use a regular expression (pattern) to match the specific URL you want to replace.
 * The (\d+) part captures the numeric ID after ?p=.
 * Then, we use the replacement string 'data-internal-link="true" href="/blog/$1"',
 * where $1 is a placeholder for the captured ID.
 */
export function fixInternalLinks(html_string) {
    const pattern = /href="https:\/\/yoursite.com\/\?p=(\d+)"/g;
    const replacement = 'data-internal-link="true" href="/blog/$1"';

    return html_string.replace(pattern, replacement);
}

export function parseHtml(html) {
    // Replace 2+ sequences of '\n' with a single '<br />' tag
    const _content = html.replace(/\n{2,}/g, '<br />');
    const content = fixInternalLinks(_content);

    const options = {
        replace: ({ name, attribs, children }) => {
            // Convert internal links to Next.js Link components.
            const isInternalLink =
                name === "a" && attribs["data-internal-link"] === "true";

            if (isInternalLink) {
                return (
                    <Link href={attribs.href} {...attribs}>
                        {domToReact(children, options)}
                    </Link>
                );
            } else if (name === "img") {
                attribs["width"] = "250";
                attribs["height"] = "150";
                return (
                    <img {...attribs}/>
                );
            }
        },
    };

    return parse(content, options);
}

export default async function Post({ params }) {
    const post = await getPost(params.id);

    const content = parseHtml(post.content.rendered);

    return (
        <main className={styles.main}>
            <div className={styles.center}>
                <h1>
                    {post.title.rendered}
                </h1>
            </div>

            <div className={styles.description}>
                <div>{content}</div>
            </div>
        </main>
    );
}
