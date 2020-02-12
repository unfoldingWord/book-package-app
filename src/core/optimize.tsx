import React from 'react';
import Typography from '@material-ui/core/Typography';
import * as dbsetup from 'book-package-rcl';
import * as books from './books';

export interface bpStateIF { [x: string]: boolean[]; };
  
const resourcePrefixes = ['uta-', 'utw-', 'ult-','ust-', 'utq-', 'utn-']

export async function optimize(state: bpStateIF, setOpt: React.Dispatch<React.SetStateAction<JSX.Element>> ) {
    setOpt(<div>Waiting for optimization to complete</div>);
    // extract the books in the package
    const allbooks = Object.keys(state);
    // extract the book package
    const bookpkg    = allbooks.filter( function(book) { return state[book][0] } );
    console.log("bookpkg:",bookpkg);
    // extract the books that are done/completed first (if any)
    const booksDone  = bookpkg.filter( function(book) { return state[book][1] } );
    console.log("booksDone:",booksDone);
    // books to be optimized
    const booksOpt   = bookpkg.filter( function(book) { return !booksDone.includes(book) } );
    console.log("booksOpt:",booksOpt);

    // count words in each book for pre-optimization summary
    let bookCountTotalsPreOpt = new Map<string,number>();
    let bookCountArticleTotalsPreOpt = new Map<string,number>();
    let bklist: string[] = [];
    for (let bk of bookpkg) {
        let bkid = books.bookIdByTitle(bk);
        bklist.push(bkid);
        for (let res of resourcePrefixes) {
            let dbkey = res+bkid;
            let data = await dbsetup.bpstore.getItem(dbkey);
            let rescount = data.total;
            if ( rescount === undefined ) {
                rescount = data.grandTotalWordCount
                // add to article count (deduped)
                if ( bookCountArticleTotalsPreOpt.has(bkid) ) {
                    bookCountArticleTotalsPreOpt.set(bkid, bookCountArticleTotalsPreOpt.get(bkid) + rescount);
                } else {
                    bookCountArticleTotalsPreOpt.set(bkid,rescount)
                }
            };
            if ( bookCountTotalsPreOpt.has(bkid) ) {
                bookCountTotalsPreOpt.set(bkid, bookCountTotalsPreOpt.get(bkid) + rescount);
            } else {
                bookCountTotalsPreOpt.set(bkid,rescount);
            }
        }    
    }

    /*
        For the books marked as done, compute their word count contribution by:
        a. create a deduped list of all articles (UTA and UTW) with their counts
        b. compute the grand total of the articles
        c. Add to that the total word counts for UTQ, UTN, ULT, and UST
        d. This sum total will be the starting point for the book package flow.
    */
    let doneGrandTotal = 0;
    let doneArticleMap = new Map<string,number>();
    for (let i=0; i < booksDone.length; i++) {
        // get the UTA articles and their counts
        let bkid = books.bookIdByTitle(booksDone[i]);
        let dbkey = "uta-"+bkid;
        let data = await dbsetup.bpstore.getItem(dbkey);
        let dam = data.detail_article_map;
        let articles = Object.keys(dam);
        for (let j=0; j< articles.length; j++) {
            let articleCount = dam[articles[j]].total;
            // now add to map. dups expected
            if ( ! doneArticleMap.has(articles[j])) {
                doneArticleMap.set(articles[j], articleCount);
                //console.log(articles[j], articleCount);
            }
        }

        // get the UTW articles and their counts
        dbkey = "utw-"+bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        dam = data.detail_article_map;
        articles = Object.keys(dam);
        for (let j=0; j< articles.length; j++) {
            let articleCount = dam[articles[j]].total;
            // now add to map. dups expected
            if ( ! doneArticleMap.has(articles[j])) {
                doneArticleMap.set(articles[j], articleCount);
                //console.log(articles[j], articleCount);
            }
        }
    }

    // add up the article contributions
    for ( let c of doneArticleMap.values() ) {
        doneGrandTotal = doneGrandTotal + c;
    }
    console.log("done article total is:", doneGrandTotal);

    // now add in the UTQ, UTN, ULT, UST for each completed book
    for (let i=0; i < booksDone.length; i++) {
        // get the UTA articles and their counts
        let bkid = books.bookIdByTitle(booksDone[i]);
        let dbkey = "utq-"+bkid;
        let data  = await dbsetup.bpstore.getItem(dbkey);
        let resourceTotal = data.total;
        doneGrandTotal = doneGrandTotal + resourceTotal;
        dbkey = "utn-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        resourceTotal = data.total;
        doneGrandTotal = doneGrandTotal + resourceTotal;
        dbkey = "ult-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        resourceTotal = data.total;
        doneGrandTotal = doneGrandTotal + resourceTotal;
        dbkey = "ust-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        resourceTotal = data.total;
        doneGrandTotal = doneGrandTotal + resourceTotal;
    }
    console.log("Done grand total is:", doneGrandTotal);
    /*
        The above marks the end of the computation of the books 
        marked as done.
    */
   

    /*
        This is the loop that computes the optimized path.
        Given that there are n books to optimize, then the 
        loop only needs to be done n-1 times. At that point, 
        only one book is left and it will be the last one.

        The inner loop will loop thru all the remaining 
        books to determine which should be next. This is done
        by computing word counts of all the resources
        associated to the book, but excluding any articles 
        (i.e., UTA and UTW) that have already been done.

        The inner loop will be executed one less each time,
        since the winning book in each round will be removed
        from the array of books to be optimized. In the last
        round, there will be two books left to do.

    */
    let round:number = 0;
    let optBooks: string[] = [];
    let optCounts: number[] = [];
    for (let n=0; n < booksOpt.length; n++ ) {
        round++;
        console.log("Begin round:",round);
        let newBooks: string[] = [];
        let newCounts: number[] = [];
        for (let i=0; i < booksOpt.length; i++) {
            // skip winners from prior rounds
            if ( optBooks.includes(booksOpt[i]) ) {
                continue;
            }
            // The book for this round:
            newBooks.push(booksOpt[i]);
            // get the UTA articles and their counts
            let bkid = books.bookIdByTitle(booksOpt[i]);
            let dbkey = "uta-"+bkid;
            let data = await dbsetup.bpstore.getItem(dbkey);
            let dam = data.detail_article_map;
            let articles = Object.keys(dam);

            // dedup the articles for this book
            // using the article map below
            let optArticleMap = new Map<string,number>();

            for (let j=0; j< articles.length; j++) {
                // first check to see if this article is in the done list
                // if so skip it
                if ( doneArticleMap.has(articles[j]) ) { continue;}
                let articleCount = dam[articles[j]].total;
                // now add to map. dups expected
                optArticleMap.set(articles[j], articleCount);
                //console.log(articles[j], articleCount);
            }

            // get the UTW articles and their counts
            dbkey = "utw-"+bkid;
            data = await dbsetup.bpstore.getItem(dbkey);
            dam = data.detail_article_map;
            articles = Object.keys(dam);

            for (let j=0; j< articles.length; j++) {
                // first check to see if this article is in the done list
                // if so skip it
                if ( doneArticleMap.has(articles[j]) ) { continue;}
                let articleCount = dam[articles[j]].total;
                // now add to map
                optArticleMap.set(articles[j], articleCount);
                //console.log(articles[j], articleCount);
            }

            // add up the article contributions for this book
            let optBookTotal: number = 0;
            for ( let c of optArticleMap.values() ) {
                optBookTotal = optBookTotal + c;
            }
            console.log("book article total is:", booksOpt[i],optBookTotal );

            // now add in the UTQ, UTN, ULT, UST for each completed book
            dbkey = "utq-"+bkid;
            data  = await dbsetup.bpstore.getItem(dbkey);
            optBookTotal = optBookTotal + data.total;
            dbkey = "utn-"+bkid;
            data  = await dbsetup.bpstore.getItem(dbkey);
            optBookTotal = optBookTotal + data.total;
            dbkey = "ult-"+bkid;
            data  = await dbsetup.bpstore.getItem(dbkey);
            optBookTotal = optBookTotal + data.total;
            dbkey = "ust-"+bkid;
            data  = await dbsetup.bpstore.getItem(dbkey);
            optBookTotal = optBookTotal + data.total;
            newCounts.push(optBookTotal);
            console.log("Book grand total is:", booksOpt[i], optBookTotal);
        }

        /*
            Now we decide which book has the least word count!
        */
        // initialize to the first one
        let roundWinnerBook: string = newBooks[0]; 
        let roundWinnerCount: number = newCounts[0]; 
        for (let i=1; i < newBooks.length; i++) {
            if (newCounts[i] < roundWinnerCount ) {
                roundWinnerBook = newBooks[i];
                roundWinnerCount = newCounts[i];
            }
        }
        // record the winner
        optBooks.push(roundWinnerBook);
        optCounts.push(roundWinnerCount);
        console.log("Round ", round, "winner is ",roundWinnerBook, " with count:", roundWinnerCount);
        
        /* ------------------------------------------------------------

            Now add the winner's UTA and UTW articles to the done list
            these will not be done again in subsequent rounds

        */
        let bkid = books.bookIdByTitle(roundWinnerBook);
        let dbkey = "uta-"+bkid;
        let data = await dbsetup.bpstore.getItem(dbkey);
        let dam = data.detail_article_map;
        let articles = Object.keys(dam);

        for (let j=0; j< articles.length; j++) {
            // first check to see if this article is in the done list
            // if so skip it
            if ( doneArticleMap.has(articles[j]) ) { continue;}
            let articleCount = dam[articles[j]].total;
            // now add to map. dups expected
            doneArticleMap.set(articles[j], articleCount);
        }

        // get the UTW articles and their counts
        dbkey = "utw-"+bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        dam = data.detail_article_map;
        articles = Object.keys(dam);

        for (let j=0; j< articles.length; j++) {
            // first check to see if this article is in the done list
            // if so skip it
            if ( doneArticleMap.has(articles[j]) ) { continue;}
            let articleCount = dam[articles[j]].total;
            // now add to map
            doneArticleMap.set(articles[j], articleCount);
        }
    }
    setOpt (
        <div>
            <div>
                <Typography >
                Where the following books may be completed:
                </Typography>
                </div>
                <div>
                {booksDone.map(t => (
                    <Typography key={t}>{t}</Typography>
                ))}
            </div>
            <br/>
            <br/>
            <div>
                <Typography >
                The following books will be optimized:
                </Typography>
            </div>
            <div>
                {booksOpt.map(t => (
                    <Typography key={t}>{t}</Typography>
                ))}
            </div>
            <br/>
            <br/>
            <div>
                <Typography >
                Pre-Optimization Summary:
                </Typography>
                <div>
                {bklist.map(t => (
                    <Typography key={t}>
                        Book {t} has word count total of {bookCountTotalsPreOpt.get(t)}. <br/>
                        ... and a total word count of deduped articles (UTA, UTW) of {bookCountArticleTotalsPreOpt.get(t)}. <br/>
                    </Typography>
                ) )}
                </div>
            </div>
            <br/>
            <br/>
            <div>
                <Typography >
                Book Package Flow Optimization: <br/>
                (assumes constant velocity)
                </Typography>
                <div>
                {optBooks.map( (t,i) => (
                    <Typography key={t}>
                        Book Package {t} has word count total of {optCounts[i]}. <br/>
                    </Typography>
                ) )}
                </div>
            </div>
            <br/>
            <br/>
        </div>
    )
}




/*   



*/
