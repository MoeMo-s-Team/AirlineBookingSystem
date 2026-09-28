import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              Airline Booking
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/my-bookings" className="text-gray-700 hover:text-primary-600">
                  My Bookings
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
