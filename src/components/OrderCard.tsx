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
  Printer,
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
  trackingCode?: string;
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
  trackingCode,
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

  const handlePrint = () => {
    // Use trackingCode (InPosta КОД) if available, otherwise show placeholder
    const trackingNumber = trackingCode || 'Нема КОД';
    const barcodeUrl = trackingCode
      ? `https://bwipjs-api.metafloor.com/?bcid=code128&text=${trackingNumber}`
      : '';

    // Asset URLs (public folder)
    const staticHeaderUrl = "/staticlabel.png";
    const inpostaLogoUrl = "/inpostalogo.jpg";
    const icon1Url = "/icon1.png";
    const icon2Url = "/icon2.png";
    const icon3Url = "/icon3.png";
    const icon4Url = "/icon4.png";
    const qrCodeUrl = "/QRCODE.png";
    const skolaSansRegularWoff2 = '/SkolaSans.woff2';
    const skolaSansRegularWoff = '/SkolaSans.woff';
    const skolaSansBoldWoff2 = '/SkolaSans-Bold.woff2';
    const skolaSansBoldWoff = '/SkolaSans-Bold.woff';

    // Sender info (static for now)
    const senderName = "CNC Decorates - Струмица";
    const senderPhone = "078915725";
    const senderAddress = "ул. 'Стево Филиповиќ' бр. 2/1-5, 1000 Скопје, Македонија";
    const senderCompany = "ИН ПОШТА - сигурна пратка";
    const senderCompanyInfo = "3 112 068 / 076 444 555 / 078 498 403";

    // Print content
    const content = `
      <html>
        <head>
          <title>Пратка #${trackingNumber}</title>
          <style>
            /* IMPORTANT: In the print dialog, set margins to 'None' and uncheck 'Headers and footers' for best results */
            @page { margin: 0; }
            html, body {
              font-family: Arial, sans-serif !important;
              margin: 0;
              padding: 0;
              background: #fff;
              width: 100vw;
              height: 100vh;
            }
            .print-container {
              max-width: 900px;
              width: 100%;
              margin: 0 auto;
              height: auto;
              max-height: 95vh;
              overflow: hidden;
              padding: 0;
              page-break-inside: avoid;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
            }
            .static-header {
              width: 100%;
              max-width: 900px;
              height: auto;
              display: block;
              margin: 0 auto 6px auto;
            }
            .main-label {
              width: 100%;
              max-width: 900px;
              margin: 0 auto;
              display: flex;
              flex-direction: row;
              margin-top: 6px;
              page-break-inside: avoid;
              font-size: 13px;
            }
            .label-left {
              flex: 1;
              padding: 2px 4px;
              font-size: 13px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .barcode {
              margin: 10px 0 0 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .barcode img {
              height: 70px;
              width: 300px;
              object-fit: contain;
              margin-bottom: 6px;
            }
            .tracking-label {
              font-size: 1.1em;
              font-weight: bold;
              margin-top: 8px;
              letter-spacing: 1px;
            }
            .tracking-number {
              font-size: 1.5em;
              font-weight: bold;
              margin-top: 2px;
              letter-spacing: 2px;
            }
            .small { font-size: 0.85em; }
            .label-center {
              flex: 1.2;
              padding: 2px 4px;
              border-left: 1px solid #ccc;
              border-right: 1px solid #ccc;
              font-size: 13px;
            }
            .label-right {
              flex: 1;
              padding: 2px 4px;
              font-size: 13px;
            }
            .label-right .bolded {
              font-weight: bold;
            }
            .inposta-logo { height: 40px; margin-bottom: 8px; }
            .underline { border-bottom: 1px solid #000; display: inline-block; min-width: 80px; }
            .mt-2 { margin-top: 4px; }
            .mb-2 { margin-bottom: 4px; }
            h1, h2, h3, h4, h5, h6, b, strong {
              font-family: Arial, sans-serif;
              font-weight: 700;
            }
            @media print {
              html, body { margin: 0; padding: 0; }
              .print-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <img src="${staticHeaderUrl}" class="static-header" alt="Static Label Header" />
            <!-- Dynamic Bottom Section -->
            <div class="main-label">
              <div class="label-left">
                <img src="${inpostaLogoUrl}" class="inposta-logo" />
                <div class="small">ИН ПОШТА - сигурна пратка<br>${senderAddress}<br>${senderCompanyInfo}</div>
                <div class="barcode">
                  ${barcodeUrl ? `<img src="${barcodeUrl}" alt="Barcode" />` : '<div style="color:red;">Нема баркод</div>'}
                  <div class="tracking-label">КОД ЗА СЛЕДЕЊЕ</div>
                  <div class="tracking-number">${trackingNumber}</div>
                </div>
              </div>
              <div class="label-center">
                <div><b>Испраќач:</b></div>
                <div>Име: ${senderName}</div>
                <div>Телефон: ${senderPhone}</div>
                <div>Датум и време: ${format(new Date(timestamp), "dd/MM/yyyy - HH:mm", { locale: mk })}</div>
                <div>Повратен док.: Не</div>
                <div>Повратница: Не</div>
                <div>Бр. на пакети: 1/1</div>
                <div>Забелешка: ${notes || ''}</div>
              </div>
              <div class="label-right">
                <div><span class="bolded">${address.city}</span></div>
                <div>Примач: <span class="bolded">${customerName}</span></div>
                <div>Адреса: ${address.street}</div>
                <div>Град: <span class="bolded">${address.city}</span></div>
                <div>Телефон: <span class="bolded">${phoneNumber}</span></div>
                <div>Бр. на нарачка: #${order_number ? order_number.toString().padStart(2, '0') : '-'}</div>
                <div>Откуп: ${totalPrice.toLocaleString("mk-MK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ден.</div>
                <div>Поштарина: 150 ден. П-Г</div>
                <div>Вкупно П-Г: 150 ден.</div>
                <div class="small mt-2">Потврда од примач за извршена поштенска услуга<br />Потврдувам дека пратката е примена без никакви оштетувања и рекламации</div>
                <div class="signature mt-2">Име и презиме <span class="underline"></span><br />Датум __ / __ / ____ год. час __ / __<br />Потпис <span class="underline"></span></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Write the content to the new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.onload = function() {
      // Wait for fonts to load before printing
      if (printWindow.document.fonts && printWindow.document.fonts.ready) {
        printWindow.document.fonts.ready.then(() => {
          printWindow.print();
          printWindow.onafterprint = function() {
            printWindow.close();
          };
        });
      } else {
        printWindow.print();
        printWindow.onafterprint = function() {
          printWindow.close();
        };
      }
    };
  };

  // Debug log for trackingCode
  console.log('OrderCard trackingCode:', trackingCode, 'id:', id);

  console.log('OrderCard attachments:', attachments);

  return (
    <Card className="w-full mb-4 bg-white border-l-4 border-l-primary hover:shadow-md transition-shadow rounded-lg p-2 sm:p-4">
      {/* Collapsed View */}
      <CardHeader className="p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4 cursor-pointer" onClick={onToggleExpand}>
            <div>
              <div className="flex items-center gap-1 sm:gap-2">
                <h3 className={`text-base sm:text-lg font-semibold ${currentStatus === "Done" ? "line-through text-muted-foreground" : ""}`}>{customerName}</h3>
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
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Примена</span>
                  )}
                  {currentStatus === "Done" && (
                    <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Готова</span>
                  )}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{format(new Date(timestamp), "MMMM d - EEEE", { locale: mk })}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
            <div className="text-right mr-0 sm:mr-2">
              <span className={`font-bold ${currentStatus === "Accepted" ? "text-lg sm:text-2xl" : "text-base sm:text-lg"}`}>
                {totalPrice.toLocaleString("mk-MK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ден.
              </span>
            </div>
            {/* Action buttons: always show, full width on mobile */}
            {currentStatus !== "Done" && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {currentStatus !== "Accepted" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 px-2 py-1 w-full sm:w-auto"
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
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Show details only if status is Accepted */}
      {currentStatus === "Accepted" && (
        <>
          <Separator />
          <CardContent className="p-2 sm:p-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <div>
                <h4 className="font-bold mb-2 text-xl sm:text-2xl">Информации за нарачка</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 mr-3 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-lg sm:text-xl font-semibold">{address.street}</p>
                      <p className="text-lg sm:text-xl font-semibold">{address.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-6 w-6 mr-3 text-muted-foreground" />
                    <p className="text-lg sm:text-xl font-semibold">{phoneNumber}</p>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-6 w-6 mr-3 text-muted-foreground" />
                    <p className="text-lg sm:text-xl font-bold text-green-700">
                      {totalPrice.toLocaleString("mk-MK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ден.
                    </p>
                  </div>
                </div>
              </div>
              {notes && (
                <div>
                  <h4 className="font-bold mb-2 text-xl sm:text-2xl">Забелешки</h4>
                  <div className="flex items-start">
                    <FileText className="h-6 w-6 mr-3 mt-1 text-muted-foreground" />
                    <p className="text-lg sm:text-xl font-semibold">{notes}</p>
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
          <CardFooter className="p-2 sm:p-4 pt-0 flex justify-between items-center">
            <div className="flex space-x-2">
              <Badge variant="outline">{`Order #${order_number ?? id}`}</Badge>
            </div>
            {currentStatus === "Done" && trackingCode && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4" />
                Печати
              </Button>
            )}
            {currentStatus === "Done" && !trackingCode && (
              <span className="text-xs italic text-muted-foreground ml-2">Чекајте КОД од ИнПошта за печатење...</span>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default OrderCard;
