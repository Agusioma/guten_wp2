import styles from "./page.module.css";
import Link from "next/link";

async function getPosts() {
  const query =  "/wp/v2/posts/";
  const res = await fetch(
      process.env.REST_ENDPOINT + query,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
  );

  const data = await res.json();
  return data;
}

export default async function Home() {
  const posts = await getPosts();

  return (
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Static Site with WP REST and&nbsp;
            <code className={styles.code}>next.js</code>
          </p>
        </div>

        <div className={styles.center}>
          <h1> Headless Blog </h1>
        </div>

        <div className={styles.grid}>
          {posts.map((post) => (
              <Link
                  href={"/blog/" + post.id}
                  key={post.title.rendered}
                  className={styles.card}
                  rel="noopener noreferrer"
              >
                <h2>
                  {post.title.rendered} <span>-&gt;</span>
                </h2>
                <p>{post.content.rendered.slice(0, 200).replace(/(<([^>]+)>)/gi, "") + "..."}</p>
              </Link>
          ))}
        </div>

      </main>
  );
}

