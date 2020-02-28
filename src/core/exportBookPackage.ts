import * as dbsetup from 'book-package-rcl';
import * as books from './books';
import * as csv from './csvMaker';


export interface bpStateIF { [x: string]: boolean[]; };
export interface csvDataIF { [x: string]: string; };
  
const resourcePrefixes = ['uta-', 'utw-', 'ult-','ust-', 'utq-', 'utn-']

export async function exportBookPackage( state: bpStateIF ): Promise<any> {
    // extract the books in the package
    const allbooks = Object.keys(state);
    // extract the book package
    const bookpkg    = allbooks.filter( function(book) { return state[book][0] } );
    console.log("bookpkg:",bookpkg);
    let csvdata: string[][] = [];

    // count words in each book for summary
    let bookCountTotals = new Map<string,number>();
    let bookCountArticleTotals = new Map<string,number>();
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
                if ( bookCountArticleTotals.has(bkid) ) {
                    bookCountArticleTotals.set(bkid, bookCountArticleTotals.get(bkid) + rescount);
                } else {
                    bookCountArticleTotals.set(bkid,rescount)
                }
            };
            if ( bookCountTotals.has(bkid) ) {
                bookCountTotals.set(bkid, bookCountTotals.get(bkid) + rescount);
            } else {
                bookCountTotals.set(bkid,rescount);
            }
        }    
    }

    // Add summary to csv data
    let row: string[] = ['Summary of Book Package'];
    csv.addRow(csvdata,row);

    for ( let [k,v] of bookCountTotals.entries() ) {
        let n: string = "" + v.toLocaleString();
        row = [k,n];
        csv.addRow(csvdata,row);
    }

    // Download the CSV data
    // -- first, convert 2d array to CSV string
    let csvDownload = csv.toCSV(csvdata);
    return csvDownload;


    /*
        For the books marked as done, compute their word count contribution by:
        a. create a deduped list of all articles (UTA and UTW) with their counts
        b. compute the grand total of the articles
        c. Add to that the total word counts for UTQ, UTN, ULT, and UST
        d. This sum total will be the starting point for the book package flow.
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
    */

}
