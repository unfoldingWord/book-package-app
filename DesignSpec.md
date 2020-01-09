# Design Specifications

## Requirements

A user will provide a "book package" as input. A "book package" is one or more books of the Bible (from the original languages).

Given a book package, return all the resources needed for the book to be translated. **At this time, only English is supported.** Word counts for each resource are shown and totals are shown. 

Resources that are re-usable (i.e., not organized by books of the Bible) will be de-duplicated and counted only once. Translation Academy articles are one such resource.

The resources include:
- Lexicon references as Strong's Numbers with counts and links
*Note: Since each word in the original text has a Strong's number, then the number of words in the original text is the same as the number of Strong's entries.*
- Translation Words (tW) with counts and links to articles
- Translation Notes (tN) with counts 
- Translation Academy (tA) with counts and links to tA articles
- Translation Questions (tQ) with counts. 
*Note: A count of the number of level one headings is used to count the number of questions.*

## Design

### UX Design

Given the "steps" required in this application, the design is specified in terms of a UI component known as a `stepper`. 

The steps would be as follows:

- Select one or more books in a checkbox list (in canonical order), then click `Next`
- [Final] Get the stats: Both totals and per book in canonical order.

This would constitute the first release of the app.

The next release would implement the book package flow optimization. This would add an optional third step. The results of second step would be enhanced:

- The per book display would have something like a checkbox so they could indicate which books are "completed", then click `Next` (or, better, `Optimize` if possible). NOTE: it is not necessary for any books to be clicked in order to optimize the flow. If no books are checked as completed, then the entire set of books in the package would be optimized.
- [Final] The results from step 2 would be re-ordered to show the books completed first (if any), followed by an optimized order.

See [issue #3](https://github.com/unfoldingWord/book-package-app/issues/3) for details on what Flow Optimization means.

### Logic Flow

NOTE: the term "database" is used below and it refers to `indexedDB` using the `localforage` NPM management component.

1. A list of books with checkboxes are presented to the user.
1. The user selects one or more books.
1. The user clicks the `Next` button.
1. The Gitea `trees` API is used against the Greek and Hebrew original language repos, as needed.
1. The SHA for each book is extracted from `trees` and the database is queried by the SHA. If it exists, then we already have the book. Otherwise the book is fetched and the statistics generated and stored with the book's JSON in the database. A timestamp is also added to the book's JSON. The timestamp will enable a database *tidy* operation to remove superseded data.
1. Once all the data is present and counted, the data is read and grand totals are generated
1. The UI is built with grand totals first; then per-book details.
1. Each detailed view will have a collapsible section containing per-chapter details.

The above completes the logic needed for the first release, which does not include the book package optimization feature.



### Data Design

The books of the Bible from which the user selects is found in `core/books.json`. Many functions to process and query this data are found in `core/books.js`.

Each book is stored in the database as an object, which can be augmented with other properties during processing.