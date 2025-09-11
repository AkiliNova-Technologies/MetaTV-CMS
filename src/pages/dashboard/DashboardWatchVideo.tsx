import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Play,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Users
} from "lucide-react";
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
  uploadedAt?: string;
  programSubscribers?: number;
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
  programId: number;
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

function formatSubscribers(count: number) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`;
  return `${count} subscribers`;
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
  const [showRelatedVideos, setShowRelatedVideos] = useState(true);

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
          
          // Check program subscription status
          if (fetchedVideo.programId) {
            const subscribeResponse = await api.get(`/programs/${fetchedVideo.programId}/subscribe`);
            setIsSubscribed(subscribeResponse.data.isSubscribed || false);
          }
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
      message.error("Please log in to subscribe to this program");
      return;
    }

    if (!video?.programId) {
      message.error("This video is not associated with a program");
      return;
    }

    try {
      const response = await api.post(`/programs/${video.programId}/subscribe`);
      setIsSubscribed(response.data.isSubscribed);
      setVideo((prev) => prev ? {
        ...prev,
        programSubscribers: response.data.subscribers
      } : prev);
      message.success(response.data.isSubscribed ? "Subscribed to program!" : "Unsubscribed from program!");
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

  const programName = programs.find((p: Program) => p.id === (video.programId || video.program?.id))?.name || "Unknown Program";
  const programSubscribers = video.programSubscribers || video.program?.totalSubscribers || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden border">
              <video
                controls
                className="w-full h-full"
                src={video.videoUrl}
                poster={video.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Title */}
            <h1 className="text-xl font-bold text-foreground">{video.title}</h1>

            {/* Video Stats and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatViews(video.views || 0)}</span>
                <span>•</span>
                <span>{formatTimeAgo(video.uploadedAt || new Date().toISOString())}</span>
                <span>•</span>
                <span>{programName}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLikeToggle}
                  disabled={!user}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className={`size-4 ${isLiked ? "fill-current" : ""}`} />
                  <span>{video.likes?.toLocaleString() || 0}</span>
                </Button>
                <Button
                  variant={isDisliked ? "default" : "outline"}
                  size="sm"
                  onClick={handleDislikeToggle}
                  disabled={!user}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className={`size-4 ${isDisliked ? "fill-current" : ""}`} />
                  <span>{video.dislikes?.toLocaleString() || 0}</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Share2 className="size-4" />
                  <span>Share</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="size-4" />
                  <span>Download</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Program Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  <span className="text-primary font-semibold">
                    {programName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{programName}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="size-3" />
                    <span>{formatSubscribers(programSubscribers)}</span>
                  </div>
                </div>
              </div>
              <Button
                variant={isSubscribed ? "secondary" : "default"}
                onClick={handleSubscribe}
                disabled={!user || !video.programId}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>

            {/* Description */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span>{formatTimeAgo(video.uploadedAt || new Date().toISOString())}</span>
                </div>
                <div className={showDescription ? "text-foreground" : "text-foreground line-clamp-3"}>
                  {video.description || "No description available"}
                </div>
                {video.tags?.length > 0 && showDescription && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {video.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {video.description && video.description.length > 150 && (
                  <Button
                    variant="link"
                    onClick={() => setShowDescription(!showDescription)}
                    className="px-0 text-primary hover:no-underline mt-2"
                  >
                    {showDescription ? "Show less" : "Show more"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            {video.allowComments ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="size-5" />
                    Comments {comments.length > 0 && `(${comments.length})`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Your avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="size-5 text-muted-foreground" />
                      )}
                    </div>
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
                            size="sm"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCommentSubmit}
                            disabled={commentLoading || !newComment.trim()}
                            size="sm"
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
                  
                  {comments.length > 0 ? (
                    <ScrollArea className="h-[400px] pr-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              {comment.userAvatar ? (
                                <img
                                  src={comment.userAvatar}
                                  alt={comment.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="size-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground text-sm">@{comment.username}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-foreground mt-1 text-sm">{comment.content}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                  <ThumbsUp className="size-3 mr-1" />
                                  <span className="text-xs">{comment.likes}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                  <ThumbsDown className="size-3 mr-1" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                          <Separator className="my-3" />
                        </div>
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <MessageSquare className="size-12 mb-2 opacity-50" />
                      <p>No comments yet</p>
                      <p className="text-sm">Be the first to comment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <MessageSquare className="size-12 mb-2 opacity-50" />
                  <p>Comments are disabled for this video</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Videos */}
            <Card className={relatedVideos.length === 0 ? "h-auto" : ""}>
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowRelatedVideos(!showRelatedVideos)}
                >
                  <CardTitle>Related Videos</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {showRelatedVideos ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </Button>
                </div>
              </CardHeader>
              {showRelatedVideos && (
                <CardContent>
                  {relatedVideos.length > 0 ? (
                    <div className="space-y-3">
                      {relatedVideos.map((relatedVideo) => (
                        <div
                          key={relatedVideo.id}
                          className="flex gap-3 cursor-pointer group"
                          onClick={() => handleRelatedVideoClick(relatedVideo.id)}
                        >
                          <div className="relative flex-shrink-0 w-40 h-24 rounded-md overflow-hidden">
                            <img
                              src={relatedVideo.thumbnailUrl}
                              alt={relatedVideo.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                              {formatDuration(relatedVideo.duration)}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                              <Play className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary">
                              {relatedVideo.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {programs.find(p => p.id === relatedVideo.programId)?.name || "Unknown Program"}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{formatViews(relatedVideo.views)}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(relatedVideo.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-muted-foreground text-center">
                      <Play className="size-10 mb-2 opacity-50" />
                      <p className="text-sm">No related videos found</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Video Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {video.category?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {video.category.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground">{formatDuration(video.duration || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution</span>
                    <span className="text-foreground">{video.resolution || "1080p"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program</span>
                    <span className="text-foreground">{programName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subscribers</span>
                    <span className="text-foreground">{formatSubscribers(programSubscribers)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}