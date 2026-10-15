
import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'
import Register from './Register'

function App() {
  const [user, setUser] = useState(null)
  const [showRegister, setShowRegister] = useState(false)

  const [expenses, setExpenses] = useState([])

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const loadExpenses = async () => {
    try {
      const response = await fetch('http://localhost:8080/expenses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      } else {
        console.log('Failed to load expenses')
      }
    } catch (error) {
      console.log('Cannot connect to backend')
    }
  }

  useEffect(() => {
    if (user) {
      loadExpenses()
    }
  }, [user])

  const clearForm = () => {
    setTitle('')
    setAmount('')
    setCategory('')
    setDate('')
    setEditingId(null)
    setFormError('')
  }

  const validateExpense = () => {
    const trimmedTitle = title.trim()
    const trimmedCategory = category.trim()
    const numericAmount = Number(amount)

    if (!trimmedTitle) {
      return 'Please enter an expense title.'
    }

    if (trimmedTitle.length > 100) {
      return 'Expense title must be 100 characters or less.'
    }

    if (!amount || Number.isNaN(numericAmount)) {
      return 'Please enter a valid amount.'
    }

    if (numericAmount <= 0) {
      return 'Amount must be greater than ₹0.'
    }

    if (numericAmount > 10000000) {
      return 'Amount is too large. Please enter a smaller amount.'
    }

    if (!trimmedCategory) {
      return 'Please enter an expense category.'
    }

    if (trimmedCategory.length > 50) {
      return 'Category must be 50 characters or less.'
    }

    if (!date) {
      return 'Please select an expense date.'
    }

    return ''
  }

  const addExpense = async (e) => {
    e.preventDefault()

    const validationError = validateExpense()

    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError('')

    const expense = {
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      date
    }

    try {
      const response = await fetch('http://localhost:8080/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(expense)
      })

      if (response.ok) {
        clearForm()
        loadExpenses()
      } else {
        setFormError('Failed to add expense. Please try again.')
      }
    } catch (error) {
      setFormError('Cannot connect to backend. Please make sure the server is running.')
    }
  }

  const updateExpense = async (e, id) => {
    e.preventDefault()

    const validationError = validateExpense()

    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError('')

    const updatedExpense = {
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      date
    }

    try {
      const response = await fetch(
        `http://localhost:8080/expenses/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(updatedExpense)
        }
      )

      if (response.ok) {
        clearForm()
        loadExpenses()
      } else {
        setFormError('Failed to update expense. Please try again.')
      }
    } catch (error) {
      setFormError('Cannot connect to backend. Please make sure the server is running.')
    }
  }

  const deleteExpense = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this expense?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8080/expenses/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.ok) {
        loadExpenses()
      } else {
        alert('Failed to delete expense')
      }
    } catch (error) {
      alert('Cannot connect to backend')
    }
  }

  const startEditing = (expense) => {
    setEditingId(expense.id)
    setTitle(expense.title)
    setAmount(expense.amount)
    setCategory(expense.category)
    setDate(expense.date)
    setFormError('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setExpenses([])
    clearForm()
    setSearchTerm('')
    setFilterDate('')
  }

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  )

  const highestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((expense) => Number(expense.amount)))
      : 0

  const categorySummary = expenses.reduce((summary, expense) => {
    const expenseCategory = expense.category

    summary[expenseCategory] =
      (summary[expenseCategory] || 0) + Number(expense.amount)

    return summary
  }, {})

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDate =
      filterDate === '' || expense.date === filterDate

    return matchesSearch && matchesDate
  })

  if (!user) {
    if (showRegister) {
      return (
        <Register
          onRegistered={() => setShowRegister(false)}
          onBackToLogin={() => setShowRegister(false)}
        />
      )
    }

    return (
      <Login
        onLogin={setUser}
        onRegisterClick={() => setShowRegister(true)}
      />
    )
  }

  return (
    <div className="app">

      {/* HEADER */}

      <header className="app-header">
        <div>
          <h1>Personal Expense Tracker</h1>
          <p>
            Welcome, <strong>{user.name}</strong>
          </p>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {/* ADD / EDIT EXPENSE */}

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>
              {editingId ? 'Edit Expense' : 'Add New Expense'}
            </h2>

            <p>
              {editingId
                ? 'Update the details of your expense.'
                : 'Enter your expense details below.'}
            </p>
          </div>
        </div>

        {formError && (
          <div className="expense-form-error">
            {formError}
          </div>
        )}

        <form
          onSubmit={(e) =>
            editingId
              ? updateExpense(e, editingId)
              : addExpense(e)
          }
          className="expense-form"
        >

          <div className="form-group">
            <label>Expense Title</label>

            <input
              type="text"
              placeholder="Example: Lunch"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setFormError('')
              }}
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label>Amount</label>

            <input
              type="number"
              placeholder="Enter amount"
              min="0.01"
              max="10000000"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setFormError('')
              }}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setFormError('')
              }}
              required
            >
              <option value="">Choose a category</option>
              {['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Health', 'Entertainment', 'Others'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setFormError('')
              }}
              required
            />
          </div>

          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
            >
              {editingId
                ? 'Update Expense'
                : 'Add Expense'}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </section>

      {/* EXPENSE SUMMARY */}

      <section className="summary-section">
        <h2>Expense Summary</h2>

        <div className="summary-grid">

          <div className="summary-card">
            <span>Total Expenses</span>
            <h3>₹{totalExpenses.toFixed(2)}</h3>
          </div>

          <div className="summary-card">
            <span>Number of Expenses</span>
            <h3>{expenses.length}</h3>
          </div>

          <div className="summary-card">
            <span>Highest Expense</span>
            <h3>₹{highestExpense.toFixed(2)}</h3>
          </div>

        </div>
      </section>

      {/* CATEGORY SUMMARY */}

      <section className="section-card">

        <div className="section-heading">
          <div>
            <h2>Category Summary</h2>
            <p>
              See how much you have spent in each category.
            </p>
          </div>
        </div>

        {Object.keys(categorySummary).length === 0 ? (

          <p className="empty-message">
            No category data available yet.
          </p>

        ) : (

          <div className="category-grid">

            {Object.entries(categorySummary).map(
              ([expenseCategory, total]) => (

                <div
                  className="category-card"
                  key={expenseCategory}
                >

                  <span>{expenseCategory}</span>

                  <strong>
                    ₹{Number(total).toFixed(2)}
                  </strong>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* EXPENSE LIST */}

      <section className="section-card">

        <div className="section-heading">
          <div>
            <h2>My Expenses</h2>

            <p>
              Search and filter your expense records.
            </p>
          </div>
        </div>

        <div className="filter-section">

          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          <input
            type="date"
            value={filterDate}
            onChange={(e) =>
              setFilterDate(e.target.value)
            }
          />

          <button
            type="button"
            className="clear-button"
            onClick={() => {
              setSearchTerm('')
              setFilterDate('')
            }}
          >
            Clear Filters
          </button>

        </div>

        <div className="expense-list">

          {expenses.length === 0 ? (

            <div className="empty-message">
              <h3>No expenses yet</h3>

              <p>
                Add your first expense using the form above.
              </p>
            </div>

          ) : filteredExpenses.length === 0 ? (

            <div className="empty-message">
              <h3>No matching expenses</h3>

              <p>
                Try changing your search or date filter.
              </p>
            </div>

          ) : (

            filteredExpenses.map((expense) => (

              <div
                className="expense-card"
                key={expense.id}
              >

                <div className="expense-info">

                  <div className="expense-title-row">

                    <h3>{expense.title}</h3>

                    <span className="category-badge">
                      {expense.category}
                    </span>

                  </div>

                  <p className="expense-date">
                    {expense.date}
                  </p>

                </div>

                <div className="expense-right">

                  <strong className="expense-amount">
                    ₹{Number(expense.amount).toFixed(2)}
                  </strong>

                  <div className="expense-actions">

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        startEditing(expense)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        deleteExpense(expense.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            ))
          )}

        </div>

      </section>

      <footer className="app-footer">
        Personal Expense Tracker
      </footer>

    </div>
  )
}

export default App

