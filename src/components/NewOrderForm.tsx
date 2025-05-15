import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { useNavigate } from "react-router-dom";
import { Order, Attachment } from "@/types/order";
import { X, Upload, FileText, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface NewOrderFormProps {
  onOrderSubmit: (order: Order) => void;
}

const NewOrderForm = ({ onOrderSubmit = () => {} }: NewOrderFormProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    street: "",
    city: "",
    phoneNumber: "",
    totalPrice: "",
    notes: "",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    Array.from(files).forEach((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const isImage = file.type.startsWith("image/");
      const type = isImage ? "image" : "document";
      const url = isImage ? URL.createObjectURL(file) : "#";

      newAttachments.push({
        id,
        type,
        url,
        name: file.name,
      });
    });

    setAttachments((prev) => [...prev, ...newAttachments]);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const filtered = prev.filter((attachment) => attachment.id !== id);
      // Revoke object URLs to prevent memory leaks
      const removed = prev.find((attachment) => attachment.id === id);
      if (removed && removed.type === "image" && removed.url !== "#") {
        URL.revokeObjectURL(removed.url);
      }
      return filtered;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create new order object
    const newOrder: Order = {
      id: `${Date.now()}`,
      customerName: formData.customerName,
      address: {
        street: formData.street,
        city: formData.city,
      },
      phoneNumber: formData.phoneNumber,
      totalPrice: parseFloat(formData.totalPrice) || 0,
      notes: formData.notes || undefined,
      timestamp: new Date().toISOString(),
      status: "New",
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    try {
      // Submit the order to Firebase
      // Note: In a real implementation, we would collect the actual File objects
      // and upload them to Firebase Storage. For this demo, we're just using the attachments as is.
      await addOrder(newOrder, []);

      // Also notify the parent component
      onOrderSubmit(newOrder);

      // Reset form
      setFormData({
        customerName: "",
        street: "",
        city: "",
        phoneNumber: "",
        totalPrice: "",
        notes: "",
      });

      // Clear attachments
      attachments.forEach((attachment) => {
        if (attachment.type === "image" && attachment.url !== "#") {
          URL.revokeObjectURL(attachment.url);
        }
      });
      setAttachments([]);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting order:", error);
      // You could add error handling UI here
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Нова Нарачка</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Име и Презиме</Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Јован Јовановски"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Улица и број</Label>
              <Input
                id="street"
                name="street"
                placeholder="Партизанска 15"
                value={formData.street}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Град</Label>
              <Input
                id="city"
                name="city"
                placeholder="Скопје"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Телефонски број</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="070 123 456"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPrice">Цена (во денари)</Label>
              <Input
                id="totalPrice"
                name="totalPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="1500"
                value={formData.totalPrice}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Забелешки (по желба)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Посебни инструкции за достава..."
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Прикачи фајлови</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Додади фајлови
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.zip"
                />
              </div>

              {attachments.length > 0 && (
                <ScrollArea className="h-[120px] w-full border rounded-md p-2 mt-2">
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="relative group">
                        {attachment.type === "image" ? (
                          <div className="w-20 h-20 rounded-md overflow-hidden border border-border">
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-md flex flex-col items-center justify-center bg-muted border border-border p-1">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <p className="text-xs text-center truncate w-full">
                              {attachment.name}
                            </p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Откажи
            </Button>
            <Button type="submit">Поднеси Нарачка</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewOrderForm;
