import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";

export const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    secret_key: "",
    flags: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const availableFlags = [
    { value: "Question", emoji: "❓", label: "Question" },
    { value: "Opinion", emoji: "💭", label: "Opinion" },
    { value: "News", emoji: "📰", label: "News" },
    { value: "Discussion", emoji: "💬", label: "Discussion" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    setLoading(true);
    try {
      const userId = Math.random().toString(36).substring(2, 15);

      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            title: formData.title,
            content: formData.content,
            image_url: formData.image_url,
            secret_key: formData.secret_key,
            user_id: userId,
            repost_id: null,
            flags: formData.flags,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      navigate(`/post/${data.id}`);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post. Please try again.");
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-red-800 mb-2">
            Create New Post
          </h1>
          <p className="text-gray-600">
            Share your Manchester United thoughts with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  <span className="mr-2">{flag.emoji}</span>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Share your thoughts about Manchester United... tactics, players, matches, predictions, or anything Red Devils related!"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://example.com/football-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add an image to make your post more engaging
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key (For Authentication)
            </label>
            <input
              type="password"
              name="secret_key"
              value={formData.secret_key}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Create a secret key to edit/delete your post later"
            />
            <p className="text-xs text-gray-500 mt-1">
              Keep this secret! You'll need it to edit or delete your post
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Post"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Football Tips Sidebar */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">
          💡 Football Post Tips
        </h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Use specific team names and player names</li>
          <li>• Add match dates and scores for context</li>
          <li>• Share tactical analysis or predictions</li>
          <li>• Include relevant hashtags like #Premier League</li>
          <li>• Be respectful of all teams and fans</li>
        </ul>
      </div>
    </div>
  );
};
