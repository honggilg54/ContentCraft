import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Notification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatRelativeDate } from "@/lib/utils";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: isOpen, // Only fetch when modal is open
  });

  // Mutation to mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest('PATCH', `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Mark all notifications as read when modal opens
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      notifications.forEach(notification => {
        if (!notification.isRead) {
          markAsReadMutation.mutate(notification.id);
        }
      });
    }
  }, [isOpen, notifications]);

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expiration':
        return <span className="material-icons text-warning mr-3">warning</span>;
      case 'auto_consumed':
        return <span className="material-icons text-primary mr-3">autorenew</span>;
      case 'depleted':
        return <span className="material-icons text-danger mr-3">shopping_cart</span>;
      default:
        return <span className="material-icons text-neutral-500 mr-3">notifications</span>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">알림</DialogTitle>
          <DialogClose className="absolute right-4 top-4 p-1">
            <span className="material-icons">close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="divide-y">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <span className="material-icons animate-spin text-primary">refresh</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-neutral-500">
              <p>알림이 없습니다.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4 flex">
                {getNotificationIcon(notification.type)}
                <div>
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-neutral-500 mt-1">{formatRelativeDate(notification.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
