import { useState, useEffect, useRef } from "react";
import { message } from "antd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/utils/api";
import { useReduxVideos } from "@/hooks/useReduxVideos";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import type { Program } from "@/types/program";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import type { Video } from "@/types/video";
import {
  Loader2,
  AlertCircle,
  ImageIcon,
  VideoIcon,
  Upload as UploadIcon,
  CheckCircle2,
  Info,
  ArrowLeft,
  Eye,
  EyeOff,
  FileVideo,
  Image as ImageIconAlt,
  Save,
} from "lucide-react";
import { IconX } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase, STORAGE_BUCKETS, storageUtils } from "@/config/supabase";
import { toast } from "sonner";

interface FormData {
  title: string;
  category: string;
  description: string;
  tags: string;
  allowComments: boolean;
  visibility: string;
  duration: string;
  resolution: string;
  size: string;
  format: string;
  codec: string;
  programId: string;
  uploadedById: number;
  isApproved: boolean;
  thumbnailUrl?: string;
  videoUrl?: string;
}

interface UploadStep {
  id: number;
  title: string;
  status: "pending" | "in-progress" | "completed" | "error";
  icon: React.ReactNode;
}

export default function DashboardEditVideo() {
  const navigate = useNavigate();
  const { id: videoId } = useParams<{ id: string }>();
  const { user } = useReduxAuth();
  const { reload } = useReduxVideos();
  const { programs } = useReduxPrograms();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"details" | "files" | "review">("details");
  const [uploadProgress, setUploadProgress] = useState({ video: 0, thumbnail: 0 });
  const [uploadSteps, setUploadSteps] = useState<UploadStep[]>([
    { id: 1, title: "Uploading video", status: "pending", icon: <FileVideo className="size-4" /> },
    { id: 2, title: "Uploading thumbnail", status: "pending", icon: <ImageIconAlt className="size-4" /> },
    { id: 3, title: "Processing metadata", status: "pending", icon: <Info className="size-4" /> },
    { id: 4, title: "Saving changes", status: "pending", icon: <CheckCircle2 className="size-4" /> },
  ]);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [dragOver, setDragOver] = useState({ thumbnail: false, video: false });
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    description: "",
    tags: "",
    allowComments: true,
    visibility: "PUBLIC",
    duration: "0",
    resolution: "1920x1080",
    size: "0",
    format: "mp4",
    codec: "h264",
    programId: "",
    uploadedById: user?.id || 0,
    isApproved: false,
  });
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Fetch video data on mount
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setFetching(true);
        const response = await api.get(`/videos/${videoId}`);
        const video: Video = response.data;

        setFormData({
          title: video.title || "",
          category: Array.isArray(video.category) ? video.category[0] : (video.category as any) || "",
          description: video.description || "",
          tags: video.tags?.join(", ") || "",
          allowComments: video.allowComments ?? true,
          visibility: video.visibility || "PUBLIC",
          duration: video.duration?.toString() || "0",
          resolution: video.resolution === "FOUR_K" ? "4K" : video.resolution || "HD",
          size: video.size?.toString() || "0",
          format: video.format || "mp4",
          codec: video.codec || "h264",
          programId: video.programId?.toString() || "",
          uploadedById: video.uploadedById || user?.id || 0,
          isApproved: video.isApproved || false,
          thumbnailUrl: video.thumbnailUrl,
          videoUrl: video.videoUrl,
        });

        // Set previews for existing files
        if (video.thumbnailUrl) {
          setThumbnailPreview(video.thumbnailUrl);
        }
        if (video.videoUrl) {
          setVideoPreview(video.videoUrl);
        }
      } catch (error) {
        console.error("Failed to fetch video:", error);
        setError("Failed to load video data");
        toast.error("Failed to load video data");
      } finally {
        setFetching(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId, user]);

  const updateUploadStep = (stepId: number, status: UploadStep["status"]) => {
    setUploadSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step))
    );
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDrop = (e: React.DragEvent, type: "thumbnail" | "video") => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((prev) => ({ ...prev, [type]: false }));

    console.log(`[DROP] File dropped for ${type}`);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      console.log(`[DROP] File received:`, files[0].name, files[0].type, files[0].size);
      handleFileChange(type, files[0]);
    } else {
      console.warn(`[DROP] No file found in drop event`);
    }
  };

  const handleFileChange = (type: "thumbnail" | "video", file: File | null) => {
    console.log(`[FILE CHANGE] Type: ${type}, File:`, file?.name || 'null');
    
    if (file) {
      // Validate file
      const bucket = type === "video" ? STORAGE_BUCKETS.VIDEOS : STORAGE_BUCKETS.THUMBNAILS;
      console.log(`[VALIDATION] Validating file for bucket:`, bucket);
      
      const validation = storageUtils.validateFile(file, bucket);
      console.log(`[VALIDATION] Result:`, validation);

      if (!validation.valid) {
        console.error(`[VALIDATION ERROR]`, validation.error);
        message.error(validation.error);
        toast.error(validation.error);
        return;
      }

      // Create preview
      try {
        const previewUrl = URL.createObjectURL(file);
        console.log(`[PREVIEW] Created preview URL:`, previewUrl);
        
        if (type === "thumbnail") {
          setThumbnailFile(file);
          setThumbnailPreview(previewUrl);
          console.log(`[STATE] Thumbnail file and preview set`);
        } else {
          setVideoFile(file);
          setVideoPreview(previewUrl);
          setFormData((prev) => ({
            ...prev,
            size: file.size.toString(),
            format: file.name.split(".").pop() || "mp4",
          }));
          console.log(`[STATE] Video file and preview set`);
        }
        
        toast.success(`${type === 'video' ? 'Video' : 'Thumbnail'} selected successfully`);
      } catch (err) {
        console.error(`[PREVIEW ERROR] Failed to create preview:`, err);
        toast.error(`Failed to load ${type} preview`);
      }
    } else {
      console.log(`[FILE CHANGE] Clearing ${type} file`);
      if (type === "thumbnail") {
        setThumbnailFile(null);
        setThumbnailPreview(formData.thumbnailUrl || null);
      } else {
        setVideoFile(null);
        setVideoPreview(formData.videoUrl || null);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const uploadToSupabase = async (file: File, bucket: string, type: "video" | "thumbnail"): Promise<string> => {
    console.log(`[UPLOAD START] ${type} - File:`, file.name, `Bucket:`, bucket);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      console.log(`[UPLOAD] Generated filename:`, fileName);

      if (type === "video") {
        setUploadingVideo(true);
        updateUploadStep(1, "in-progress");
      } else {
        setUploadingThumbnail(true);
        updateUploadStep(2, "in-progress");
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        if (type === "video") {
          setUploadProgress(prev => ({ ...prev, video: Math.min(prev.video + 10, 90) }));
        } else {
          setUploadProgress(prev => ({ ...prev, thumbnail: Math.min(prev.thumbnail + 10, 90) }));
        }
      }, 500);

      console.log(`[SUPABASE] Starting upload to bucket: ${bucket}`);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        console.error(`[SUPABASE ERROR]`, error);
        throw new Error(`Failed to upload ${type}: ${error.message}`);
      }

      console.log(`[SUPABASE] Upload successful:`, data);

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      console.log(`[SUPABASE] Public URL generated:`, urlData.publicUrl);

      if (type === "video") {
        updateUploadStep(1, "completed");
        setUploadProgress(prev => ({ ...prev, video: 100 }));
      } else {
        updateUploadStep(2, "completed");
        setUploadProgress(prev => ({ ...prev, thumbnail: 100 }));
      }

      toast.success(`${type === 'video' ? 'Video' : 'Thumbnail'} uploaded successfully!`);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error(`[UPLOAD ERROR] ${type}:`, error);
      if (type === "video") {
        updateUploadStep(1, "error");
      } else {
        updateUploadStep(2, "error");
      }
      toast.error(`Failed to upload ${type}`);
      throw error;
    } finally {
      if (type === "video") {
        setUploadingVideo(false);
      } else {
        setUploadingThumbnail(false);
      }
    }
  };

  const handleSubmit = async () => {
    console.log(`[SUBMIT] Starting submission process`);
    
    if (!videoId) {
      console.error(`[SUBMIT ERROR] Invalid video ID`);
      message.error("Invalid video ID");
      toast.error("Invalid video ID");
      return;
    }

    if (!formData.title || !formData.category || !formData.programId) {
      console.error(`[SUBMIT ERROR] Missing required fields`);
      message.error("Please fill in all required fields");
      toast.error("Please fill in all required fields");
      setCurrentStep("details");
      return;
    }

    setLoading(true);
    console.log(`[SUBMIT] Loading state set to true`);

    try {
      let videoUrl = formData.videoUrl;
      let thumbnailUrl = formData.thumbnailUrl;

      // Upload new video if changed
      if (videoFile) {
        console.log(`[SUBMIT] Uploading new video file`);
        videoUrl = await uploadToSupabase(videoFile, STORAGE_BUCKETS.VIDEOS, "video");
        console.log(`[SUBMIT] Video URL received:`, videoUrl);
      } else {
        console.log(`[SUBMIT] Using existing video URL`);
      }

      // Upload new thumbnail if changed
      if (thumbnailFile) {
        console.log(`[SUBMIT] Uploading new thumbnail file`);
        thumbnailUrl = await uploadToSupabase(thumbnailFile, STORAGE_BUCKETS.THUMBNAILS, "thumbnail");
        console.log(`[SUBMIT] Thumbnail URL received:`, thumbnailUrl);
      } else {
        console.log(`[SUBMIT] Using existing thumbnail URL`);
      }

      // Get video duration if new video uploaded
      updateUploadStep(3, "in-progress");
      let duration = formData.duration;
      if (videoFile) {
        console.log(`[SUBMIT] Getting video duration`);
        const video = document.createElement("video");
        video.preload = "metadata";
        const getDuration = (): Promise<number> => {
          return new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
              console.log(`[DURATION] Video duration:`, video.duration);
              resolve(Math.floor(video.duration));
            };
            video.onerror = () => {
              console.error(`[DURATION ERROR] Failed to load video metadata`);
              reject(new Error('Failed to load video metadata'));
            };
            video.src = URL.createObjectURL(videoFile);
          });
        };
        try {
          duration = (await getDuration()).toString();
        } catch (err) {
          console.error(`[DURATION ERROR]`, err);
          // Use default duration if we can't get it
          duration = "0";
        }
      }
      updateUploadStep(3, "completed");

      // Update video data
      updateUploadStep(4, "in-progress");
      const videoData = {
        title: formData.title,
        category: [formData.category.toUpperCase()],
        description: formData.description,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        allowComments: formData.allowComments,
        visibility: formData.visibility,
        duration: parseInt(duration),
        resolution: formData.resolution === "4K" ? "FOUR_K" : formData.resolution,
        size: parseInt(formData.size),
        format: formData.format,
        codec: formData.codec,
        programId: parseInt(formData.programId),
        uploadedById: user!.id,
        isApproved: formData.isApproved,
        videoUrl,
        thumbnailUrl,
      };

      console.log(`[API] Updating video with data:`, videoData);
      
      await api.put(`/videos/${videoId}`, videoData);
      updateUploadStep(4, "completed");
      await reload();

      console.log(`[SUBMIT] Success! Navigating to videos list`);
      toast.success("Video updated successfully!");
      navigate("/dashboard/videos");
    } catch (error) {
      console.error("[SUBMIT ERROR] Failed to update video:", error);
      toast.error("Update failed. Please try again.");
      
      // Reset upload steps on error
      setUploadSteps(prev => prev.map(step => 
        step.status === "in-progress" ? { ...step, status: "error" as const } : step
      ));
    } finally {
      setLoading(false);
      setUploadProgress({ video: 0, thumbnail: 0 });
      console.log(`[SUBMIT] Process complete, loading state reset`);
    }
  };

  const handleCancel = () => {
    console.log(`[CANCEL] User cancelled editing`);
    navigate("/dashboard/videos");
  };

  const isUploading = uploadingVideo || uploadingThumbnail;

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading video data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="link"
              onClick={() => navigate("/dashboard/videos")}
              className="mt-2 text-primary hover:underline"
            >
              Back to Videos
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4"
            disabled={loading || isUploading}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Videos
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Edit Video
              </h1>
              <p className="mt-2 text-muted-foreground">
                Update "{formData.title}"
              </p>
            </div>
            <div className="flex items-center gap-2">
              {uploadSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    step.status === "completed"
                      ? "bg-green-500/10 text-green-600"
                      : step.status === "in-progress"
                      ? "bg-blue-500/10 text-blue-600 animate-pulse"
                      : step.status === "error"
                      ? "bg-red-500/10 text-red-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.icon}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {(uploadingVideo || uploadingThumbnail || loading) && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <span className="font-medium">
                      {uploadingVideo
                        ? "Uploading video..."
                        : uploadingThumbnail
                        ? "Uploading thumbnail..."
                        : "Processing..."}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {uploadingVideo && `${uploadProgress.video}%`}
                    {uploadingThumbnail && `${uploadProgress.thumbnail}%`}
                  </span>
                </div>
                <Progress
                  value={
                    uploadingVideo
                      ? uploadProgress.video
                      : uploadingThumbnail
                      ? uploadProgress.thumbnail
                      : 50
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="size-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <UploadIcon className="size-4" />
              <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              <span className="hidden sm:inline">Review</span>
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Information</CardTitle>
                    <CardDescription>Update your video details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Video Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter a compelling title..."
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="text-lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.title.length}/100 characters
                      </p>
                    </div>

                    <Separator />

                    {/* Program and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="program">
                          Program <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.programId}
                          onValueChange={(value) => handleInputChange("programId", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            {programs.length > 0 ? (
                              programs.map((p: Program) => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                  {p.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500">No programs available</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">
                          Category <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEWS">News</SelectItem>
                            <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                            <SelectItem value="SPORTS">Sports</SelectItem>
                            <SelectItem value="EDUCATION">Education</SelectItem>
                            <SelectItem value="MUSIC">Music</SelectItem>
                            <SelectItem value="SERMONS">Sermons</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Tell viewers about your video..."
                        className="min-h-[150px] resize-none"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.description.length}/5000 characters
                      </p>
                    </div>

                    <Separator />

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., tutorial, beginner, react"
                        value={formData.tags}
                        onChange={(e) => handleInputChange("tags", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate tags with commas. Tags help people find your video.
                      </p>
                      {formData.tags && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.split(",").map((tag, idx) => (
                            <Badge key={idx} variant="secondary">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Video Settings</CardTitle>
                    <CardDescription>Configure how your video appears and behaves</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="allowComments" className="cursor-pointer">
                            Allow Comments
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Let viewers comment and engage with your content
                          </p>
                        </div>
                      </div>
                      <Checkbox
                        id="allowComments"
                        checked={formData.allowComments}
                        onCheckedChange={(checked) => handleInputChange("allowComments", checked as boolean)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="isApproved" className="cursor-pointer">
                            Approved
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Mark this video as approved for publishing
                          </p>
                        </div>
                      </div>
                      <Checkbox
                        id="isApproved"
                        checked={formData.isApproved}
                        onCheckedChange={(checked) => handleInputChange("isApproved", checked as boolean)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="size-5" />
                      Publishing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select
                        value={formData.visibility}
                        onValueChange={(value) => handleInputChange("visibility", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLIC">
                            <div className="flex items-center gap-2">
                              <Eye className="size-4" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="PRIVATE">
                            <div className="flex items-center gap-2">
                              <EyeOff className="size-4" />
                              Private
                            </div>
                          </SelectItem>
                          <SelectItem value="UNLISTED">
                            <div className="flex items-center gap-2">
                              <Info className="size-4" />
                              Unlisted
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {formData.visibility === "PUBLIC" && "Anyone can watch this video"}
                        {formData.visibility === "PRIVATE" && "Only you can watch this video"}
                        {formData.visibility === "UNLISTED" && "Anyone with the link can watch"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">File Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Video Size</span>
                      <span className="font-medium">{formatFileSize(parseInt(formData.size))}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format</span>
                      <span className="font-medium uppercase">{formData.format}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolution</span>
                      <span className="font-medium">{formData.resolution}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end">
              <Button size="lg" onClick={() => setCurrentStep("files")} className="gap-2">
                Continue to Files
                <CheckCircle2 className="size-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Upload */}
              <Card className="group hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <VideoIcon className="size-5 text-primary" />
                    Video File
                  </CardTitle>
                  <CardDescription>
                    {videoFile ? "Replace video file" : "Using existing video file"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden
                      ${
                        dragOver.video
                          ? "border-primary bg-primary/5 scale-105"
                          : videoFile
                          ? "border-green-500 bg-green-500/5"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                      }
                    `}
                    onDrop={(e) => handleDrop(e, "video")}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver((prev) => ({ ...prev, video: true }));
                    }}
                    onDragLeave={() => setDragOver((prev) => ({ ...prev, video: false }))}
                    onClick={() => {
                      console.log('[CLICK] Video upload area clicked');
                      videoInputRef.current?.click();
                    }}
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        console.log('[INPUT CHANGE] Video file input changed');
                        handleFileChange("video", e.target.files?.[0] || null);
                      }}
                      disabled={isUploading}
                    />

                    {!videoFile ? (
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <UploadIcon className="size-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            MP4, MOV, or AVI (max. 5GB)
                          </p>
                          <p className="text-xs text-green-600 mt-2">
                            Currently using existing video file
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="size-8 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-1">
                            New video selected
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs mx-auto">
                            {videoFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatFileSize(videoFile.size)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {videoPreview && (
                    <video
                      src={videoPreview}
                      className="w-full rounded-lg border max-h-[300px] object-cover"
                      controls
                    />
                  )}

                  {videoFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('[REMOVE] Removing video file');
                        handleFileChange("video", null);
                      }}
                      disabled={isUploading}
                      className="w-full"
                    >
                      <IconX className="mr-2 size-4" />
                      Remove New Video
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Thumbnail Upload */}
              <Card className="group hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="size-5 text-primary" />
                    Thumbnail
                  </CardTitle>
                  <CardDescription>
                    {thumbnailFile ? "Replace thumbnail" : "Using existing thumbnail"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden
                      ${
                        dragOver.thumbnail
                          ? "border-primary bg-primary/5 scale-105"
                          : thumbnailFile
                          ? "border-green-500 bg-green-500/5"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                      }
                    `}
                    onDrop={(e) => handleDrop(e, "thumbnail")}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver((prev) => ({ ...prev, thumbnail: true }));
                    }}
                    onDragLeave={() => setDragOver((prev) => ({ ...prev, thumbnail: false }))}
                    onClick={() => {
                      console.log('[CLICK] Thumbnail upload area clicked');
                      thumbnailInputRef.current?.click();
                    }}
                  >
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        console.log('[INPUT CHANGE] Thumbnail file input changed');
                        handleFileChange("thumbnail", e.target.files?.[0] || null);
                      }}
                      disabled={isUploading}
                    />

                    {!thumbnailFile ? (
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="size-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG or PNG (16:9 ratio recommended)
                          </p>
                          <p className="text-xs text-green-600 mt-2">
                            Currently using existing thumbnail
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="size-8 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-1">
                            New thumbnail selected
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs mx-auto">
                            {thumbnailFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatFileSize(thumbnailFile.size)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full rounded-lg border object-cover object-top aspect-video"
                    />
                  )}

                  {thumbnailFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('[REMOVE] Removing thumbnail file');
                        handleFileChange("thumbnail", null);
                      }}
                      disabled={isUploading}
                      className="w-full"
                    >
                      <IconX className="mr-2 size-4" />
                      Remove New Thumbnail
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Files are optional when editing. Leave unchanged to keep existing files, or upload new ones to replace them.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("details")}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Details
              </Button>
              <Button size="lg" onClick={() => setCurrentStep("review")} className="gap-2">
                Review Changes
                <CheckCircle2 className="size-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Review Tab - Same as before, no changes needed */}
          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Changes</CardTitle>
                <CardDescription>Check everything looks good before saving</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Preview */}
                  <div className="space-y-4">
                    <div className="aspect-video rounded-lg border overflow-hidden bg-black">
                      {videoPreview && (
                        <video
                          src={videoPreview}
                          poster={thumbnailPreview || undefined}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {thumbnailPreview && (
                      <div className="rounded-lg border overflow-hidden">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail"
                          className="w-full object-cover object-top aspect-video"
                        />
                        <div className="p-3 bg-muted text-xs text-muted-foreground text-center">
                          Thumbnail Preview
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-xl mb-2">{formData.title}</h3>
                      <p className="text-muted-foreground text-sm">{formData.description}</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Program</p>
                        <p className="font-medium">
                          {programs.find((p: Program) => p.id.toString() === formData.programId)?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Category</p>
                        <Badge variant="secondary">{formData.category}</Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Visibility</p>
                        <Badge variant={formData.visibility === "PUBLIC" ? "default" : "outline"}>
                          {formData.visibility}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Comments</p>
                        <Badge variant={formData.allowComments ? "default" : "secondary"}>
                          {formData.allowComments ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Status</p>
                        <Badge variant={formData.isApproved ? "default" : "secondary"}>
                          {formData.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                    </div>

                    {formData.tags && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-muted-foreground mb-2 text-sm">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.split(",").map((tag, idx) => (
                              <Badge key={idx} variant="outline">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Changes will be saved immediately. 
                        {(videoFile || thumbnailFile) && " New files will replace existing ones."}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("files")}
                disabled={loading || isUploading}
              >
                <ArrowLeft className="mr-2 size-4" />
                Back to Files
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel} disabled={loading || isUploading}>
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading || isUploading}
                  className="gap-2 min-w-[200px]"
                >
                  {loading || isUploading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}