const express = require('express');
const { randomUUID } = require('node:crypto');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Temporary in-memory database
let books = [
  {
    id: randomUUID(),
    title: '1984',
    author: 'George Orwell',
    publicationYear: 1949
  },
  {
    id: randomUUID(),
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    publicationYear: 1813
  },
  {
    id: randomUUID(),
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    publicationYear: 1954
  }
];

// Validate book information
function isValidBook(book) {
  return typeof book.title === 'string' &&
    book.title.trim().length > 0 &&
    typeof book.author === 'string' &&
    book.author.trim().length > 0 &&
    (book.publicationYear == null ||
      (Number.isInteger(book.publicationYear) &&
       book.publicationYear > 0));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET all books
app.get('/api/books', (_req, res) => {
  res.json(books);
});

// GET book by ID
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  res.json(book);
});

// POST create book
app.post('/api/books', (req, res) => {
  const { title, author, publicationYear = null } =
    req.body ?? {};

  const newBook = {
    id: randomUUID(),
    title,
    author,
    publicationYear
  };

  if (!isValidBook(newBook)) {
    return res.status(400).json({
      message: 'Invalid book data'
    });
  }

  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT replace book
app.put('/api/books/:id', (req, res) => {
  const index = books.findIndex(
    b => b.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  const { title, author, publicationYear = null } =
    req.body ?? {};

  const updated = {
    id: req.params.id,
    title,
    author,
    publicationYear
  };

  if (!isValidBook(updated)) {
    return res.status(400).json({
      message: 'Invalid book data'
    });
  }

  books[index] = updated;
  res.json(updated);
});

// PATCH partially update book
app.patch('/api/books/:id', (req, res) => {
  const book = books.find(
    b => b.id === req.params.id
  );

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  const changes = req.body ?? {};
  const allowed = [
    'title',
    'author',
    'publicationYear'
  ];

  if (
    typeof changes !== 'object' ||
    Array.isArray(changes) ||
    !Object.keys(changes).length ||
    Object.keys(changes).some(
      key => !allowed.includes(key)
    )
  ) {
    return res.status(400).json({
      message: 'Invalid update fields'
    });
  }

  const updated = { ...book, ...changes };

  if (!isValidBook(updated)) {
    return res.status(400).json({
      message: 'Invalid book data'
    });
  }

  books[books.indexOf(book)] = updated;
  res.json(updated);
});

// DELETE book
app.delete('/api/books/:id', (req, res) => {
  const index = books.findIndex(
    b => b.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  books.splice(index, 1);
  res.status(204).send();
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `API running at http://localhost:${PORT}`
  );
});
