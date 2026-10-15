import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookCard } from '../components/BookCard.jsx'
import { ErrorMessage, Loading } from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { booksApi, borrowingApi } from '../services/api.js'
import bookPlaceholder from '../assets/book-placeholder.svg'

export default function BookDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => {
    Promise.all([booksApi.get(id), booksApi.list()]).then(([detail, list]) => {
      setBook(detail)
      setRelated(list.filter((item) => item.category === detail.category && item.id !== detail.id).slice(0, 4))
    }).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [id])
  async function borrow() {
    if (!user) return navigate('/login')
    try { await borrowingApi.borrow(book.id); setNotice('Book borrowed! You can find it in My library.'); setBook({ ...book, availableCopies: book.availableCopies - 1 }) }
    catch (err) { setError(err.message) }
  }
  if (loading) return <div className="container page-shell"><Loading /></div>
  if (!book) return <div className="container page-shell"><ErrorMessage error={error || 'Book not found.'} /><Link to="/catalog">Back to the catalog</Link></div>
  return <div className="container page-shell">
    <Link className="back-link" to="/catalog"><i className="bi bi-arrow-left" /> Back to the collection</Link>
    <ErrorMessage error={error} />
    {notice && <div className="alert alert-success">{notice}</div>}
    <div className="book-detail row g-5 align-items-center mt-2">
      <div className="col-md-5 col-lg-4"><img className="detail-cover" src={book.coverImageUrl || bookPlaceholder} alt={`Cover of ${book.title}`} /></div>
      <div className="col-md-7 col-lg-8"><span className="eyebrow dark">{book.category}</span><h1 className="display-title">{book.title}</h1><p className="detail-author">by {book.author}</p><p className="detail-description">{book.description || 'A wonderful addition to our library collection.'}</p><div className="book-meta"><span><i className="bi bi-upc-scan" /> ISBN {book.isbn || 'Not provided'}</span><span><i className="bi bi-stack" /> {book.availableCopies} of {book.totalCopies} available</span></div><button className="btn btn-primary btn-lg rounded-pill px-4 mt-4" disabled={!book.availableCopies} onClick={borrow}>{book.availableCopies ? 'Borrow this book' : 'Currently checked out'} <i className="bi bi-arrow-right ms-2" /></button></div>
    </div>
    {related.length > 0 && <section className="mt-5 pt-4"><div className="section-heading"><h2>You might also like</h2></div><div className="row g-4">{related.map((item) => <div className="col-6 col-lg-3" key={item.id}><BookCard book={item} /></div>)}</div></section>}
  </div>
}
