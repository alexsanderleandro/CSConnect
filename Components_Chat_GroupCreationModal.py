import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Upload, Users, Check } from "lucide-react";
import { UploadFile } from "@/integrations/Core";

export default function GroupCreationModal({ 
  isOpen, 
  onClose, 
  users, 
  currentUser, 
  onCreateGroup,
  editingGroup = null 
}) {
  const [groupName, setGroupName] = useState(editingGroup?.name || "");
  const [groupDescription, setGroupDescription] = useState(editingGroup?.description || "");
  const [groupImage, setGroupImage] = useState(editingGroup?.image_url || "");
  const [selectedMembers, setSelectedMembers] = useState(editingGroup?.members || []);
  const [isUploading, setIsUploading] = useState(false);

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

 