import * as dbsetup from 'book-package-rcl';
import * as books from './books';
import * as csv from './csvMaker';

/*
    This export is per issue 15. The columns needed are:
    book,ult,ust,utn,utq,utw,uta

    where book is the id and the values are the (total) count
    per the resource type.

*/

export interface bpStateIF { [x: string]: boolean[]; };
export interface csvDataIF { [x: string]: string; };
  
export async function exportCounts( state: bpStateIF ): Promise<any> {
    // extract the books in the package
    const allbooks = Object.keys(state);
    // extract the book package
    const bookpkg = allbooks.filter( function(book) { return state[book][0] } );
    console.log("bookpkg:",bookpkg);
    let csvdata: string[][] = [];
    let row = ['book','ult','ust','utn','utq','utw','uta','obs'];
    csv.addRow(csvdata,row);

    let ult = "";
    let ust = "";
    let utn = "";
    let utq = "";
    let utw = "";
    let uta = "";
    let obs = "";
    for (let bk of bookpkg) {
        let bkid = books.bookIdByTitle(bk);
        // define vars for the columns vals
        let dbkey: string
        let data: any
        let rescount: number

        // get the count for the book resources
        if ( bkid !== 'obs' ) {
            dbkey = "ult-" + bkid;
            data = await dbsetup.bpstore.getItem(dbkey);
            rescount = data.total;
            ult = rescount.toLocaleString();
        }

        // get the count for the book resources
        if ( bkid !== 'obs' ) {
            dbkey = "ust-" + bkid;
            data = await dbsetup.bpstore.getItem(dbkey);
            rescount = data.total;
            ust = rescount.toLocaleString();
        }

        // get the count for the book resources
        dbkey = "utn-" + bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        rescount = data.total;
        utn = rescount.toLocaleString();

        // get the count for the book resources
        dbkey = "utq-" + bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        rescount = data.total;
        utq = rescount.toLocaleString();

        // get the count for the book resources
        dbkey = "utw-" + bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        rescount = data.grandTotalWordCount; // note diff!
        utw = rescount.toLocaleString();

        // get the count for the book resources
        dbkey = "uta-" + bkid;
        data = await dbsetup.bpstore.getItem(dbkey);
        rescount = data.grandTotalWordCount; // note diff!
        uta = rescount.toLocaleString();

        // for obs
        dbkey = "obs-obs";
        data = await dbsetup.bpstore.getItem(dbkey);
        rescount = data.total;
        obs = rescount.toLocaleString();

        row = [bkid,ult,ust,utn,utq,utw,uta,obs];
        csv.addRow(csvdata,row);
    }


    // Download the CSV data
    // -- first, convert 2d array to CSV string
    let csvDownload = csv.toCSV(csvdata);
    return csvDownload;
}
