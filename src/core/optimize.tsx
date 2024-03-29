import React from 'react';
import Typography from '@material-ui/core/Typography';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Link } from '@material-ui/core';

import * as dbsetup from 'book-package-rcl';
import * as books from './books';
import * as csv from './csvMaker';


export interface bpStateIF { [x: string]: boolean[]; };
interface ObjectLiteral {
    [key: string]: any;
} 

  
const resourcePrefixes = ['uta-', 'utw-', 'ult-','ust-', 'utq-', 'utn-', 'obs-']

function convertUtaToLink(lnk: string) {
    const path = 'https://git.door43.org/unfoldingWord/en_ta/src/branch/master/translate/';
    return path+lnk;
}

export function convertUtwToLink(lnk: string) {
    const path = 'https://git.door43.org/unfoldingWord/en_tw/src/branch/master';
    let s;
    s = lnk;
    s = s.replace(/^rc.*dict(\/.*$)/, path+'$1.md');
    return s;
}


export async function optimize(state: bpStateIF, setOpt: React.Dispatch<React.SetStateAction<JSX.Element>> ) {

    setOpt(<CircularProgress/>);
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

    // In case the user wants to export the optimized flow to a spreadsheet (CSV)
    // the data is collected during the optimization. Don't want to do the 
    // optimization twice!!
    // Therefore, collect it and store in indexedDB
    let csvdata: string[][] = [];
    // add export headers for completed packages section
    //csv.addRow(csvdata, ['All Packages']);

    // keep track of the word counts for each article uta or utw
    let articleCount = new Map<string,number>();

    // count words in each book for pre-optimization summary
    let bookCountTotalsPreOpt = new Map<string,number>();
    let bookCountArticleTotalsPreOpt = new Map<string,number>();
    let bklist: string[] = [];
    // add export headers for completed book packages
    //csv.addRow(csvdata,['Book', 'Id', 'Resource', 'Word Count', 'Title']);
    for (let bk of bookpkg) {
        let bkid = books.bookIdByTitle(bk);
        bklist.push(bkid);
        for (let res of resourcePrefixes) {
            if ( bkid === 'obs' ) {
                if (res === 'ult-' || res === 'ust-' ) {
                    continue; // these resources are not present for OBS
                }
            }
            if ( res === 'obs-' ) {
                // if resource is obs, then the only "book" is (also) obs
                if ( bkid !== 'obs' ) continue;
            }
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
            // get the detailed article map and store counts for later
            if ( res === 'uta-' || res === 'utw-' ) {
                const allArticles = Object.keys(data.detail_article_map);
                for (let articlename of allArticles) {
                    if ( ! articleCount.has(articlename) ) {
                        let articleWordCount = data.detail_article_map[articlename].total;
                        articleCount.set(articlename, articleWordCount );
                        //csv.addRow(csvdata,[bk, bkid, res.slice(0, -1), articleWordCount.toLocaleString(), articlename]);
                    }
                }
            } else {
                //csv.addRow(csvdata, [bk, bkid, res.slice(0, -1), rescount.toLocaleString()]);
            }
        }    
    }
    console.log("Pre-optimization computations done");

    /*
        For the books marked as done, compute their word count contribution by:
        a. create a deduped list of all articles (UTA and UTW) with their counts
        b. compute the grand total of the articles
        c. Add to that the total word counts for UTQ, UTN, ULT, and UST
        d. This sum total will be the starting point for the book package flow.
    */
    //csv.addRow(csvdata, [""]);
    csv.addRow(csvdata, ['Completed Packages']);
    csv.addRow(csvdata,['Book','BookId','Resource','Word Count','Title'])

    let doneGrandTotal = 0;
    let utaGrandTotal = 0;
    let utwGrandTotal = 0;
    let doneArticleMap = new Map<string,number>();
    for (let i=0; i < booksDone.length; i++) {
        let bkid = books.bookIdByTitle(booksDone[i]);

        // get the UTW articles and their counts
        let dbkey = "utw-"+bkid;
        let data = await dbsetup.bpstore.getItem(dbkey);
        let dam = data.detail_article_map;
        let articles = Object.keys(dam);
        for (let j=0; j< articles.length; j++) {
            let articleCount = dam[articles[j]].total;
            // now add to map. dups expected
            if ( ! doneArticleMap.has(articles[j])) {
                doneArticleMap.set(articles[j], articleCount);
                csv.addRow(csvdata,[booksDone[i], bkid, 'utw', articleCount.toLocaleString(), articles[j]])
                utwGrandTotal = utwGrandTotal + articleCount;
            }
        }

        // get the UTA articles and their counts
        //if ( bkid === 'obs' ) continue; // not used in OBS
        dbkey = "uta-"+bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        dam = data.detail_article_map;
        articles = Object.keys(dam);
        for (let j=0; j< articles.length; j++) {
            let articleCount = dam[articles[j]].total;
            // now add to map. dups expected
            if ( ! doneArticleMap.has(articles[j])) {
                doneArticleMap.set(articles[j], articleCount);
                csv.addRow(csvdata,[booksDone[i], bkid, 'uta', articleCount.toLocaleString(), articles[j]]);
                utaGrandTotal = utaGrandTotal + articleCount;
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
        csv.addRow(csvdata,[booksDone[i],bkid,'utq',resourceTotal.toLocaleString()])
        doneGrandTotal = doneGrandTotal + resourceTotal;
        dbkey = "utn-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        resourceTotal = data.total;
        csv.addRow(csvdata,[booksDone[i],bkid,'utn',resourceTotal.toLocaleString()])
        doneGrandTotal = doneGrandTotal + resourceTotal;
        if ( bkid !== 'obs') {
            dbkey = "ult-"+bkid;
            data  = await dbsetup.bpstore.getItem(dbkey);
            resourceTotal = data.total;
            csv.addRow(csvdata,[booksDone[i],bkid,'ult',resourceTotal.toLocaleString()])
            doneGrandTotal = doneGrandTotal + resourceTotal;
            dbkey = "ust-"+bkid;
            data  = await dbsetup.bpstore.getItem(dbkey);
            resourceTotal = data.total;
            csv.addRow(csvdata,[booksDone[i],bkid,'ust',resourceTotal.toLocaleString()])
            doneGrandTotal = doneGrandTotal + resourceTotal;
        }
    }
    console.log("Done grand total is:", doneGrandTotal);
    if ( doneGrandTotal === 0 ) {
        csv.addRow(csvdata, ['None specified'])
    } else {
        csv.addRow(csvdata, [""]);
        csv.addRow(csvdata, ['UTA Grand Total:', utaGrandTotal.toLocaleString()]);
        csv.addRow(csvdata, ['UTW Grand Total:', utwGrandTotal.toLocaleString()]);
        csv.addRow(csvdata, ['Grand Total of Articles', (utaGrandTotal+utwGrandTotal).toLocaleString()])
        csv.addRow(csvdata,['Grand Total:',doneGrandTotal.toLocaleString()]);
    }

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
    interface ObjectLiteral {
        [key: string]: any;
    }    
    let round:number = 0;
    let optBooks: string[] = [];
    let optCounts: number[] = [];
    let optUtaMap = new Map<string,string[]>();
    let optUtwMap = new Map<string,string[]>();
    let refmapUta: ObjectLiteral = { };
    let refmapUtw: ObjectLiteral = { };
    

    for (let n=0; n < booksOpt.length; n++ ) {
        round++;
        // blank row
        csv.addRow(csvdata, [""]);
        csv.addRow(csvdata,['Round '+round]);
        csv.addRow(csvdata,['Book', 'BookId', 'Resource', 'Word Count', 'Title']);
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
            let articles: string[] = [];
            let dbkey = "";
            let data: ObjectLiteral = {};
            let dam: ObjectLiteral = {};
            let optArticleMap = new Map<string,number>();
            let bkid = books.bookIdByTitle(booksOpt[i]);
            dbkey = "uta-"+bkid;
            data = await dbsetup.bpstore.getItem(dbkey);
            dam = data.detail_article_map;
            articles = Object.keys(dam);

            // dedup the articles for this book
            // using the article map below

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
            if ( bkid === 'obs' ) {
                dbkey = "obs-"+bkid;
                data  = await dbsetup.bpstore.getItem(dbkey);
                optBookTotal = optBookTotal + data.total;
            } else {
                dbkey = "ult-"+bkid;
                data  = await dbsetup.bpstore.getItem(dbkey);
                optBookTotal = optBookTotal + data.total;
                dbkey = "ust-"+bkid;
                data  = await dbsetup.bpstore.getItem(dbkey);
                optBookTotal = optBookTotal + data.total;
            }
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

        // add round winner to optimized export data
        // get the utq data for the winner
        let bkid = books.bookIdByTitle(roundWinnerBook);
        let dbkey = "utq-"+bkid;
        let data  = await dbsetup.bpstore.getItem(dbkey);
        csv.addRow(csvdata,[roundWinnerBook, bkid, 'utq', data.total.toLocaleString(), ""]);
        
        // get the utn data for the winner
        bkid = books.bookIdByTitle(roundWinnerBook);
        dbkey = "utn-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        csv.addRow(csvdata,[roundWinnerBook, bkid, 'utn', data.total.toLocaleString(), ""]);

        // get the ult, ust data for the winner if not OBS
        bkid = books.bookIdByTitle(roundWinnerBook);
        if ( bkid === 'obs' ) {
            dbkey = "obs-"+bkid;
            data  = await dbsetup.bpstore.getItem(dbkey);
            csv.addRow(csvdata,[roundWinnerBook, bkid, 'obs', data.total.toLocaleString(), ""]);
        } else {
            dbkey = "ult-"+bkid;
            data  = await dbsetup.bpstore.getItem(dbkey);
            csv.addRow(csvdata,[roundWinnerBook, bkid, 'ult', data.total.toLocaleString(), ""]);
            dbkey = "ust-"+bkid;
            data  = await dbsetup.bpstore.getItem(dbkey);
            csv.addRow(csvdata,[roundWinnerBook, bkid, 'ust', data.total.toLocaleString(), ""]);
        }

        /* ------------------------------------------------------------

            Now add the winner's UTA and UTW articles to the done list
            these will not be done again in subsequent rounds

        */
        let winnerUtaTotal = 0;
        let winnerUtwTotal = 0;

        dbkey = "uta-"+bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        let dam = data.detail_article_map;
        refmapUta = data.summary_ref_map;
        let articles = Object.keys(dam);
        let optUta: string[] = [];

        for (let j=0; j< articles.length; j++) {
            // first check to see if this article is in the done list
            // if so skip it
            if ( doneArticleMap.has(articles[j]) ) { continue;}
            optUta.push(articles[j] );
            let articleCount = dam[articles[j]].total;
            // now add to map. dups expected
            doneArticleMap.set(articles[j], articleCount);
            csv.addRow(csvdata,[roundWinnerBook, bkid, 'uta', articleCount.toLocaleString(), articles[j]]);
            winnerUtaTotal = winnerUtaTotal + articleCount;
        }
        optUtaMap.set(roundWinnerBook,optUta);

        // get the UTW articles and their counts
        dbkey = "utw-"+bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        dam = data.detail_article_map;
        refmapUtw = data.summary_ref_map;
        articles = Object.keys(dam);
        let optUtw: string[] = [];

        for (let j=0; j< articles.length; j++) {
            // first check to see if this article is in the done list
            // if so skip it
            if ( doneArticleMap.has(articles[j]) ) { continue;}
            optUtw.push(articles[j] );
            let articleCount = dam[articles[j]].total;
            // now add to map
            doneArticleMap.set(articles[j], articleCount);
            csv.addRow(csvdata,[roundWinnerBook, bkid, 'utw', articleCount.toLocaleString(), articles[j]]);
            winnerUtwTotal = winnerUtwTotal + articleCount;
        }
        optUtwMap.set(roundWinnerBook,optUtw);
        // blank row to csv and show uta and utw total for round
        csv.addRow(csvdata,['']);
        // total for uta to csv
        csv.addRow(csvdata,['Round '+round+' UTA:', winnerUtaTotal.toLocaleString()])
        // total for utw to csv
        csv.addRow(csvdata,['Round '+round+' UTW:', winnerUtwTotal.toLocaleString()])
        // Round x total
        csv.addRow(csvdata,['Round '+round+' Total:', roundWinnerCount.toLocaleString()])
    }
    await dbsetup.bpstore.setItem('optimized-csv-data',csv.toCSV(csvdata));
    setOpt (
        <div>
            <br/>
            <br/>
            <div>
                <Typography >
                If these book packages are completed:
                </Typography>
                </div>
                <div>
                <ul>
                {booksDone.map(t => (
                    <li>
                        <Typography key={t}>
                            {t} (Book Package Word Count: {bookCountTotalsPreOpt.get(books.bookIdByTitle(t))?.toLocaleString()})
                        </Typography>
                    </li>
                ))}
                </ul>
            </div>
            <br/>
            <br/>
            <div>
                <Typography >
                Then proceed in this order:
                </Typography>
                <div>

                <ol>
                {optBooks.map( (t,i) => (
                    <li>
                        <Typography key={t}>
                        {t} - Adjusted Book Package Word Count: {optCounts[i].toLocaleString()}
                        </Typography>
                        <TreeView
                            defaultCollapseIcon={<ExpandMoreIcon />}
                            defaultExpandIcon={<ChevronRightIcon />}
                        >
                            <TreeItem nodeId="1" label='Unique UTA modules'>
                                <ul>
                                {optUtaMap.get(t)?.map( uta => ( 
                                    <li>
                                        <Typography>
                                            <Link href={convertUtaToLink(uta)} target="_blank" rel="noopener" >
                                            {uta}
                                            </Link>
                                            &nbsp;&nbsp;(Word Count: {articleCount.get(uta)})
                                            &nbsp;&nbsp;(References: {refmapUta[uta]})
                                        </Typography>                    
                                    </li>
                                ))}
                                </ul>
                            </TreeItem>
                        </TreeView>

                        <TreeView
                            defaultCollapseIcon={<ExpandMoreIcon />}
                            defaultExpandIcon={<ChevronRightIcon />}
                        >
                            <TreeItem nodeId="1" label='Unique UTW modules'>
                                <ul>
                                {optUtwMap.get(t)?.map( utw => ( 
                                    <li>
                                    <Typography>
                                        <Link href={convertUtwToLink(utw)} target="_blank" rel="noopener" >
                                        {utw} 
                                        </Link>
                                        &nbsp;&nbsp;(Word Count: {articleCount.get(utw)})
                                        &nbsp;&nbsp;(References: {refmapUtw[utw]})
                                    </Typography>                    
                                    </li>
                                ))}
                                </ul>
                                </TreeItem>
                        </TreeView>

                    </li>
                ) )}
                </ol>
                </div>
            </div>
            <br/>
            <br/>
        </div>
    )
}

