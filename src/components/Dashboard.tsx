import React, { useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Share2,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { ScheduledPost } from "../types";
import { schedulerAPI } from "../utils/api";
import toast from "react-hot-toast";

interface DashboardProps {
  scheduledPosts: ScheduledPost[];
  onNewPost: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  scheduledPosts,
  onNewPost,
}) => {
  const [deletingPost, setDeletingPost] = useState<string | null>(null);

  const getStatusIcon = (status: ScheduledPost["status"]) => {
    switch (status) {
      case "posted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: ScheduledPost["status"]) => {
    switch (status) {
      case "posted":
        return "Posted";
      case "pending":
        return "Scheduled";
      case "failed":
        return "Failed";
      default:
        return "Draft";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setDeletingPost(postId);
    try {
      await schedulerAPI.deletePost(postId);
      toast.success("Post deleted successfully");
      // The parent component should refresh the posts list
      window.location.reload(); // Temporary solution - in a real app, you'd update the state
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete post";
      toast.error(errorMessage);
    } finally {
      setDeletingPost(null);
    }
  };

  const handleEditPost = (post: ScheduledPost) => {
    // Navigate to edit page or open edit modal
    // For now, we'll just show a toast
    toast.success("Edit functionality coming soon!");
  };

  const handleViewPost = (post: ScheduledPost) => {
    // Show post details in a modal or navigate to detail page
    toast.success("View functionality coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Manage your scheduled social media posts
            </p>
          </div>
          <button
            onClick={onNewPost}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Post
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scheduledPosts.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    scheduledPosts.filter((post) => post.status === "pending")
                      .length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Posted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    scheduledPosts.filter((post) => post.status === "posted")
                      .length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Posts */}
        <div className="bg-white rounded-2xl shadow-xl">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Scheduled Posts</h2>
          </div>

          {scheduledPosts.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No posts scheduled yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first festival-themed social media post
              </p>
              <button
                onClick={onNewPost}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {post.festival
                            ? post.festival.name
                            : post.content.festival?.name || "Custom Post"}
                        </h3>
                        <div className="flex items-center">
                          {getStatusIcon(post.status)}
                          <span className="ml-1 text-sm font-medium text-gray-600">
                            {getStatusText(post.status)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {post.content.caption}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(post.scheduledDate)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Share2 className="w-4 h-4" />
                          <div className="flex space-x-1">
                            {post.platforms.map((platform) => (
                              <span
                                key={platform}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  platform === "instagram"
                                    ? "bg-pink-100 text-pink-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {platform.charAt(0).toUpperCase() +
                                  platform.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewPost(post)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="View Post"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {post.status !== "posted" && (
                        <>
                          <button
                            onClick={() => handleEditPost(post)}
                            className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                            title="Edit Post"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeletePost(post.id)}
                            disabled={deletingPost === post.id}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
