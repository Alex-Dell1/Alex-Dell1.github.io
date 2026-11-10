# Alex Della Schiava · Academic homepage

The website is published at https://alex-dell1.github.io.

All profile text, links, research keywords, news, publications, education, experience, and About me content are in `content.json`.

The About me page is linked from the top navigation. Edit the `about` fields to update the personal introduction, sports, and languages. Paragraphs support plain text, link objects (`text` and `url`), and decorative emoji objects (`emoji`).

To add a talk or other update, copy an entry in the `news` list and replace its date, title, description, and optional link. Use dates in YYYY-MM-DD format. News is sorted automatically, with the three newest entries shown on the homepage and older entries in the expandable archive. Change `recentNewsCount` to adjust that number.

For preprint news, first add the paper's title, authors, venue or arXiv citation, year, type, and URL to `publications` (displayed in the Papers section). Then add a `news` entry with `date`, `type: "Preprint"`, and the same `url`. The news entry reuses the paper's title, author list, and citation, so no separate `title` or `detail` is needed. The build reports an error if a preprint news URL has no matching paper.

After editing, run `node build.mjs` to regenerate `index.html` and `about.html`. Open either page in a browser to preview it. When publishing, include the source changes and both generated pages. No dependencies need to be installed.

You can also ask ChatGPT to edit the content, regenerate the homepage, and publish the change to this repository.
