import data from './books.json';

export const chaptersInBook = (bookId) => {
  try {
    let chapters;
    if (bookId === 'obs') {
      chapters = [...Array(50).keys()].map(i=>i+1);
    } else {
      chapters = bookData(bookId).chapters;
    }
    return chapters;
  } catch(error) {
    return null;
  }
};

export const versesInChapter = ({bookId, chapter}) => {
  const verses = chaptersInBook({bookId})[chapter - 1];
  return verses;
};

export const bookData = (bookId) => {
  const _bookData = data.filter(row => row.id === bookId)[0];
  return _bookData;
};

export const testament = (bookId) => {
  const _testament = bookData(bookId).testament;
  return _testament;
};

export const validateBookId = (reference) => {
  let valid;
  if (reference.bookId === 'obs') {
    valid = true;
  } else if (reference.bookId && !!bookData(reference.bookId)) {
    valid = true;
  }
  return valid;
}

export const validateChapter = (reference) => {
  const dependencies = ( validateBookId(reference) );
  const chapters = chaptersInBook(reference.bookId);
  const chapterCount = chapters.length;
  const inRange = (chapterCount && reference.chapter <= chapterCount);

  const valid = (dependencies && inRange);
  return valid;
}

export const validateVerse = (reference) => {
  const dependencies = (validateBookId(reference) && validateChapter(reference));
  const chapters = chaptersInBook(reference.bookId);
  const verseCount = chapters[reference.chapter-1];
  const inRange = (verseCount && reference.verse <= verseCount);
  return (dependencies && inRange);
};

export const validateReference = (reference) => {
  const validBookId = validateBookId(reference);
  if ( !validBookId ) return false;
  const validChapter = validateChapter(reference);
  if ( !validChapter ) return false;
  const validVerse = (!!reference.verse) ? validateVerse(reference) : true;
  if ( !validVerse ) return false
  return true;
};
