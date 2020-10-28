import * as dbsetup from 'book-package-rcl';
import * as books from './books';
import * as csv from './csvMaker';


export interface bpStateIF { [x: string]: boolean[]; };
export interface csvDataIF { [x: string]: string; };
  
const resourcePrefixes = ['uta-', 'utw-', 'ult-','ust-', 'utq-', 'utn-', 'obs-']

export async function exportBookPackage( state: bpStateIF ): Promise<any> {
    // extract the books in the package
    const allbooks = Object.keys(state);
    // extract the book package
    const bookpkg    = allbooks.filter( function(book) { return state[book][0] } );
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
            if ( data === null ) continue; // skip missing data
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

    let grandTotal = 0;
    for ( let [k,v] of bookCountTotals.entries() ) {
        grandTotal = grandTotal + v;
        let n: string = "" + v.toLocaleString();
        row = [books.bookTitleById(k),n];
        csv.addRow(csvdata,row);
    }

    // Add empty row
    csv.addRow(csvdata,[''])

    // Add details to csv data
    // use holding table so summary data comes first
    let csvdetails: string[][] = [];

    row = ['Book Package Details']
    csv.addRow(csvdetails,row);

    row = ['Resource Type','Book','Word Count']
    csv.addRow(csvdetails,row);

    // get the UTQ, UTN, ULT, UST for each book
    let utqTotal = 0;
    let utnTotal = 0;
    let obsTotal = 0;
    let ultTotal = 0;
    let ustTotal = 0;
    for (let bk of bookpkg) {
        let bkid = books.bookIdByTitle(bk);

        let dbkey = "utq-"+bkid;
        let data  = await dbsetup.bpstore.getItem(dbkey);
        row = ['UTQ',bk,data.total.toLocaleString()];
        csv.addRow(csvdetails,row);
        utqTotal = utqTotal + data.total;

        dbkey = "utn-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        row = ['UTN',bk,data.total.toLocaleString()];
        csv.addRow(csvdetails,row);
        utnTotal = utnTotal + data.total;

        // skip OBS -- they don't have ult/ust
        if ( bkid === 'obs' ) {
            dbkey = "obs-obs";
            data  = await dbsetup.bpstore.getItem(dbkey);
            row = ['OBS',bk,data.total.toLocaleString()];
            csv.addRow(csvdetails,row);
            obsTotal = obsTotal + data.total;
            continue; // skip ULT and UST for OBS
        }

        dbkey = "ult-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        row = ['ULT',bk,data.total.toLocaleString()];
        csv.addRow(csvdetails,row);
        ultTotal = ultTotal + data.total;

        dbkey = "ust-"+bkid;
        data  = await dbsetup.bpstore.getItem(dbkey);
        row = ['UST',bk,data.total.toLocaleString()];
        csv.addRow(csvdetails,row);
        ustTotal = ustTotal + data.total;
    }

    // Add empty row
    csv.addRow(csvdetails,[''])

    row = ['Resource Type','Book','Article','Word Count']
    csv.addRow(csvdetails,row);

    // get the UTA and UTW for book package
    let utaTotal = 0;
    let utwTotal = 0;
    let utaTracker: string[] = [];
    let utwTracker: string[] = [];
    for (let bk of bookpkg) {
        let bkid = books.bookIdByTitle(bk);

        // get the UTW articles and their counts
        let dbkey = "utw-"+bkid;
        let data = await dbsetup.bpstore.getItem(dbkey);
        let dam = data.detail_article_map;
        let articles = Object.keys(dam);
        for (let j=0; j< articles.length; j++) {
            let articleCount = dam[articles[j]].total;
            row = ['UTW',bk,articles[j],""+articleCount.toLocaleString()];
            csv.addRow(csvdetails,row);
            if ( ! utwTracker.includes(articles[j]) ) {
                utwTotal = utwTotal + articleCount;
                utwTracker.push(articles[j]);
            }
        }

        // skip if OBS
        if ( bkid === 'obs' ) continue;

        dbkey = "uta-"+bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        dam = data.detail_article_map;
        articles = Object.keys(dam);
        for (let j=0; j< articles.length; j++) {
            let articleCount = dam[articles[j]].total;
            row = ['UTA',bk,articles[j],""+articleCount.toLocaleString()];
            csv.addRow(csvdetails,row);
            if ( ! utaTracker.includes(articles[j]) ) {
                utaTotal = utaTotal + articleCount;
                utaTracker.push(articles[j]);
            }
        }

    }

    // Add empty row
    csv.addRow(csvdetails,[''])

    // Get list of errors, if any
    row = ['Book Package Errors']
    csv.addRow(csvdetails,row);

    const sufkey = '-errors';
    for (let bk of bookpkg) {
        let bkid = books.bookIdByTitle(bk);
        for (let res of resourcePrefixes) {
            let dbkey = res+bkid+sufkey;
            let data: string[]  = await dbsetup.bpstore.getItem(dbkey);
            if ( data === null ) { continue }
            let dedupList: string[] = [...new Set(data)]
            for ( let i=0; i < dedupList.length; i++ ) {
                row = [dedupList[i]]
                csv.addRow(csvdetails,row);
            }
        }
    }

    // now add summary data by resource types
    csv.addRow(csvdata, ['Resource Subtotals'])
    csv.addRow(csvdata, ['ULT',ultTotal.toLocaleString()])
    csv.addRow(csvdata, ['UST',ustTotal.toLocaleString()])
    csv.addRow(csvdata, ['UTA',utaTotal.toLocaleString()])
    csv.addRow(csvdata, ['UTW',utwTotal.toLocaleString()])
    csv.addRow(csvdata, ['UTN',utnTotal.toLocaleString()])
    csv.addRow(csvdata, ['UTQ',utqTotal.toLocaleString()])
    csv.addRow(csvdata, ['OBS',obsTotal.toLocaleString()])
    // Add empty row
    csv.addRow(csvdata,[''])

    // now add the details
    for ( let i=0; i < csvdetails.length; i++ ) {
        csv.addRow(csvdata, csvdetails[i]);
    }

    // Download the CSV data
    // -- first, convert 2d array to CSV string
    let csvDownload = csv.toCSV(csvdata);
    return csvDownload;


}
