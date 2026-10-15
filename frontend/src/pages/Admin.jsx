import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorMessage, Loading, PageShell } from '../components/Layout.jsx'
import { adminApi, booksApi, borrowingApi } from '../services/api.js'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.users(), borrowingApi.history()]).then(([s, u, r]) => { setStats(s); setUsers(u); setRecords(r) }).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [])
  return <PageShell title="Library administration" subtitle="A clear view of your collection and community.">
    <div className="d-flex justify-content-end mb-3"><Link to="/admin/books/new" className="btn btn-primary rounded-pill"><i className="bi bi-plus-lg me-2" />Add a book</Link></div>
    <ErrorMessage error={error} />
    {loading ? <Loading /> : <>
      <div className="row g-3 mb-5">{[['Books in collection', stats?.totalBooks, 'bi-book'], ['Available copies', stats?.availableCopies, 'bi-check-circle'], ['Active loans', stats?.activeLoans, 'bi-journal-arrow-up'], ['Library members', stats?.totalUsers, 'bi-people']].map(([label, value, icon]) => <div className="col-6 col-lg-3" key={label}><div className="admin-stat"><i className={`bi ${icon}`} /><span>{label}</span><strong>{value ?? 0}</strong></div></div>)}</div>
      <div className="section-heading"><h2>Manage the collection</h2></div>
      <div className="alert alert-light border"><Link to="/admin/books">Open book management</Link> to edit or remove a title.</div>
      <div className="section-heading mt-5"><h2>Recent borrowing activity</h2></div>
      <div className="table-responsive"><table className="table align-middle records-table"><thead><tr><th>Member</th><th>Book</th><th>Borrowed</th><th>Status</th></tr></thead><tbody>{records.slice(0, 10).map((record) => <tr key={record.id}><td>{record.userName}<div className="small text-secondary">{record.userEmail}</div></td><td>{record.bookTitle}</td><td>{new Date(record.borrowedAt).toLocaleDateString()}</td><td><span className={`status-pill ${record.status.toLowerCase()}`}>{record.status}</span></td></tr>)}</tbody></table>{records.length === 0 && <p className="text-secondary">No borrowing activity yet.</p>}</div>
      <div className="section-heading mt-5"><h2>Members <span className="small text-secondary">({users.length})</span></h2></div>
      <div className="table-responsive"><table className="table align-middle records-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{users.map((member) => <tr key={member.id}><td>{member.name}</td><td>{member.email}</td><td>{member.role}</td><td>{new Date(member.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
    </>}
  </PageShell>
}

export function AdminBooks() {
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { booksApi.list().then(setBooks).catch((err) => setError(err.message)).finally(() => setLoading(false)) }, [])
  async function remove(id) {
    if (!window.confirm('Delete this book from the catalog? Books with borrowing history cannot be deleted.')) return
    try { await booksApi.remove(id); setBooks(books.filter((book) => book.id !== id)) }
    catch (err) { setError(err.message) }
  }
  return <PageShell title="Manage books" subtitle="Add, update, and curate the library collection."><div className="d-flex justify-content-end mb-3"><Link to="/admin/books/new" className="btn btn-primary rounded-pill"><i className="bi bi-plus-lg me-2" />Add a book</Link></div><ErrorMessage error={error} />{loading ? <Loading /> : <div className="table-responsive"><table className="table align-middle records-table"><thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Copies available</th><th /></tr></thead><tbody>{books.map((book) => <tr key={book.id}><td>{book.title}</td><td>{book.author}</td><td>{book.category}</td><td>{book.availableCopies} / {book.totalCopies}</td><td className="text-end"><Link className="btn btn-sm btn-outline-primary rounded-pill me-2" to={`/admin/books/${book.id}/edit`}>Edit</Link><button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => remove(book.id)}>Delete</button></td></tr>)}</tbody></table>{books.length === 0 && <p className="text-secondary">No books in the catalog yet.</p>}</div>}</PageShell>
}

export function BookForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState({ title: '', author: '', category: '', isbn: '', description: '', coverImageUrl: '', totalCopies: 1 })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(editing)
  useEffect(() => {
    if (!editing) return
    booksApi.get(id).then((book) => setForm({ ...book })).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [editing, id])
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      if (editing) await booksApi.update(id, form); else await booksApi.create(form)
      navigate('/admin/books')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  if (loading) return <div className="container page-shell"><Loading /></div>
  return <PageShell title={editing ? 'Edit a book' : 'Add to the collection'} subtitle="Every detail helps a reader find their next favorite."><ErrorMessage error={error} /><form className="edit-form" onSubmit={submit}>
    {[
      ['title', 'Title', true], ['author', 'Author', true], ['category', 'Category', true], ['isbn', 'ISBN', false], ['coverImageUrl', 'Cover image URL', false],
    ].map(([key, label, required]) => <label className="form-label" key={key}>{label}<input className="form-control" required={required} maxLength={key === 'title' || key === 'author' ? 200 : 30} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}
    <label className="form-label">Description<textarea className="form-control" rows="5" maxLength="5000" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
    <label className="form-label">Total copies<input className="form-control" type="number" min="1" required value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: Number(e.target.value) })} /></label>
    <div className="d-flex gap-2"><button className="btn btn-primary rounded-pill px-4" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add book'}</button><button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate('/admin/books')}>Cancel</button></div>
  </form></PageShell>
}
