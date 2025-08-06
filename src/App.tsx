import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { CreatePost } from "./pages/CreatePost";
import PostPage from "./pages/PostPage";
import HomeFeed from "./pages/HomeFeed";
import EditPost from "./pages/EditPost";
import ManUnitedLogo from "./assets/Manchester_United_FC_crest.svg.webp";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen border-red-600">
        <nav className="bg-red-600 shadow-lg border-b-4 border-red-600">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src="src/assets/Manchester_United_FC_crest.svg.webp"
                  alt="logo"
                  className="w-12"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Manchester United Hub
                  </h1>
                </div>
              </Link>

              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="flex items-center bg-red-500 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                    />
                  </svg>
                  Home Feed
                </Link>

                <Link
                  to="/create"
                  className="flex items-center bg-red-500 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Post
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomeFeed />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/edit/:id" element={<EditPost />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white text-black mt-12 border-t-red-600 border">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center">
              <img
                src={ManUnitedLogo}
                alt="Manchester United Logo"
                className="w-12 mx-auto"
              />
              <h3 className="text-xl font-bold mb-2">Manchester United Hub</h3>
              <p className="text-black mb-4">
                The Theatre of Dreams Community. Share your passion for the Red
                Devils.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
