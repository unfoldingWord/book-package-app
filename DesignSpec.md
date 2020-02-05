# Design Specifications

## Requirements

A user will provide a "book package" as input. A "book package" is one or more books of the Bible (from the original languages).

Given a book package, return all the resources needed for the book to be translated. **At this time, only English is supported.** Word counts for each resource are shown and totals are shown. 

Resources that are re-usable (i.e., not organized by books of the Bible) will be de-duplicated and counted only once. Translation Academy and Words articles fall into this category.

The resources include:
- The unfoldingWord Translation Words (UTW) with counts and links to articles
- The unfoldingWord Translation Academy (UTA) with counts and links to tA articles
- The unfoldingWord Translation Notes (UTN) with counts 
- The unfoldingWord Translation Questions (UTQ) with counts
- The unfoldingWord Literal Text (ULT) with counts
- The unfoldingWord Simplified Text (UST) with counts

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
1. The user selections are passed to the book-package-rcl for processing and presentation

The above completes the logic needed for the first release, which does not include the book package optimization feature.

1. The selected books are shown as checkboxes and the user may indicate any that are completed.
1. Then the user choose to optimize the book package flow.
1. The essential logic of the optimization is shown below.

### Optimization Logic

1. Create a list of books already completed per user input, with their associated word counts. Include: bookId, word count total, and order added to list. This will be the "book list".
2. Create a list of the associated UTA, UTW articles completed per above. Include the UTA, UTW article name or reference, the word count associated to the article, and which book referenced the article first, and all the books which reference it. This will be the "article list".
3. The order of the completed books added to the book list is determined as follows, looping until all completed books are added to the book list:
    1. Pick the one with the lowest word count total
    2. Add the associated articles to the article list
    3. Re-compute the word count totals for the completed books
4. The article list is an exclusion list. No article in it will be counted again in subsequent steps.
5. If N is the number of books not completed, then loop N-1 times the following steps:
    1. Compute the word counts of each remaining book, excluding any articles in article list
    2. Pick the book with the lowest word count and add it to the book list
    3. Add the associated articles to the article list for further exclusion
5. Loop is done with one book left. Re-compute its word count and add it to the book list and its associated articles to the article list.

Finally, the results may be displayed. The books are shown in the order added, which is the optimized flow. For each book, show:

- The bookId, title, total word count, associated articles first used by this book.
- For each article, also show the other books that reference it.

**Example**




### Overview of the Linked Resources

The resource linkages for a book package begin with the original languages. Given a book, say Titus, the Greek text in USFM format is fetched and converted to JSON format. 
- The Strong's numbers exist for each word and there is a document for each Strong's number. Each document can be fetched and the words counted.
- The text also contains references to Translation Words and each refers to a document that can be fetched and counted.

The other resources are organized by books of the Bible and therefore can be fetched directly based on user input.

### Data Design

The books of the Bible from which the user selects is found in `core/books.json`. Many functions to process and query this data are found in `core/books.js`.

Each book and document is stored in the database as an object, which can be augmented with other properties during processing.