import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import supabase from "../utils/supabase";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string;
  upvotes: number;
  created_at: string;
  secret_key: string;
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleUpvote = async () => {
    if (!post) return;

    try {
      const { error } = await supabase
        .from("posts")
        .update({ upvotes: post.upvotes + 1 })
        .eq("id", post.id);

      if (error) throw error;
      setPost({ ...post, upvotes: post.upvotes + 1 });
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const userId = Math.random().toString(36).substring(2, 15);

      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: id,
            content: newComment,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setComments([...comments, data]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDelete = async () => {
    if (!post || secretKey !== post.secret_key) {
      alert("Invalid secret key");
      return;
    }

    try {
      // First delete all comments associated with this post
      const { error: commentsError } = await supabase
        .from("comments")
        .delete()
        .eq("post_id", post.id);

      if (commentsError) {
        console.error("Error deleting comments:", commentsError);
        // Continue with post deletion even if comment deletion fails
      }

      // Then delete the post
      const { error: postError } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (postError) throw postError;

      alert("Post and all associated comments deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Post not found</h1>
          <Link to="/" className="text-red-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Post Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {post.title}
            </h1>
            <div className="text-sm text-gray-500">
              Posted {formatTimeAgo(post.created_at)} by {post.user_id}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {post.upvotes}
            </button>
          </div>
        </div>

        {post.content && (
          <div className="mb-4">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {post.image_url && (
          <div className="mb-4">
            <img
              src={post.image_url}
              alt="Post image"
              className="max-w-full h-auto rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Edit/Delete Controls */}
        <div className="flex gap-2 pt-4 border-t">
          <Link
            to={`/edit/${post.id}`}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Edit Post
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Post
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 mb-2">
              Enter secret key to delete this post:
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="flex-1 px-3 py-1 border border-red-300 rounded-md"
                placeholder="Secret key"
              />
              <button
                onClick={handleDelete}
                className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">
          Comments ({comments.length})
        </h2>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Add a comment..."
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Post Comment
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-700">{comment.content}</p>
                    <div className="text-sm text-gray-500 mt-1">
                      {comment.user_id} • {formatTimeAgo(comment.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPage;
