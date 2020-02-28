// CSV Package


export function addRow( csvdata: string[][], csvrow: string[]) {
    // Rules below are a relaxed version of 
    // https://tools.ietf.org/html/rfc4180 
    // Specifically, no checks are made to ensure that all rows
    // have the same number of columns.

    // This function add a new row of strings to an existing 2D array.

    // Rules:
    // 1. if a cell contains a quote, then the quote must doubled (rfc4180#7)
    // 2. if a cell contains commas, quotes, or line breaks, then the string must quoted (rfc4180#6)
    //    a line break will mean a carriage return (CR) or line feed (LF)

    for (let i=0; i < csvrow.length; i++) {
        let cell = csvrow[i];
        if ( cell.includes('"') ) {
            // double the quotes
            cell = cell.replace(/"/g,'""');
        }
        if ( cell.includes('"') ) {
            cell = '"' + cell + '"';
        } else if ( cell.includes('\n') ) {
            cell = '"' + cell + '"';
        } else if ( cell.includes('\r') ) {
            cell = '"' + cell + '"';
        } else if ( cell.includes(',') ) {
            cell = '"' + cell + '"';
        }
        // replace value
        csvrow[i] = cell;
    }
    // push new row onto csv data
    csvdata.push(csvrow);
}

export function toCSV( csvdata: string[][] ) : string {
    // Rules below are a relaxed version of 
    // https://tools.ietf.org/html/rfc4180 
    // Specifically, no checks are made to ensure that all rows
    // have the same number of columns.

    // This function combines all the rows into a single string
    // suitable for downloading or importing into a spreadsheet

    // Rules:
    // 1. join cells in a row with a comma (rfc4180#4); 
    //    no comma after last cell
    // 2. join rows with a \r\n (CRLF) (rfc4180#1)
    //    use CRLF after last row


    let data = "";

    for ( let i=0; i < csvdata.length; i++ ) {
        let row = csvdata[i];
        data = data + row.join(',') + '\r\n';
    }
    return data;
}