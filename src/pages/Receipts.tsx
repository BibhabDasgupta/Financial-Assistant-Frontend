import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Receipts() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const receipts = [
    {
      id: 1,
      name: "grocery-receipt.pdf",
      date: "2025-10-07",
      status: "processed",
      amount: 145.32,
    },
    {
      id: 2,
      name: "restaurant-bill.jpg",
      date: "2025-10-05",
      status: "processing",
      amount: null,
    },
    {
      id: 3,
      name: "gas-station.pdf",
      date: "2025-10-03",
      status: "processed",
      amount: 67.8,
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload logic here
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Receipt Scanner</h1>
        <p className="text-muted-foreground">
          Upload receipts for automatic expense extraction using OCR
        </p>
      </div>

      {/* Upload Area */}
      <Card className="glass-card shadow-card">
        <CardContent className="pt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              multiple
            />
            <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">
              Drop your receipts here
            </h3>
            <p className="text-muted-foreground mb-4">
              or click to browse (PDF, JPG, PNG)
            </p>
            <Button className="gradient-primary shadow-glow">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium group-hover:text-primary transition-colors">
                      {receipt.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(receipt.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {receipt.status === "processed" ? (
                    <>
                      <div className="text-right hidden md:block">
                        <div className="font-semibold">
                          ${receipt.amount?.toFixed(2)}
                        </div>
                      </div>
                      <Badge className="bg-success/20 text-success border-success/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Processed
                      </Badge>
                    </>
                  ) : (
                    <Badge className="bg-primary/20 text-primary border-primary/20">
                      <Clock className="w-3 h-3 mr-1" />
                      Processing
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
