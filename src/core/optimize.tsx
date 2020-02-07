import React from 'react';
import Typography from '@material-ui/core/Typography';

export interface bpStateIF { [x: string]: boolean[]; };
  
const resourcePrefixes = ['uta-', 'utw-', 'ult-','ust-', 'utq-', 'utn-']

interface bookTotal { [bookId: string]: number}

export function optimize(state: bpStateIF ) {
    // extract the books in the package
    const books = Object.keys(state);
    // extract the books that are done first (if any)
    const booksDone = books.filter( function(book) { return state[book][0] } );
    // extract the books to be optimized
    const booksOpt  = books.filter( function(book) { return state[book][1] } );

    // count words in each book to be optimized and see which has least.
    let bookcounts: bookTotal[] = [];
    for (let bkid of booksOpt) {
        console.log("Working on:", bkid)
        for (let res of resourcePrefixes) {
            console.log(".. resource:",res)
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
        </div>
    )
}