import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import supabase from "../utils/supabase";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string;
  upvotes: number;
  created_at: string;
  user_id: string;
  flags: string[];
}

const HomeFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"created_at" | "upvotes">("created_at");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFlag, setFilterFlag] = useState("");

  const fetchCommentCounts = useCallback(async (postIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("post_id")
        .in("post_id", postIds);

      if (error) throw error;

      const counts: { [key: string]: number } = {};
      postIds.forEach((id) => (counts[id] = 0));

      data?.forEach((comment) => {
        counts[comment.post_id] = (counts[comment.post_id] || 0) + 1;
      });

      setCommentCounts(counts);
    } catch (error) {
      console.error("Error fetching comment counts:", error);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order(sortBy, { ascending: false });

      if (error) throw error;
      setPosts(data || []);

      // Fetch comment counts for all posts
      if (data) {
        await fetchCommentCounts(data.map((post) => post.id));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, fetchCommentCounts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFlag =
      !filterFlag || (post.flags && post.flags.includes(filterFlag));
    return matchesSearch && matchesFlag;
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const truncateText = (text: string, maxWords: number) => {
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
        <span className="ml-4 text-lg text-gray-600">
          Loading Manchester United posts...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-red-600 mb-2">
          <img
            src="src/assets/Manchester_United_FC_crest.svg.webp"
            alt="logo"
            className="w-12 mx-auto"
          />
          Manchester United Hub
        </h1>
        <p className="text-red-600 font-bold">
          Glory Glory Man United - Share your passion for the Red Devils
        </p>
      </div>

      {/* Controls */}
      <div className="bg-red-600 rounded-lg shadow-sm border border-red-500 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search posts by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "created_at" | "upvotes")
            }
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="created_at">Latest Posts</option>
            <option value="upvotes">Most Popular</option>
          </select>
          <select
            value={filterFlag}
            onChange={(e) => setFilterFlag(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Categories</option>
            <option value="Question">Questions</option>
            <option value="Opinion">Opinions</option>
            <option value="News">News</option>
            <option value="Discussion">Discussions</option>
          </select>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-500 text-lg mb-4">
              No posts found. Be the first to share your thoughts about
              Manchester United!
            </p>
            <Link
              to="/create"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              Create First Post
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow border-red-600"
            >
              <div className="p-6">
                {/* Post Flags */}
                {post.flags && post.flags.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    {post.flags.map((flag) => (
                      <span
                        key={flag}
                        className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium"
                      >
                        {flag === "Question"}
                        {flag === "Opinion"}
                        {flag === "News"}
                        {flag === "Discussion"}
                        {flag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  {/* Post Image */}
                  {post.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={post.image_url}
                        alt="Post image"
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="flex-1">
                    <Link to={`/post/${post.id}`} className="block">
                      <h2 className="text-xl font-bold text-gray-900 hover:text-red-600 mb-2 transition-colors">
                        {post.title}
                      </h2>

                      {/* Post Description */}
                      {post.content && (
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {truncateText(post.content, 25)}
                        </p>
                      )}

                      {/* Post Meta Information */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formatTimeAgo(post.created_at)}
                        </span>

                        <span className="flex items-center gap-1 text-red-600">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">{post.upvotes}</span>
                          <span className="ml-1">upvotes</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">
                            {commentCounts[post.id] || 0}
                          </span>
                          <span className="ml-1">comments</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>By {post.user_id.substring(0, 8)}</span>
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <Link
        to="/create"
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-colors"
        title="Create New Post"
      >
        <svg
          className="w-6 h-6"
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
      </Link>
    </div>
  );
};

export default HomeFeed;
