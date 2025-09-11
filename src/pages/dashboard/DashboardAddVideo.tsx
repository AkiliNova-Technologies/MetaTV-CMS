import { useState, useRef } from "react";
import { message } from "antd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { useReduxVideos } from "@/hooks/useReduxVideos";
// import type { RcFile } from "antd/es/upload";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import type { Program } from "@/types/program";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import { ImageIcon, VideoIcon, Upload as UploadIcon } from "lucide-react";
import { IconX } from "@tabler/icons-react";

interface FormData {
  title: string;
  category: string;
  description: string;
  tags: string;
  isFeatured: boolean;
  allowComments: boolean;
  visibility: string;
  monetization: string;
  duration: string;
  resolution: string;
  size: string;
  format: string;
  codec: string;
  programId: string;
  uploadedById: number;
  thumbnailFile: File | null;
  videoFile: File | null;
}

export default function DashboardAddVideo() {
  const navigate = useNavigate();
  const { user } = useReduxAuth();
  const { reload } = useReduxVideos();
  const { programs } = useReduxPrograms();
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState({
    thumbnail: false,
    video: false,
  });

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    description: "",
    tags: "",
    isFeatured: false,
    allowComments: true,
    visibility: "PUBLIC",
    monetization: "none",
    duration: "0",
    resolution: "1920x1080",
    size: "0",
    format: "mp4",
    codec: "h264",
    programId: "",
    uploadedById: 0,
    thumbnailFile: null,
    videoFile: null,
  });

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDrop = (e: React.DragEvent, type: "thumbnail" | "video") => {
    e.preventDefault();
    setDragOver((prev) => ({ ...prev, [type]: false }));

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (type === "thumbnail") {
        handleFileChange("thumbnailFile", files[0]);
      } else if (type === "video") {
        handleFileChange("videoFile", files[0]);
      }
    }
  };

  const handleFileChange = (
    field: "thumbnailFile" | "videoFile",
    file: File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async () => {
    if (!formData.videoFile || !formData.thumbnailFile) {
      message.error("Please select both a video and thumbnail file");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("video", formData.videoFile);
      formDataToSend.append("thumbnail", formData.thumbnailFile);
      formDataToSend.append("uploadedById", user!.id.toString());

      // Explicitly append formData fields
      (Object.keys(formData) as (keyof FormData)[]).forEach((key) => {
        if (key === "category") {
          formDataToSend.append("category[]", formData.category.toUpperCase());
        } else if (key !== "thumbnailFile" && key !== "videoFile") {
          formDataToSend.append(key, formData[key]?.toString() || "");
        }
      });

      console.log("Video Data: ", formDataToSend);

      await api.post("/videos", formDataToSend);
      await reload();

      message.success("Video uploaded successfully!");
      navigate("/dashboard/videos");
    } catch {
      message.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/videos");
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upload Video</h1>
          <p className="mt-2 text-gray-600">Add a new video to your library</p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-lg border p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Video Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter video title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                {/* Program and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="program">Program *</Label>
                    <Select
                      value={formData.programId.toString()}
                      onValueChange={(value) =>
                        handleInputChange("programId", value)
                      }
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
                          <div className="px-4 py-2 text-gray-500">
                            No programs available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEWS">News</SelectItem>
                        <SelectItem value="ENTERTAINMENT">
                          Entertainment
                        </SelectItem>
                        <SelectItem value="SPORTS">Sports</SelectItem>
                        <SelectItem value="EDUCATION">Education</SelectItem>
                        <SelectItem value="MUSIC">Music</SelectItem>
                        <SelectItem value="SERMONS">Sermons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your video..."
                    className="min-h-[120px]"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Add tags separated by commas"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Example: music, performance, studio
                  </p>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-8">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) =>
                        handleInputChange("isFeatured", checked as boolean)
                      }
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isFeatured">Featured Video</Label>
                      <p className="text-sm text-gray-500">
                        Display this video in featured sections
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="allowComments"
                      checked={formData.allowComments}
                      onCheckedChange={(checked) =>
                        handleInputChange("allowComments", checked as boolean)
                      }
                    />
                    <div className="space-y-1">
                      <Label htmlFor="allowComments">Allow Comments</Label>
                      <p className="text-sm text-gray-500">
                        Allow viewers to comment on this video
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Files */}
              <div className="rounded-lg border p-6 space-y-4">
                <h3 className="text-lg font-medium">Media Files</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6">
                  {/* Thumbnail Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="size-4" />
                      Thumbnail *
                    </Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 h-35 text-center transition-colors cursor-pointer
                        ${
                          dragOver.thumbnail
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25"
                        }
                      `}
                      onDrop={(e) => handleDrop(e, "thumbnail")}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver((prev) => ({ ...prev, thumbnail: true }));
                      }}
                      onDragLeave={() =>
                        setDragOver((prev) => ({ ...prev, thumbnail: false }))
                      }
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(
                            "thumbnailFile",
                            e.target.files?.[0] || null
                          )
                        }
                      />
                      <div className="text-sm text-muted-foreground">
                        <UploadIcon className="mx-auto size-6 mb-2" />
                        Drag & drop image here or click to browse
                        <div className="text-xs mt-1">
                          JPG, PNG (16:9 ratio recommended)
                        </div>
                      </div>
                    </div>

                    {/* File info and remove button */}
                    {formData.thumbnailFile && (
                      <div className="flex items-center space-x-2 mt-2 max-w-xs text-foreground truncate p-2 bg-muted rounded-md">
                        <ImageIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate flex-1">
                          {formData.thumbnailFile.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() =>
                            handleFileChange("thumbnailFile", null)
                          }
                          className="size-6 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <IconX className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <VideoIcon className="size-4" />
                      Video File *
                    </Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 h-35 text-center transition-colors cursor-pointer
                        ${
                          dragOver.video
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25"
                        }
                      `}
                      onDrop={(e) => handleDrop(e, "video")}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver((prev) => ({ ...prev, video: true }));
                      }}
                      onDragLeave={() =>
                        setDragOver((prev) => ({ ...prev, video: false }))
                      }
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(
                            "videoFile",
                            e.target.files?.[0] || null
                          )
                        }
                      />
                      <div className="text-sm text-muted-foreground">
                        <UploadIcon className="mx-auto size-6 mb-2" />
                        Drag & drop video file here or click to browse
                        <div className="text-xs mt-1">
                          MP4, MOV, AVI (MAX. 5GB)
                        </div>
                      </div>
                    </div>

                    {/* File info and remove button */}
                    {formData.videoFile && (
                      <div className="flex items-center space-x-2 mt-2 max-w-xs text-foreground truncate p-2 bg-muted rounded-md">
                        <VideoIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate flex-1">
                          {formData.videoFile.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => handleFileChange("videoFile", null)}
                          className="size-6 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <IconX className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <div className=" rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">Publishing Options</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Visibility</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value) =>
                        handleInputChange("visibility", value)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                        <SelectItem value="UNLISTED">Unlisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Monetization</Label>
                    <Select
                      value={formData.monetization}
                      onValueChange={(value) =>
                        handleInputChange("monetization", value)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="ads">Ads</SelectItem>
                        <SelectItem value="premium">Premium Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col w-full gap-5">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full lg:w-auto"
                  disabled={loading}
                >
                  Cancel Upload
                </Button>
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={
                    !formData.videoFile || !formData.thumbnailFile || loading
                  }
                >
                  {loading ? "Uploading..." : "Upload Video"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
