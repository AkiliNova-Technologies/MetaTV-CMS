import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal } from "lucide-react";
import api from "@/utils/api";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import type { Program } from "@/types/program";
import type { videoSchema } from "@/constants/Schemas";
import { z } from "zod";

// Extend videoSchema to include additional fields
type Video = z.infer<typeof videoSchema> & {
  programId?: number;
  category?: string[];
  likes?: number;
  dislikes?: number;
  views?: number;
  program?: Program;
  channelName?: string;
  channelAvatar?: string;
  subscribers?: number;
  uploadedAt?: string;
};

type Comment = {
  id: number;
  content: string;
  userId: number;
  username: string;
  userAvatar: string;
  createdAt: string;
  likes: number;
};

type RelatedVideo = {
  id: number;
  title: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  channelName: string;
  uploadedAt: string;
};

// Utility functions
function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatViews(views: number) {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function formatSubscribers(count: number) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`;
  return `${count} subscribers`;
}

export default function DashboardWatchVideo() {
  const navigate = useNavigate();
  const { id: videoId } = useParams<{ id: string }>();
  const { user } = useReduxAuth();
  const { programs } = useReduxPrograms();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  // Fetch video, comments, and related videos on mount
  useEffect(() => {
    if (!videoId) {
      console.error("No videoId provided in URL");
      setFetching(false);
      return;
    }

    const fetchVideoData = async () => {
      try {
        setFetching(true);

        // Fetch video
        const videoResponse = await api.get(`/videos/${videoId}`);
        const fetchedVideo: Video = videoResponse.data;
        console.log("Fetched video:", fetchedVideo);
        setVideo(fetchedVideo);

        // Check like/dislike status
        if (user) {
          const likeResponse = await api.get(`/videos/${videoId}/like`);
          setIsLiked(likeResponse.data.isLiked || false);
          setIsDisliked(likeResponse.data.isDisliked || false);
          const subscribeResponse = await api.get(`/channels/${fetchedVideo.uploadedById}/subscribe`);
          setIsSubscribed(subscribeResponse.data.isSubscribed || false);
        }

        // Fetch comments if allowed
        if (fetchedVideo.allowComments) {
          const commentsResponse = await api.get(`/videos/${videoId}/comments`);
          setComments(commentsResponse.data);
        }

        // Fetch related videos
        const relatedResponse = await api.get(`/videos/related?category=${fetchedVideo.category?.[0] || ""}`);
        setRelatedVideos(relatedResponse.data);

        // Increment view count
        await api.get(`/videos/${videoId}/views`);
      } catch (error) {
        console.error("Failed to fetch video data:", error);
        message.error("Failed to load video");
      } finally {
        setFetching(false);
      }
    };

    fetchVideoData();
  }, [videoId, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      message.error("Please log in to like the video");
      return;
    }

    try {
      const response = await api.post(`/videos/${videoId}/like`);
      setIsLiked(response.data.isLiked);
      setIsDisliked(response.data.isDisliked || false);
      setVideo((prev) => prev ? {
        ...prev,
        likes: response.data.likes,
        dislikes: response.data.dislikes || prev.dislikes
      } : prev);
      message.success(response.data.isLiked ? "Video liked!" : "Like removed!");
    } catch (error) {
      console.error("Failed to toggle like:", error);
      message.error("Failed to update like");
    }
  };

  const handleDislikeToggle = async () => {
    if (!user) {
      message.error("Please log in to dislike the video");
      return;
    }

    try {
      const response = await api.post(`/videos/${videoId}/dislike`);
      setIsDisliked(response.data.isDisliked);
      setIsLiked(response.data.isLiked || false);
      setVideo((prev) => prev ? {
        ...prev,
        dislikes: response.data.dislikes,
        likes: response.data.likes || prev.likes
      } : prev);
      message.success(response.data.isDisliked ? "Video disliked!" : "Dislike removed!");
    } catch (error) {
      console.error("Failed to toggle dislike:", error);
      message.error("Failed to update dislike");
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      message.error("Please log in to subscribe");
      return;
    }

    try {
      const response = await api.post(`/channels/${video?.uploadedById}/subscribe`);
      setIsSubscribed(response.data.isSubscribed);
      setVideo((prev) => prev ? {
        ...prev,
        subscribers: response.data.subscribers
      } : prev);
      message.success(response.data.isSubscribed ? "Subscribed!" : "Unsubscribed!");
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
      message.error("Failed to update subscription");
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      message.error("Please log in to comment");
      return;
    }
    if (!newComment.trim()) {
      message.error("Comment cannot be empty");
      return;
    }

    setCommentLoading(true);
    try {
      const response = await api.post(`/videos/${videoId}/comments`, {
        content: newComment,
        userId: user.id,
      });
      setComments((prev) => [response.data, ...prev]);
      setNewComment("");
      message.success("Comment added!");
    } catch (error) {
      console.error("Failed to add comment:", error);
      message.error("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleRelatedVideoClick = (videoId: number) => {
    navigate(`/dashboard/videos/watch-video/${videoId}`);
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p>Loading video data...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Video not found</h2>
          <Button
            onClick={() => navigate("/dashboard/videos")}
            className="text-primary hover:underline"
          >
            Back to Videos
          </Button>
        </div>
      </div>
    );
  }

  const programName = programs.find((p: Program) => p.id === (video.programId || video.program?.id))?.name || "Unknown";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="aspect-video rounded-lg overflow-hidden border">
              <video
                controls
                className="w-full h-full"
                src={video.videoUrl}
                poster={video.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Stats and Actions */}
            <Card>
              <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{formatViews(video.views || 0)}</span>
                  <span>{programName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    onClick={handleLikeToggle}
                    disabled={!user}
                  >
                    <ThumbsUp className={`size-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                    {video.likes?.toLocaleString() || 0}
                  </Button>
                  <Button
                    variant={isDisliked ? "default" : "outline"}
                    onClick={handleDislikeToggle}
                    disabled={!user}
                  >
                    <ThumbsDown className={`size-4 mr-2 ${isDisliked ? "fill-current" : ""}`} />
                    {video.dislikes?.toLocaleString() || 0}
                  </Button>
                  <Button variant="outline" disabled>
                    <Share2 className="size-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" disabled>
                    <Download className="size-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" disabled>
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Channel Info */}
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={video.channelAvatar || "https://picsum.photos/48/48"}
                    alt={video.channelName || "Channel"}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-foreground">{video.channelName || "Unknown Channel"}</h3>
                    <p className="text-sm text-gray-600">{formatSubscribers(video.subscribers || 0)}</p>
                  </div>
                </div>
                <Button
                  variant={isSubscribed ? "secondary" : "default"}
                  onClick={handleSubscribe}
                  disabled={!user}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{formatViews(video.views || 0)}</span>
                  <span>{formatTimeAgo(video.uploadedAt || new Date().toISOString())}</span>
                </div>
                <p className={showDescription ? "text-foreground" : "text-foreground line-clamp-3"}>
                  {video.description || "No description"}
                </p>
                {video.tags?.length && showDescription && (
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button
                  variant="link"
                  onClick={() => setShowDescription(!showDescription)}
                  className="text-primary hover:underline"
                >
                  {showDescription ? "Show less" : "Show more"}
                </Button>
              </CardContent>
            </Card>

            {/* Comments Section */}
            {video.allowComments ? (
              <Card>
                <CardHeader>
                  <CardTitle>Comments ({comments.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <img
                      src={user?.id ? `https://picsum.photos/40/40?random=${user.id}` : "https://picsum.photos/40/40"}
                      alt="Your avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 space-y-3">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px]"
                        disabled={!user || commentLoading}
                      />
                      {newComment && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setNewComment("")}
                            disabled={commentLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCommentSubmit}
                            disabled={commentLoading || !newComment.trim()}
                          >
                            {commentLoading ? (
                              <>
                                <Loader2 className="size-4 animate-spin mr-2" />
                                Posting...
                              </>
                            ) : (
                              "Comment"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-[400px] pr-4">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="mb-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={comment.userAvatar}
                              alt={comment.username}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <span className="font-medium text-foreground">@{comment.username}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-foreground mt-1">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Button variant="ghost" size="sm" disabled>
                              <ThumbsUp className="size-4 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" disabled>
                              <ThumbsDown className="size-4 mr-1" />
                            </Button>
                            <Button variant="ghost" size="sm" disabled>
                              Reply
                            </Button>
                          </div>
                          <Separator className="my-2" />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No comments yet.</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <p className="text-gray-600">Comments are disabled for this video.</p>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Videos */}
            <Card>
              <CardHeader>
                <CardTitle>Related Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {relatedVideos.map((relatedVideo) => (
                    <div
                      key={relatedVideo.id}
                      className="flex gap-2 mb-4 cursor-pointer hover:bg-accent p-2 rounded-lg transition-colors"
                      onClick={() => handleRelatedVideoClick(relatedVideo.id)}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={relatedVideo.thumbnailUrl}
                          alt={relatedVideo.title}
                          className="w-40 h-24 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
                          {formatDuration(relatedVideo.duration)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2 hover:text-primary">
                          {relatedVideo.title}
                        </h3>
                        <p className="text-xs text-gray-600">{relatedVideo.channelName}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <span>{formatViews(relatedVideo.views)}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(relatedVideo.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Categories */}
            {video.category?.length && (
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {video.category.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Details */}
            <Card>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="text-foreground">{formatDuration(video.duration || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolution</span>
                  <span className="text-foreground">{video.resolution || "1080p"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="text-foreground">{formatViews(video.views || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="text-foreground">{video.likes?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dislikes</span>
                  <span className="text-foreground">{video.dislikes?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Program</span>
                  <span className="text-foreground">{programName}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}