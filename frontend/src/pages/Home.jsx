import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { booksApi } from '../services/api.js'
import { BookCard } from '../components/BookCard.jsx'
import { ErrorMessage, Loading } from '../components/Layout.jsx'

export default function Home() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    booksApi.list().then((data) => setBooks(data.slice(0, 4))).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [])
  const categories = [
    ['bi-stars', 'Fiction', 'Stories to get wonderfully lost in'],
    ['bi-lightbulb', 'Technology', 'Ideas shaping tomorrow'],
    ['bi-compass', 'History', 'Understand the world before us'],
    ['bi-heart', 'Personal growth', 'Inspiration for your next chapter'],
  ]
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="eyebrow"><span /> YOUR NEXT CHAPTER STARTS HERE</span>
            <h1>Good books.<br /><em>Better</em> days.</h1>
            <p>Find your next favorite, borrow it in a few clicks, and let a good story take you somewhere new.</p>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <Link className="btn btn-primary btn-lg rounded-pill px-4" to="/catalog">Explore the collection <i className="bi bi-arrow-right ms-2" /></Link>
              <Link className="btn btn-outline-light btn-lg rounded-pill px-4" to="/register">Become a member</Link>
            </div>
            <div className="hero-note mt-5"><i className="bi bi-people" /><span>A welcoming community of readers, learners, and dreamers.</span></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-sun" />
            <div className="hero-book book-back"><span>THE ART OF<br />SLOW LIVING</span></div>
            <div className="hero-book book-front"><small>A JOURNEY THROUGH</small><strong>WILD<br />PLACES</strong><i className="bi bi-flower1" /></div>
            <div className="hero-sticker"><i className="bi bi-bookmark-heart" /><span>Find your<br />next favorite</span></div>
          </div>
        </div>
      </section>
      <section className="section-space container">
        <div className="section-heading"><div><span className="eyebrow dark">HANDPICKED FOR YOU</span><h2>Books worth sharing</h2></div><Link className="text-link" to="/catalog">View all books <i className="bi bi-arrow-right" /></Link></div>
        {loading ? <Loading /> : error ? <ErrorMessage error={error} /> : books.length ? <div className="row g-4">{books.map((book) => <div className="col-6 col-lg-3" key={book.id}><BookCard book={book} /></div>)}</div> : <div className="empty-state"><i className="bi bi-book" /><h3>The shelves are waiting</h3><p>Our collection will appear here soon.</p></div>}
      </section>
      <section className="category-band">
        <div className="container section-space">
          <div className="section-heading"><div><span className="eyebrow dark">FOLLOW YOUR CURIOSITY</span><h2>Something for every mood</h2></div></div>
          <div className="row g-3">{categories.map(([icon, name, desc]) => <div className="col-6 col-lg-3" key={name}><Link to={`/catalog?category=${encodeURIComponent(name)}`} className="category-tile"><i className={`bi ${icon}`} /><h3>{name}</h3><p>{desc}</p><span>Explore <i className="bi bi-arrow-up-right" /></span></Link></div>)}</div>
        </div>
      </section>
      <section className="container section-space">
        <div className="join-banner"><div><span className="eyebrow">YOUR LIBRARY, YOUR WAY</span><h2>Make room for a new favorite.</h2><p>Join our community and keep every good read within reach.</p></div><Link to="/register" className="btn btn-light btn-lg rounded-pill px-4">Join for free <i className="bi bi-arrow-right ms-2" /></Link></div>
      </section>
    </>
  )
}
