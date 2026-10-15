import { Link } from 'react-router-dom'
import bookPlaceholder from '../assets/book-placeholder.svg'

export function BookCard({ book }) {
  return (
    <article className="book-card h-100">
      <Link to={`/books/${book.id}`} className="book-cover-wrap" aria-label={`View ${book.title}`}>
        <img className="book-cover" src={book.coverImageUrl || bookPlaceholder} alt={`Cover of ${book.title}`} />
        <span className={`availability ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
          {book.availableCopies > 0 ? 'Available' : 'Checked out'}
        </span>
      </Link>
      <div className="book-card-body">
        <span className="book-category">{book.category}</span>
        <h3><Link to={`/books/${book.id}`}>{book.title}</Link></h3>
        <p className="text-secondary mb-0">{book.author}</p>
      </div>
    </article>
  )
}
