import data from './books.json';

export interface bookDataIF {
  "id": string;
  "title": string;
  "usfm": string;
  "testament": string;
  "verseCount": number;
  "chapters": number[];
}

export const chaptersInBook = (bookId: string) => {
    let chapters: number[];
    chapters = bookData(bookId).chapters;
    if ( chapters === undefined ) {
      throw new Error("Error: chaptersInBook(): Invalid bookId");
    }
    return chapters;
};

export const versesInChapter = (bookId: string, chapter: number) => {
  const verses = chaptersInBook(bookId)[chapter - 1];
  return verses;
};

export const bookData = (bookId: string) => {
  const _bookData: bookDataIF = data.filter(row => row.id === bookId)[0];
  return _bookData;
};

export const testament = (bookId: string) => {
  const _testament = bookData(bookId).testament;
  return _testament;
};

export const bookDataTitles = () => {
  let list: string[] = [];
  for (let i=0; i < data.length; i++) {
      list.push( data[i].title )
  }
  return list;
}

export const titlesToBoolean = () => {
  let ob: {[title: string]: boolean[] } = {};
  let list = bookDataTitles();
  list.forEach((v,k) => {ob[v]= [false,false]});
  return ob;
}

export const bookIdByTitle = (title: string) => {
  for (let i=0; i < data.length; i++) {
    if ( data[i].title === title ) {
      return data[i].id;
    }
  }
  return "";
}