import React from 'react';
import Typography from '@material-ui/core/Typography';
import * as dbsetup from 'book-package-rcl';
import * as books from './books';

export interface bpStateIF { [x: string]: boolean[]; };
  
const resourcePrefixes = ['uta-', 'utw-', 'ult-','ust-', 'utq-', 'utn-']

export async function optimize(state: bpStateIF ) {
    // extract the books in the package
    const allbooks = Object.keys(state);
    // extract the books that are done first (if any)
    const booksDone = allbooks.filter( function(book) { return state[book][0] } );
    console.log("booksDone:",booksDone);
    // extract the books to be optimized
    const booksOpt  = allbooks.filter( function(book) { return state[book][1] } );
    console.log("booksOpt:",booksOpt);
    // books in package
    const bookpkg: string[] = booksDone;
    bookpkg.push(...booksOpt);

    // count words in each book to be optimized and see which has least.
    let bookcounts = new Map<string,number>();
    let bklist: string[] = [];
    for (let bk of bookpkg) {
        let bkid = books.bookIdByTitle(bk);
        bklist.push(bkid);
        for (let res of resourcePrefixes) {
            let dbkey = res+bkid;
            let data = await dbsetup.bpstore.getItem(dbkey);
            let rescount = data.total;
            if ( rescount === undefined ) {rescount = data.grandTotalWordCount};
            if ( bookcounts.has(bkid) ) {
                bookcounts.set(bkid, bookcounts.get(bkid) + rescount);
            } else {
                bookcounts.set(bkid,rescount);
            }
        }    
    }

    return (
        <div>
            <div>
                <Typography >
                Now we *optimize* the Book Package Flow. <br />
                The following books will be optimized:
                </Typography>
            </div>
            <div>
                {booksOpt.map(t => (
                    <Typography>{t}</Typography>
                ))}
            </div>

            <div>
                <Typography >
                Where the following books may be completed:
                </Typography>
                </div>
                <div>
                {booksDone.map(t => (
                    <Typography>{t}</Typography>
                ))}
            </div>

            <div>
                {bklist.map(t => (
                    <Typography>Book {t} has word total of {bookcounts.get(t)}</Typography>
                ) )}
            </div>

            <div>
                <Typography >
                Note that counts above do NOT sum to the book package total since UTA and UTW are not deduped.
                </Typography>
            </div>

        </div>
    )
}
