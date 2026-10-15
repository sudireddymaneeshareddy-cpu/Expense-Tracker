import { useState } from 'react'

function Login({ onLogin, onRegisterClick }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })

      if (response.ok) {
        const data = await response.json()

        localStorage.setItem('token', data.token)
        onLogin(data)
      } else {
        setError('Invalid email or password.')
      }
    } catch (error) {
      setError('Cannot connect to backend. Please make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>Personal Expense Tracker</h1>
          <p>Manage your expenses easily and securely.</p>
        </div>

        <div className="auth-content">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">
            Login to continue to your expense tracker.
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">

            <div className="auth-form-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-switch">
            Don't have an account?
          </p>

          <button
            type="button"
            className="auth-secondary-button"
            onClick={onRegisterClick}
          >
            Create Account
          </button>
        </div>

        <div className="auth-footer">
          Personal Expense Tracker
        </div>

      </div>
    </div>
  )
}

export default Login

