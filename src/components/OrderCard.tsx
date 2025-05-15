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

interface OrderCardProps {
  id: string;
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

  return (
    <Card className="w-full mb-4 bg-white border-l-4 border-l-primary hover:shadow-md transition-shadow">
      {/* Collapsed View */}
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={onToggleExpand}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`text-lg font-semibold ${currentStatus === "Done" ? "line-through text-muted-foreground" : ""}`}
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
              <p className="text-sm text-muted-foreground">{timestamp}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right mr-2">
              <span
                className={`font-bold ${currentStatus === "Accepted" ? "text-2xl" : "text-lg"}`}
              >
                {totalPrice.toLocaleString("mk-MK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ден.
              </span>
            </div>
            {currentStatus !== "Done" && (
              <div className="flex gap-2">
                {currentStatus === "New" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                    onClick={() => handleStatusChange("Accepted")}
                  >
                    Прими
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-700 hover:bg-green-50"
                  onClick={() => handleStatusChange("Done")}
                >
                  Готова
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-8 w-8"
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
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{address.street}</p>
                      <p className="text-sm">{address.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm">{phoneNumber}</p>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm font-medium">
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
                  <h4 className="font-medium mb-2">Notes</h4>
                  <div className="flex items-start">
                    <FileText className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <p className="text-sm">{notes}</p>
                  </div>
                </div>
              )}
            </div>

            {attachments && attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Attachments</h4>
                <ScrollArea className="h-[120px] w-full">
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="relative group cursor-pointer"
                        onClick={() => onViewMedia(attachment.id)}
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
                          <div className="w-24 h-24 rounded-md flex items-center justify-center bg-muted border border-border">
                            <FileText className="h-8 w-8 text-muted-foreground" />
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
          <CardFooter className="p-4 pt-0 flex justify-end">
            <div className="flex space-x-2">
              <Badge variant="outline">{`Order #${id}`}</Badge>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default OrderCard;
