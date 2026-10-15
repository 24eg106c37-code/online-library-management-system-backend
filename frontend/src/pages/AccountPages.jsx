import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorMessage, Loading, PageShell } from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { borrowingApi } from '../services/api.js'

function RecordsTable({ records, onReturn }) {
  if (!records.length) return <div className="empty-state"><i className="bi bi-journal-bookmark" /><h3>Your reading story starts here</h3><p>Borrow your first book and it will show up here.</p><Link to="/catalog" className="btn btn-primary rounded-pill">Explore books</Link></div>
  return <div className="table-responsive"><table className="table align-middle records-table"><thead><tr><th>Book</th><th>Borrowed</th><th>Due date</th><th>Status</th><th /></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td><strong>{record.bookTitle}</strong><div className="small text-secondary">{record.bookAuthor}</div></td><td>{new Date(record.borrowedAt).toLocaleDateString()}</td><td>{new Date(record.dueDate).toLocaleDateString()}</td><td><span className={`status-pill ${record.status.toLowerCase()}`}>{record.status}</span></td><td>{record.status === 'BORROWED' && onReturn && <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => onReturn(record.id)}>Return</button>}</td></tr>)}</tbody></table></div>
}

export function Dashboard() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { borrowingApi.mine().then(setRecords).catch((err) => setError(err.message)).finally(() => setLoading(false)) }, [])
  const active = records.filter((record) => record.status === 'BORROWED')
  return <PageShell title={`Hello, ${user?.name?.split(' ')[0] || 'reader'}.`} subtitle="Your quiet corner of the library is ready when you are.">
    <ErrorMessage error={error} />
    <div className="dashboard-cards row g-3 mb-5"><div className="col-md-4"><div className="summary-card"><i className="bi bi-book" /><span>Currently borrowed</span><strong>{active.length}</strong></div></div><div className="col-md-4"><Link className="summary-card" to="/borrowed"><i className="bi bi-journal-bookmark" /><span>Your borrowed books</span><strong><i className="bi bi-arrow-up-right" /></strong></Link></div><div className="col-md-4"><Link className="summary-card" to="/history"><i className="bi bi-clock-history" /><span>Reading history</span><strong><i className="bi bi-arrow-up-right" /></strong></Link></div></div>
    <div className="section-heading"><h2>On your reading table</h2><Link to="/catalog" className="text-link">Find a new read <i className="bi bi-arrow-right" /></Link></div>
    {loading ? <Loading /> : <RecordsTable records={active} onReturn={async (id) => { try { await borrowingApi.return(id); setRecords(records.map((r) => r.id === id ? { ...r, status: 'RETURNED', returnedAt: new Date().toISOString() } : r)) } catch (err) { setError(err.message) } }} />}
  </PageShell>
}

export function BorrowedBooks() {
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { borrowingApi.mine().then(setRecords).catch((err) => setError(err.message)).finally(() => setLoading(false)) }, [])
  async function returnBook(id) {
    try { await borrowingApi.return(id); setRecords(records.map((r) => r.id === id ? { ...r, status: 'RETURNED' } : r)) }
    catch (err) { setError(err.message) }
  }
  return <PageShell title="My borrowed books" subtitle="Everything currently checked out on your library card."><ErrorMessage error={error} />{loading ? <Loading /> : <RecordsTable records={records.filter((record) => record.status === 'BORROWED')} onReturn={returnBook} />}</PageShell>
}

export function History() {
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { borrowingApi.mine().then(setRecords).catch((err) => setError(err.message)).finally(() => setLoading(false)) }, [])
  return <PageShell title="Your reading history" subtitle="A little archive of places your reading has taken you."><ErrorMessage error={error} />{loading ? <Loading /> : <RecordsTable records={records.filter((record) => record.status === 'RETURNED')} />}</PageShell>
}
