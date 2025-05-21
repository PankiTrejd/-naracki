import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrderStatus } from "@/types/order";
import { format } from "date-fns";
import { mk } from "date-fns/locale";
import { Attachment } from "@/types/order";

interface OrderCardProps {
  id: string;
  order_number?: number;
  customerName: string;
  address: {
    street: string;
    city: string;
  };
  phoneNumber: string;
  totalPrice: number;
  notes?: string;
  timestamp: string;
  attachments?: {
    id: string;
    type: "image" | "document";
    url: string;
    name: string;
  }[];
  status?: OrderStatus;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onViewMedia?: (attachmentId: string) => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderCard = ({
  id = "123456",
  order_number,
  customerName = "John Doe",
  address = { street: "123 Main St", city: "Anytown" },
  phoneNumber = "+1 (555) 123-4567",
  totalPrice = 99.99,
  notes = "Please deliver before 6 PM",
  timestamp = new Date().toLocaleString(),
  attachments = [
    {
      id: "1",
      type: "image",
      url: "https://images.unsplash.com/photo-1555982105-d25af4182e4e?w=400&q=80",
      name: "Product.jpg",
    },
    { id: "2", type: "document", url: "#", name: "Receipt.pdf" },
  ],
  status = "New",
  isExpanded = false,
  onToggleExpand = () => {},
  onViewMedia = () => {},
  onStatusChange = () => {},
}: OrderCardProps) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    status as OrderStatus,
  );

  const handleStatusChange = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    onStatusChange(id, newStatus);
  };

  // Helper to download all attachments
  const handleDownloadAll = () => {
    if (!attachments || attachments.length === 0) return;
    
    // Download each file separately
    attachments.forEach((attachment) => {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'dxf':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'ai':
        return <FileText className="h-8 w-8 text-orange-500" />;
      case 'psd':
        return <FileText className="h-8 w-8 text-blue-400" />;
      case 'svg':
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const handleFileClick = (attachment: Attachment) => {
    if (attachment.type === "image") {
      onViewMedia(attachment.id);
    } else {
      // For non-image files, open in new tab
      window.open(attachment.url, '_blank');
    }
  };

  console.log('OrderCard attachments:', attachments);

  return (
    <Card className="w-full mb-4 bg-white border-l-4 border-l-primary hover:shadow-md transition-shadow">
      {/* Collapsed View */}
      <CardHeader className="p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div
            className="flex items-center space-x-2 sm:space-x-4 cursor-pointer"
            onClick={onToggleExpand}
          >
            <div>
              <div className="flex items-center gap-1 sm:gap-2">
                <h3
                  className={`text-base sm:text-lg font-semibold ${currentStatus === "Done" ? "line-through text-muted-foreground" : ""}`}
                >
                  {customerName}
                </h3>
                <Badge
                  variant={
                    currentStatus === "New"
                      ? "default"
                      : currentStatus === "Accepted"
                        ? "outline"
                        : "secondary"
                  }
                  className={`
                  ${currentStatus === "New" ? "bg-blue-500" : ""}
                  ${currentStatus === "Accepted" ? "border-yellow-500 text-yellow-700" : ""}
                  ${currentStatus === "Done" ? "bg-green-500" : ""}
                  text-xs sm:text-sm
                `}
                >
                  {currentStatus === "New" && "Нова"}
                  {currentStatus === "Accepted" && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Примена
                    </span>
                  )}
                  {currentStatus === "Done" && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Готова
                    </span>
                  )}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {format(new Date(timestamp), "MMMM d - EEEE", { locale: mk })}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
            <div className="text-right mr-0 sm:mr-2">
              <span
                className={`font-bold ${currentStatus === "Accepted" ? "text-lg sm:text-2xl" : "text-base sm:text-lg"}`}
              >
                {totalPrice.toLocaleString("mk-MK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} {" "}
                ден.
              </span>
            </div>
            {currentStatus !== "Done" && (
              <div className="flex flex-row gap-2 w-full sm:w-auto">
                {currentStatus !== "Accepted" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 px-2 py-1 w-1/2 sm:w-auto"
                    onClick={() => handleStatusChange("Accepted")}
                  >
                    Прими
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-700 hover:bg-green-50 px-2 py-1 w-full sm:w-auto"
                  onClick={() => handleStatusChange("Done")}
                >
                  Готова
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-8 w-8 self-end sm:self-auto"
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Expanded View */}
      {isExpanded && (
        <>
          <Separator />
          <CardContent className="p-2 sm:p-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <h4 className="font-medium mb-1 sm:mb-2 text-base sm:text-lg">Customer Information</h4>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-xs sm:text-sm">{address.street}</p>
                      <p className="text-xs sm:text-sm">{address.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-xs sm:text-sm">{phoneNumber}</p>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium">
                      {totalPrice.toLocaleString("mk-MK", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      ден.
                    </p>
                  </div>
                </div>
              </div>

              {notes && (
                <div>
                  <h4 className="font-medium mb-1 sm:mb-2 text-base sm:text-lg">Notes</h4>
                  <div className="flex items-start">
                    <FileText className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <p className="text-xs sm:text-sm">{notes}</p>
                  </div>
                </div>
              )}
            </div>

            {attachments && attachments.length > 0 && (
              <div className="mt-2 sm:mt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 gap-2 sm:gap-4">
                  <h4 className="font-medium mr-0 sm:mr-4 text-base sm:text-lg">Прикачени фајлови</h4>
                  <Button size="sm" variant="outline" onClick={handleDownloadAll} className="w-full sm:w-auto">
                    Преземи ги сите
                  </Button>
                </div>
                <ScrollArea className="h-[120px] w-full overflow-x-auto">
                  <div className="flex flex-nowrap gap-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="relative group cursor-pointer min-w-[96px]"
                        onClick={() => handleFileClick(attachment)}
                      >
                        {attachment.type === "image" ? (
                          <div className="w-24 h-24 rounded-md overflow-hidden border border-border">
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-md flex flex-col items-center justify-center bg-muted border border-border p-1">
                            {getFileIcon(attachment.name)}
                            <p className="text-xs text-center truncate w-full mt-1">
                              {attachment.name}
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <p className="text-white text-xs truncate max-w-[90%] px-1">
                            {attachment.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-2 sm:p-4 pt-0 flex justify-end">
            <div className="flex space-x-2">
              <Badge variant="outline">{`Order #${order_number ?? id}`}</Badge>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default OrderCard;
