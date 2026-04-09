const storeUrl =
  process.env.NEXT_PUBLIC_CHROME_STORE_URL?.trim() ||
  "https://chromewebstore.google.com/";

const repoUrl =
  process.env.NEXT_PUBLIC_REPO_URL?.trim() ||
  "https://github.com/RaxRai/sidenote-extension";

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
        <a
          className="text-link text-link--with-icon"
          href={repoUrl}
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 98 96"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.225-22.23-5.42-22.23-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
            />
          </svg>
          <span>Source code</span>
        </a>
      </div>

      <section className="privacy" id="privacy" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Privacy</h2>
        <div className="privacy-body">
          <p>
            SideNote doesn’t collect personal information, run analytics, or send
            your notes anywhere. Content is stored with Chrome’s{" "}
            <code className="inline-code">storage</code> API on your device only—we
            don’t operate servers for the extension, and there’s no sign-in or sync
            built in.
          </p>
          <p>
            We don’t sell or share data because we don’t have access to it. If you
            export a file, that’s entirely on your machine; we never see it.
          </p>
          <p className="muted">
            Chrome and the Web Store have their own policies; this section only
            describes what SideNote itself does. If that ever changes, this page
            will be updated.
          </p>
        </div>
      </section>
    </main>
  );
}
