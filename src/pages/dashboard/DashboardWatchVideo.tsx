import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Users,
  Clock,
  Eye,
  Calendar,
  Settings,
  Flag,
  Bell,
  BellOff,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import {
  IconVideo,
  IconAlertCircle,
  IconRefresh,
  IconLoader,
} from "@tabler/icons-react";
import api from "@/utils/api";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import type { Program } from "@/types/program";
import type { videoSchema } from "@/constants/Schemas";
import { z } from "zod";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function formatSubscribers(count: number) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
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

// Image component with loading and error states
function ThumbnailImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(false);
    setLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  const imgSrc = retryCount > 0 ? `${src}?retry=${retryCount}` : src;

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted ${className}`}>
        <IconAlertCircle className="size-6 text-muted-foreground mb-2" />
        <Button variant="ghost" size="sm" onClick={handleRetry}>
          <IconRefresh className="size-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-muted ${className}`}>
          <IconLoader className="animate-spin size-6 text-muted-foreground" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        crossOrigin="anonymous"
      />
    </>
  );
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
        setVideo(fetchedVideo);

        // Check like/dislike status
        if (user) {
          try {
            const likeResponse = await api.get(`/videos/${videoId}/like`);
            setIsLiked(likeResponse.data.isLiked || false);
            setIsDisliked(likeResponse.data.isDisliked || false);
          } catch (error) {
            console.error("Failed to fetch like status:", error);
          }

          // Check program subscription status
          if (fetchedVideo.programId) {
            try {
              const subscribeResponse = await api.get(`/programs/${fetchedVideo.programId}/subscribe`);
              setIsSubscribed(subscribeResponse.data.isSubscribed || false);
            } catch (error) {
              console.error("Failed to fetch subscription status:", error);
            }
          }
        }

        // Fetch comments if allowed
        if (fetchedVideo.allowComments) {
          try {
            const commentsResponse = await api.get(`/videos/${videoId}/comments`);
            setComments(commentsResponse.data);
          } catch (error) {
            console.error("Failed to fetch comments:", error);
          }
        }

        // Fetch related videos
        try {
          const category = Array.isArray(fetchedVideo.category)
            ? fetchedVideo.category[0]
            : fetchedVideo.category || "";
          const relatedResponse = await api.get(`/videos/related?category=${category}`);
          setRelatedVideos(relatedResponse.data);
        } catch (error) {
          console.error("Failed to fetch related videos:", error);
        }

        // Increment view count
        try {
          await api.post(`/videos/${videoId}/view`);
        } catch (error) {
          console.error("Failed to increment view count:", error);
        }
      } catch (error) {
        console.error("Failed to fetch video data:", error);
        toast.error("Failed to load video");
      } finally {
        setFetching(false);
      }
    };

    fetchVideoData();
  }, [videoId, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast.error("Please log in to like the video");
      return;
    }

    try {
      const response = await api.post(`/videos/${videoId}/like`);
      setIsLiked(response.data.isLiked);
      setIsDisliked(false);
      setVideo((prev) =>
        prev
          ? {
              ...prev,
              likes: response.data.likes,
            }
          : prev
      );
      toast.success(response.data.isLiked ? "Liked!" : "Like removed");
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleDislikeToggle = async () => {
    if (!user) {
      toast.error("Please log in to dislike the video");
      return;
    }

    try {
      const response = await api.post(`/videos/${videoId}/dislike`);
      setIsDisliked(response.data.isDisliked);
      setIsLiked(false);
      setVideo((prev) =>
        prev
          ? {
              ...prev,
              dislikes: response.data.dislikes,
            }
          : prev
      );
      toast.success(response.data.isDisliked ? "Disliked!" : "Dislike removed");
    } catch (error) {
      console.error("Failed to toggle dislike:", error);
      toast.error("Failed to update dislike");
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please log in to subscribe");
      return;
    }

    if (!video?.programId) {
      toast.error("This video is not associated with a program");
      return;
    }

    try {
      const response = await api.post(`/programs/${video.programId}/subscribe`);
      setIsSubscribed(response.data.isSubscribed);
      setVideo((prev) =>
        prev
          ? {
              ...prev,
              programSubscribers: response.data.subscribers,
            }
          : prev
      );
      toast.success(
        response.data.isSubscribed ? "Subscribed!" : "Unsubscribed"
      );
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
      toast.error("Failed to update subscription");
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
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
      toast.success("Comment added!");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleRelatedVideoClick = (videoId: number) => {
    navigate(`/dashboard/videos/watch-video/${videoId}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: video?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <IconVideo className="size-16 mx-auto text-muted-foreground opacity-50" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Video not found</h2>
              <p className="text-muted-foreground text-sm">
                This video may have been removed or doesn't exist
              </p>
            </div>
            <Button onClick={() => navigate("/dashboard/videos")}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Videos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const programName =
    programs.find((p: Program) => p.id === (video.programId || video.program?.id))?.name ||
    "Unknown Program";
  const programSubscribers = video.programSubscribers || video.program?.totalSubscribers || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/videos")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Videos
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Card */}
            <Card className="overflow-hidden border-1 p-0">
              <div className="aspect-video bg-black relative">
                <video
                  controls
                  className="w-full h-full aspect-video"
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </Card>

            {/* Video Info Card */}
            <Card>
              <CardHeader className="space-y-4">
                {/* Title */}
                <div>
                  <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Eye className="size-4" />
                      <span>{formatViews(video.views || 0)} views</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <span>{formatTimeAgo(video.createdAt || new Date().toISOString())}</span>
                    </div>
                    {video.category && video.category.length > 0 && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          {Array.isArray(video.category) ? video.category[0] : video.category}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isLiked ? "default" : "outline"}
                            size="sm"
                            onClick={handleLikeToggle}
                            disabled={!user}
                            className="gap-2"
                          >
                            <ThumbsUp className={`size-4 ${isLiked ? "fill-current" : ""}`} />
                            <span>{video.likes?.toLocaleString() || 0}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Like this video</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isDisliked ? "default" : "outline"}
                            size="sm"
                            onClick={handleDislikeToggle}
                            disabled={!user}
                            className="gap-2"
                          >
                            <ThumbsDown className={`size-4 ${isDisliked ? "fill-current" : ""}`} />
                            <span>{video.dislikes?.toLocaleString() || 0}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Dislike this video</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                      <Share2 className="size-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="size-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Flag className="size-4 mr-2" />
                          Report
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="size-4 mr-2" />
                          Quality
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Separator />

                {/* Program Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-input text-white font-bold text-lg">
                        {programName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{programName}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="size-3" />
                        <span>{formatSubscribers(programSubscribers)} subscribers</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isSubscribed ? "secondary" : "default"}
                    onClick={handleSubscribe}
                    disabled={!user || !video.programId}
                    className="gap-2"
                  >
                    {isSubscribed ? (
                      <>
                        <BellOff className="size-4" />
                        Subscribed
                      </>
                    ) : (
                      <>
                        <Bell className="size-4" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Description Card */}
            <Card className="border-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Description</CardTitle>
                  {video.description && video.description.length > 200 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDescription(!showDescription)}
                    >
                      {showDescription ? (
                        <>
                          <ChevronUp className="size-4 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="size-4 mr-1" />
                          Show more
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>{formatDuration(video.duration || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconVideo className="size-3" />
                      <span>{video.resolution || "HD"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>
                        Uploaded {formatTimeAgo(video.createdAt || new Date().toISOString())}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div
                    className={
                      showDescription
                        ? "text-foreground whitespace-pre-wrap"
                        : "text-foreground line-clamp-3 whitespace-pre-wrap"
                    }
                  >
                    {video.description || "No description available"}
                  </div>

                  {video.tags && video.tags.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="border-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5" />
                  Comments
                  {comments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {comments.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {video.allowComments ? (
                  <>
                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>
                          <User className="size-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[100px] resize-none"
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

                    <Separator />

                    {/* Comments List */}
                    {comments.length > 0 ? (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-6">
                          {comments.map((comment) => (
                            <div key={comment.id} className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Avatar>
                                  <AvatarImage src={comment.userAvatar} />
                                  <AvatarFallback>
                                    <User className="size-4 text-muted-foreground" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm">
                                      @{comment.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimeAgo(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                                      <ThumbsUp className="size-3" />
                                      <span className="text-xs">{comment.likes}</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 px-2">
                                      <ThumbsDown className="size-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <Separator />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="size-16 mb-3 text-muted-foreground opacity-50" />
                        <h3 className="font-semibold mb-1">No comments yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Be the first to share your thoughts
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="size-16 mb-3 text-muted-foreground opacity-50" />
                    <h3 className="font-semibold mb-1">Comments are disabled</h3>
                    <p className="text-sm text-muted-foreground">
                      The uploader has disabled comments for this video
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Videos */}
            <Card className="border-1">
              <CardHeader className="pb-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowRelatedVideos(!showRelatedVideos)}
                >
                  <CardTitle className="text-base">Related Videos</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {showRelatedVideos ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {showRelatedVideos && (
                <CardContent>
                  {relatedVideos.length > 0 ? (
                    <ScrollArea className="h-[600px] pr-3">
                      <div className="space-y-4">
                        {relatedVideos.map((relatedVideo) => (
                          <div
                            key={relatedVideo.id}
                            className="group flex gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            onClick={() => handleRelatedVideoClick(relatedVideo.id)}
                          >
                            <div className="relative flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden">
                              <ThumbnailImage
                                src={relatedVideo.thumbnailUrl}
                                alt={relatedVideo.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded">
                                {formatDuration(relatedVideo.duration)}
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="size-8 text-white drop-shadow-lg" fill="white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                {relatedVideo.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {programs.find((p) => p.id === relatedVideo.programId)?.name ||
                                  "Unknown"}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="size-3" />
                                <span>{formatViews(relatedVideo.views)}</span>
                                <span>•</span>
                                <span>{formatTimeAgo(relatedVideo.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <IconVideo className="size-12 mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">No related videos found</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}