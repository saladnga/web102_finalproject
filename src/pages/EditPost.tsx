import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import supabase from "../utils/supabase";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string;
  secret_key: string;
  flags: string[];
}

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    flags: [] as string[],
  });
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const availableFlags = [
    { value: "Question", emoji: "❓", label: "Question" },
    { value: "Opinion", emoji: "💭", label: "Opinion" },
    { value: "News", emoji: "📰", label: "News" },
    { value: "Discussion", emoji: "💬", label: "Discussion" },
  ];

  useEffect(() => {
    if (id) {
      fetchPost();
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
      setFormData({
        title: data.title,
        content: data.content || "",
        image_url: data.image_url || "",
        flags: data.flags || [],
      });
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || secretKey !== post.secret_key) {
      alert("Invalid secret key");
      return;
    }

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({
          title: formData.title,
          content: formData.content,
          image_url: formData.image_url,
          flags: formData.flags,
        })
        .eq("id", post.id);

      if (error) throw error;
      navigate(`/post/${post.id}`);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error updating post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFlagToggle = (flag: string) => {
    setFormData((prev) => ({
      ...prev,
      flags: prev.flags.includes(flag)
        ? prev.flags.filter((f) => f !== flag)
        : [...prev.flags, flag],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
        <span className="ml-4 text-lg text-gray-600">Loading post...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Post not found
          </h1>
          <p className="text-gray-600 mb-4">
            This football post might have been deleted.
          </p>
          <Link
            to="/"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Back to Football Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          to={`/post/${post.id}`}
          className="flex items-center text-red-600 hover:text-red-700 transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Post
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-red-800 mb-2">Edit Post</h1>
          <p className="text-gray-600">Update your football post</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Authentication Required
            </h3>
            <label className="block text-sm font-medium text-yellow-700 mb-2">
              Enter your secret key to edit this post
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
              className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Secret key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="What's your Manchester United topic?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Categories
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableFlags.map((flag) => (
                <label
                  key={flag.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.flags.includes(flag.value)
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 hover:border-red-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.flags.includes(flag.value)}
                    onChange={() => handleFlagToggle(flag.value)}
                    className="mr-3"
                  />
                  <span className="font-medium">{flag.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Share your thoughts about Manchester United..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="https://example.com/man-united-image.jpg"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                "💾 Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/post/${post.id}`)}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
