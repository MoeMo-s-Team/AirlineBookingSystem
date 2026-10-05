import { Header } from '../components/layout/Header'

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
          Welcome to Airline Booking System
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8">
          Book your flights easily with multiple fare classes and services
        </p>
        <div className="text-center">
          <a
            href="/search"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-primary-700"
          >
            Search Flights
          </a>
        </div>
      </main>
    </div>
  )
}
