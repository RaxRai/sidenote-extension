const storeUrl =
  process.env.NEXT_PUBLIC_CHROME_STORE_URL?.trim() ||
  "https://chromewebstore.google.com/";

const repoUrl = process.env.NEXT_PUBLIC_REPO_URL?.trim();

export default function Home() {
  return (
    <main className="page">
      <header className="page-header">
        <img
          className="icon-thumb"
          src="/icon-128.png"
          alt=""
          width={56}
          height={56}
        />
        <div className="title-block">
          <h1>SideNote</h1>
          <p className="tag">Notes in Chrome’s side panel</p>
        </div>
      </header>

      <div className="prose">
        <p>
          Easy to end up with extra tabs or a full doc open just to jot a line
          while you read. SideNote is the smaller option: a panel beside the page
          you already have up.
        </p>
        <p>
          Formatting is there if you want it; you can also export to Markdown or
          plain text. Data stays in the browser—no sign-in, and no sync unless
          you add that yourself later.
        </p>
        <p className="muted">
          Built for Chrome’s side panel. If your browser doesn’t support that,
          it’s probably not worth installing.
        </p>
      </div>

      <div className="actions">
        <a className="btn btn-primary" href={storeUrl} rel="noopener noreferrer">
          Chrome Web Store
        </a>
        {repoUrl ? (
          <a className="text-link" href={repoUrl} rel="noopener noreferrer">
            View source
          </a>
        ) : null}
      </div>
    </main>
  );
}
