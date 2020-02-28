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
    let row: string[] = ['Book Package Summary'];
    csv.addRow(csvdata,row);

    row = ['Book','Word Count'];
    csv.addRow(csvdata,row);

    for ( let [k,v] of bookCountTotals.entries() ) {
        let n: string = "" + v.toLocaleString();
        row = [books.bookTitleById(k),n];
        csv.addRow(csvdata,row);
    }

    // Add empty row
    csv.addRow(csvdata,[''])

    // Add details to csv data
    row = ['Book Package Details']
    csv.addRow(csvdata,row);

    row = ['Resource Type','Book','Word Count']
    csv.addRow(csvdata,row);

    // get the UTQ, UTN, ULT, UST for each book
    for (let bk of bookpkg) {
        let bkid = books.bookIdByTitle(bk);

        let dbkey = "utq-"+bkid;
        let data  = await dbsetup.bpstore.getItem(dbkey);
        row = ['UTQ',bk,data.total.toLocaleString()];
        csv.addRow(csvdata,row);

        dbkey = "utn-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        row = ['UTN',bk,data.total.toLocaleString()];
        csv.addRow(csvdata,row);

        dbkey = "ult-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        row = ['ULT',bk,data.total.toLocaleString()];
        csv.addRow(csvdata,row);

        dbkey = "ust-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        row = ['UST',bk,data.total.toLocaleString()];
        csv.addRow(csvdata,row);
    }

    // Add empty row
    csv.addRow(csvdata,[''])

    row = ['Resource Type','Book','Article','Word Count']
    csv.addRow(csvdata,row);

    // get the UTA and UTW for book package
    for (let bk of bookpkg) {
        let bkid = books.bookIdByTitle(bk);

        let dbkey = "uta-"+bkid;
        let data = await dbsetup.bpstore.getItem(dbkey);
        let dam = data.detail_article_map;
        let articles = Object.keys(dam);
        for (let j=0; j< articles.length; j++) {
            let articleCount = dam[articles[j]].total;
            row = ['UTA',bk,articles[j],articleCount.toLocaleString()];
            csv.addRow(csvdata,row);
        }

        // get the UTW articles and their counts
        dbkey = "utw-"+bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        dam = data.detail_article_map;
        articles = Object.keys(dam);
        for (let j=0; j< articles.length; j++) {
            let articleCount = dam[articles[j]].total;
            row = ['UTW',bk,articles[j],articleCount.toLocaleString()];
            csv.addRow(csvdata,row);
        }
    }

   
    // Download the CSV data
    // -- first, convert 2d array to CSV string
    let csvDownload = csv.toCSV(csvdata);
    return csvDownload;


}
