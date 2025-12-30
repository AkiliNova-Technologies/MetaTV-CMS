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
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import { useReduxVideos } from "@/hooks/useReduxVideos";
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

type Comment = {
  id: number;
  text: string;
  userId: number;
  user: {
    id: number;
    username: string;
    avatar: string;
  };
  createdAt: string;
  likes?: any[];
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
  const { id } = useParams<{ id: string }>();
  const videoId = parseInt(id || "0", 10);

  // Redux hooks
  const { user, isAuthenticated } = useReduxAuth();
  const { programs } = useReduxPrograms();

  // Video hook with all the new methods
  const {
    currentVideo: video,
    relatedVideos,
    loadVideo,
    loadRelated,
    likeVideo,
    dislikeVideo,
    isLiked,
    isDisliked,
    isLikeLoading,
    commentOnVideo,
    isCommentLoading,
    recordView,
    checkLikeStatus,
  } = useReduxVideos();

  // Program subscription hook
  const {
    subscribe,
    isSubscribed,
    checkSubscriptionStatus,
    isSubscriptionLoading,
    getProgramById,
  } = useReduxPrograms();

  // Local state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [showRelatedVideos, setShowRelatedVideos] = useState(true);
  const [fetching, setFetching] = useState(true);

  // Load video data on mount
  useEffect(() => {
    if (!videoId) {
      console.error("No videoId provided in URL");
      setFetching(false);
      return;
    }

    const fetchVideoData = async () => {
      try {
        setFetching(true);

        // Load video using Redux hook
        await loadVideo(videoId);

        // Record view
        recordView(videoId);

        // Check like status if authenticated
        if (isAuthenticated) {
          await checkLikeStatus(videoId);
        }
      } catch (error) {
        console.error("Failed to fetch video data:", error);
        toast.error("Failed to load video");
      } finally {
        setFetching(false);
      }
    };

    fetchVideoData();
  }, [videoId, isAuthenticated]);

  // Load related videos and subscription status when video loads
  useEffect(() => {
    if (!video) return;

    // Load related videos
    const category = Array.isArray(video.category)
      ? video.category[0]
      : video.category || "";

    if (category) {
      loadRelated(videoId, category);
    }

    // Check program subscription if authenticated and video has program
    if (isAuthenticated && video.programId) {
      checkSubscriptionStatus(video.programId);
    }

    // Fetch comments if allowed
    if (video.allowComments) {
      fetchComments();
    }
  }, [video, isAuthenticated]);

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  // Handle like
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to like the video");
      return;
    }
    await likeVideo(videoId);
  };

  // Handle dislike
  const handleDislikeToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to dislike the video");
      return;
    }
    await dislikeVideo(videoId);
  };

  // Handle subscribe
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to subscribe");
      return;
    }

    if (!video?.programId) {
      toast.error("This video is not associated with a program");
      return;
    }

    await subscribe(video.programId);
  };

  // Handle comment submit
  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const comment = await commentOnVideo(videoId, newComment);
    if (comment) {
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
    }
  };

  // Handle related video click
  const handleRelatedVideoClick = (relatedVideoId: number) => {
    navigate(`/dashboard/videos/watch-video/${relatedVideoId}`);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: video?.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Loading state
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

  // Video not found
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

  // Get program data
  const program = video.programId ? getProgramById(video.programId) : null;
  const programName = program?.name || video.program?.name || "Unknown Program";
  const programSubscribers = program?._count?.subscribers || 0;

  // Get like/dislike counts from _count
  const likeCount = video._count?.likes || 0;
  const dislikeCount = video._count?.dislikes || 0;

  // Check if liked/disliked
  const videoIsLiked = isLiked(videoId);
  const videoIsDisliked = isDisliked(videoId);

  // Check if subscribed
  const programIsSubscribed = video.programId ? isSubscribed(video.programId) : false;

  // Check loading states
  const likeIsLoading = isLikeLoading(videoId);
  const commentIsLoading = isCommentLoading(videoId);
  const subscriptionIsLoading = video.programId ? isSubscriptionLoading(video.programId) : false;

  return (
    <div className="min-h-screen">
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
                            variant={videoIsLiked ? "default" : "outline"}
                            size="sm"
                            onClick={handleLikeToggle}
                            disabled={!user || likeIsLoading}
                            className="gap-2"
                          >
                            <ThumbsUp className={`size-4 ${videoIsLiked ? "fill-current" : ""}`} />
                            <span>{likeCount.toLocaleString()}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Like this video</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={videoIsDisliked ? "default" : "outline"}
                            size="sm"
                            onClick={handleDislikeToggle}
                            disabled={!user || likeIsLoading}
                            className="gap-2"
                          >
                            <ThumbsDown className={`size-4 ${videoIsDisliked ? "fill-current" : ""}`} />
                            <span>{dislikeCount.toLocaleString()}</span>
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
                    variant={programIsSubscribed ? "secondary" : "default"}
                    onClick={handleSubscribe}
                    disabled={!user || !video.programId || subscriptionIsLoading}
                    className="gap-2"
                  >
                    {subscriptionIsLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : programIsSubscribed ? (
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
                      <span>{video.resolution === "FOUR_K" ? "4K" : video.resolution || "HD"}</span>
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
                          disabled={!user || commentIsLoading}
                        />
                        {newComment && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setNewComment("")}
                              disabled={commentIsLoading}
                              size="sm"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCommentSubmit}
                              disabled={commentIsLoading || !newComment.trim()}
                              size="sm"
                            >
                              {commentIsLoading ? (
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
                                  <AvatarImage src={comment.user.avatar} />
                                  <AvatarFallback>
                                    <User className="size-4 text-muted-foreground" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm">
                                      @{comment.user.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimeAgo(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.text}</p>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                                      <ThumbsUp className="size-3" />
                                      <span className="text-xs">{comment.likes?.length || 0}</span>
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
                                <span>{formatTimeAgo(relatedVideo.createdAt)}</span>
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