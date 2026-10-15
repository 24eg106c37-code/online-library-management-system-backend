import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookCard } from '../components/BookCard.jsx'
import { ErrorMessage, Loading, PageShell } from '../components/Layout.jsx'
import { booksApi } from '../services/api.js'

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const query = params.get('query') || ''
  const category = params.get('category') || ''
  useEffect(() => {
    booksApi.list().then((data) => setCategories([...new Set(data.map((book) => book.category).filter(Boolean))].sort()))
      .catch((err) => setError(err.message))
  }, [])
  useEffect(() => {
    setLoading(true)
    booksApi.list({ ...(query && { query }), ...(category && { category }) })
      .then(setBooks)
      .catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [query, category])
  function updateParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next)
  }
  return <PageShell title="Find your next favorite." subtitle="Browse the shelves, follow a curiosity, and find a book that feels like yours.">
    <div className="filter-bar">
      <label className="search-field"><i className="bi bi-search" /><input className="form-control" value={query} onChange={(event) => updateParam('query', event.target.value)} placeholder="Search by title or author" aria-label="Search books" /></label>
      <select className="form-select category-select" value={category} onChange={(event) => updateParam('category', event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
    </div>
    <ErrorMessage error={error} />
    {loading ? <Loading label="Finding your next read…" /> : books.length ? <><p className="results-count">{books.length} {books.length === 1 ? 'book' : 'books'} on the shelf</p><div className="row g-4">{books.map((book) => <div className="col-6 col-md-4 col-lg-3" key={book.id}><BookCard book={book} /></div>)}</div></> : <div className="empty-state"><i className="bi bi-search" /><h3>No books found</h3><p>Try a different title, author, or category.</p><button className="btn btn-outline-primary rounded-pill" onClick={() => setParams({})}>Clear filters</button></div>}
  </PageShell>
}
