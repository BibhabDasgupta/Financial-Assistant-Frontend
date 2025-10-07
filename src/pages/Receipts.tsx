// import { useState, useRef, useEffect } from "react";
// import { Upload, FileText, CheckCircle, Clock, X, Loader2, Eye, RefreshCw, AlertCircle, Image, FileIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { receiptApi, transactionApi, categoryApi } from "@/services/transactService";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Progress } from "@/components/ui/progress";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// interface Receipt {
//   id: string;
//   filename: string;
//   status: 'processing' | 'completed' | 'failed';
//   file_type: string;
//   extracted_data?: {
//     merchant?: string;
//     amount?: number;
//     date?: string;
//     suggested_category?: string;
//     confidence?: number;
//     items?: Array<{ description: string; amount: number }>;
//     tax?: number;
//   };
//   confidence_score?: number;
//   error_message?: string;
//   created_at: string;
// }

// interface Category {
//   id: string;
//   name: string;
//   type: 'income' | 'expense';
// }

// export default function Receipts() {
//   const { toast } = useToast();
//   const [isDragging, setIsDragging] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [receipts, setReceipts] = useState<Receipt[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
//   const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
//   const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

//   // Transaction form
//   const [transactionForm, setTransactionForm] = useState({
//     type: 'expense' as 'income' | 'expense',
//     amount: '',
//     description: '',
//     date: new Date().toISOString().split('T')[0],
//     category_id: '',
//     notes: '',
//   });

//   // Fetch receipts
//   const fetchReceipts = async (silent = false) => {
//     try {
//       if (!silent) setLoading(true);
//       const response = await receiptApi.getAll();
//       setReceipts(response.data.data);
//     } catch (error: any) {
//       if (!silent) {
//         toast({
//           title: "Error fetching receipts",
//           description: error.response?.data?.error?.message || "Something went wrong",
//           variant: "destructive",
//         });
//       }
//     } finally {
//       if (!silent) setLoading(false);
//     }
//   };

//   // Check status of specific receipt
//   const checkReceiptStatus = async (receiptId: string) => {
//     try {
//       const response = await receiptApi.getStatus(receiptId);
//       const status = response.data.data;

//       setReceipts(prev => 
//         prev.map(r => r.id === receiptId ? { ...r, ...status } : r)
//       );

//       if (status.status === 'completed') {
//         const confidence = status.confidence_score || 0;
//         const confidenceLevel = confidence >= 80 ? 'High' : confidence >= 60 ? 'Medium' : 'Low';
        
//         toast({
//           title: "Receipt processed!",
//           description: `${status.extracted_data?.merchant || 'Receipt'} - $${status.extracted_data?.amount?.toFixed(2) || '0.00'} (${confidenceLevel} confidence)`,
//         });
//       } else if (status.status === 'failed') {
//         toast({
//           title: "Processing failed",
//           description: status.error_message || "Could not extract data from receipt",
//           variant: "destructive",
//         });
//       }

//       return status;
//     } catch (error: any) {
//       console.error('Error checking receipt status:', error);
//     }
//   };

//   // Polling logic
//   const startPolling = () => {
//     if (pollingIntervalRef.current) {
//       clearInterval(pollingIntervalRef.current);
//     }

//     pollingIntervalRef.current = setInterval(async () => {
//       const processingReceipts = receipts.filter(r => r.status === 'processing');
      
//       if (processingReceipts.length === 0) {
//         if (pollingIntervalRef.current) {
//           clearInterval(pollingIntervalRef.current);
//           pollingIntervalRef.current = null;
//         }
//         return;
//       }

//       for (const receipt of processingReceipts) {
//         await checkReceiptStatus(receipt.id);
//       }
//     }, 3000);
//   };

//   useEffect(() => {
//     return () => {
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const hasProcessing = receipts.some(r => r.status === 'processing');
    
//     if (hasProcessing && !pollingIntervalRef.current) {
//       startPolling();
//     } else if (!hasProcessing && pollingIntervalRef.current) {
//       clearInterval(pollingIntervalRef.current);
//       pollingIntervalRef.current = null;
//     }
//   }, [receipts]);

//   // Fetch categories
//   const fetchCategories = async () => {
//     try {
//       const response = await categoryApi.getAll('expense');
//       setCategories(response.data.data);
//     } catch (error: any) {
//       toast({
//         title: "Error fetching categories",
//         description: error.response?.data?.error?.message || "Failed to load categories",
//         variant: "destructive",
//       });
//     }
//   };

//   useEffect(() => {
//     fetchReceipts();
//     fetchCategories();
//   }, []);

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => {
//     setIsDragging(false);
//   };

//   const handleDrop = async (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);

//     const files = Array.from(e.dataTransfer.files);
//     await handleFileUpload(files);
//   };

//   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files ? Array.from(e.target.files) : [];
//     await handleFileUpload(files);
//   };

//   const handleFileUpload = async (files: File[]) => {
//     if (files.length === 0) return;

//     const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic'];
//     const validPDFType = 'application/pdf';
//     const maxSize = 10 * 1024 * 1024;

//     for (const file of files) {
//       const isValidImage = validImageTypes.includes(file.type);
//       const isValidPDF = file.type === validPDFType;

//       if (!isValidImage && !isValidPDF) {
//         toast({
//           title: "Invalid file type",
//           description: `${file.name} must be an image (JPG, PNG, HEIC) or PDF`,
//           variant: "destructive",
//         });
//         continue;
//       }

//       if (file.size > maxSize) {
//         toast({
//           title: "File too large",
//           description: `${file.name} exceeds 10MB limit`,
//           variant: "destructive",
//         });
//         continue;
//       }

//       try {
//         setUploading(true);
//         const response = await receiptApi.upload(file);
        
//         const fileType = isValidPDF ? 'PDF' : 'Image';
//         toast({
//           title: `${fileType} receipt uploaded`,
//           description: "Analyzing with Gemini AI... This may take 10-30 seconds.",
//         });

//         const newReceipt = response.data.data;
//         setReceipts(prev => [newReceipt, ...prev]);

//         setTimeout(() => {
//           checkReceiptStatus(newReceipt.id);
//         }, 2000);

//       } catch (error: any) {
//         toast({
//           title: "Upload failed",
//           description: error.response?.data?.error?.message || "Failed to upload receipt",
//           variant: "destructive",
//         });
//       } finally {
//         setUploading(false);
//       }
//     }

//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this receipt?")) return;

//     try {
//       await receiptApi.delete(id);
//       toast({ title: "Receipt deleted successfully" });
//       fetchReceipts();
//     } catch (error: any) {
//       toast({
//         title: "Error deleting receipt",
//         description: error.response?.data?.error?.message || "Something went wrong",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleViewDetails = (receipt: Receipt) => {
//     setSelectedReceipt(receipt);
//     setIsDetailDialogOpen(true);
//   };

//   const handleCreateTransaction = (receipt: Receipt) => {
//     if (receipt.extracted_data) {
//       const suggestedCategory = categories.find(
//         c => c.name.toLowerCase() === receipt.extracted_data?.suggested_category?.toLowerCase()
//       );

//       setTransactionForm({
//         type: 'expense',
//         amount: receipt.extracted_data.amount?.toString() || '',
//         description: receipt.extracted_data.merchant || 'Receipt expense',
//         date: receipt.extracted_data.date || new Date().toISOString().split('T')[0],
//         category_id: suggestedCategory?.id || '',
//         notes: `Created from receipt: ${receipt.filename}`,
//       });
//     }
//     setSelectedReceipt(receipt);
//     setIsTransactionDialogOpen(true);
//   };

//   const handleSubmitTransaction = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const data = {
//         ...transactionForm,
//         amount: parseFloat(transactionForm.amount),
//       };

//       await transactionApi.create(data);
      
//       toast({ 
//         title: "Transaction created",
//         description: "Successfully created transaction from receipt"
//       });

//       setIsTransactionDialogOpen(false);
//       setSelectedReceipt(null);
//     } catch (error: any) {
//       toast({
//         title: "Error creating transaction",
//         description: error.response?.data?.error?.message || "Something went wrong",
//         variant: "destructive",
//       });
//     }
//   };

//   const getConfidenceBadge = (confidence: number) => {
//     if (confidence >= 80) {
//       return <Badge className="bg-success/20 text-success">High Confidence</Badge>;
//     } else if (confidence >= 60) {
//       return <Badge className="bg-warning/20 text-warning">Medium Confidence</Badge>;
//     } else {
//       return <Badge className="bg-destructive/20 text-destructive">Low Confidence</Badge>;
//     }
//   };

//   const getFileIcon = (fileType: string) => {
//     if (fileType === 'application/pdf') {
//       return <FileText className="w-5 h-5 text-red-500" />;
//     }
//     return <Image className="w-5 h-5 text-blue-500" />;
//   };

//   const getFileTypeBadge = (fileType: string) => {
//     if (fileType === 'application/pdf') {
//       return <Badge variant="outline" className="text-xs">PDF</Badge>;
//     }
//     return <Badge variant="outline" className="text-xs">Image</Badge>;
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold mb-2">Receipt Scanner</h1>
//           <p className="text-muted-foreground">
//             Upload receipt images or PDFs for automatic AI extraction
//           </p>
//         </div>
//         <Button variant="outline" onClick={() => fetchReceipts()} disabled={loading}>
//           <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
//           Refresh
//         </Button>
//       </div>

//       {/* Processing Info Alert */}
//       {receipts.some(r => r.status === 'processing') && (
//         <Alert className="border-primary/50 bg-primary/5">
//           <Loader2 className="h-4 w-4 animate-spin" />
//           <AlertTitle>AI Processing in progress</AlertTitle>
//           <AlertDescription>
//             {receipts.filter(r => r.status === 'processing').length} receipt(s) are being analyzed by Gemini AI. 
//             This typically takes 10-30 seconds per receipt for accurate extraction.
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* Upload Area */}
//       <Card className="glass-card shadow-card">
//         <CardContent className="pt-6">
//           <div
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//             onClick={() => !uploading && fileInputRef.current?.click()}
//             className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
//               isDragging
//                 ? "border-primary bg-primary/5 shadow-glow"
//                 : "border-border hover:border-primary/50 hover:bg-primary/5"
//             } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
//           >
//             <input
//               ref={fileInputRef}
//               type="file"
//               className="hidden"
//               accept="image/*,application/pdf"
//               multiple
//               onChange={handleFileSelect}
//               disabled={uploading}
//             />
//             {uploading ? (
//               <>
//                 <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
//                 <h3 className="text-lg font-semibold mb-2">Uploading...</h3>
//                 <p className="text-muted-foreground">Please wait</p>
//               </>
//             ) : (
//               <>
//                 <div className="flex items-center justify-center gap-4 mb-4">
//                   <Image className="w-10 h-10 text-primary" />
//                   <FileText className="w-10 h-10 text-primary" />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">
//                   Drop receipt images or PDFs here
//                 </h3>
//                 <p className="text-muted-foreground mb-2">
//                   or click to browse
//                 </p>
//                 <p className="text-sm text-muted-foreground mb-4">
//                   Supports: JPG, PNG, HEIC images and PDF files (Max 10MB)
//                 </p>
//                 <div className="flex items-center justify-center gap-2 mb-4">
//                   <Badge variant="outline" className="text-xs">
//                     <Image className="w-3 h-3 mr-1" />
//                     Receipt Images
//                   </Badge>
//                   <Badge variant="outline" className="text-xs">
//                     <FileText className="w-3 h-3 mr-1" />
//                     PDF Receipts
//                   </Badge>
//                 </div>
//                 <Button className="gradient-primary shadow-glow">
//                   <Upload className="w-4 h-4 mr-2" />
//                   Choose Files
//                 </Button>
//                 <p className="text-xs text-muted-foreground mt-4">
//                   Powered by Gemini AI for accurate extraction
//                 </p>
//               </>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Receipts List */}
//       <Card className="glass-card shadow-card">
//         <CardHeader>
//           <CardTitle className="flex items-center justify-between">
//             <span>Recent Uploads ({receipts.length})</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="flex justify-center items-center py-12">
//               <Loader2 className="w-8 h-8 animate-spin text-primary" />
//             </div>
//           ) : receipts.length === 0 ? (
//             <div className="text-center py-12 text-muted-foreground">
//               <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
//               <p>No receipts uploaded yet</p>
//               <p className="text-sm mt-2">Upload your first receipt to get started</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {receipts.map((receipt) => (
//                 <div
//                   key={receipt.id}
//                   className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-200 group"
//                 >
//                   <div className="flex items-center gap-4 flex-1">
//                     <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
//                       {receipt.status === 'processing' ? (
//                         <Loader2 className="w-5 h-5 text-primary animate-spin" />
//                       ) : receipt.status === 'failed' ? (
//                         <AlertCircle className="w-5 h-5 text-destructive" />
//                       ) : (
//                         getFileIcon(receipt.file_type)
//                       )}
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2">
//                         <div className="font-medium group-hover:text-primary transition-colors">
//                           {receipt.filename}
//                         </div>
//                         {getFileTypeBadge(receipt.file_type)}
//                       </div>
//                       <div className="text-sm text-muted-foreground">
//                         {new Date(receipt.created_at).toLocaleDateString()}
//                       </div>
//                       {receipt.status === 'completed' && receipt.extracted_data && (
//                         <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
//                           {receipt.extracted_data.merchant && (
//                             <span>📍 {receipt.extracted_data.merchant}</span>
//                           )}
//                           {receipt.confidence_score && getConfidenceBadge(receipt.confidence_score)}
//                         </div>
//                       )}
//                       {receipt.status === 'failed' && receipt.error_message && (
//                         <div className="text-xs text-destructive mt-1">
//                           ❌ {receipt.error_message}
//                         </div>
//                       )}
//                       {receipt.status === 'processing' && (
//                         <div className="mt-2">
//                           <Progress value={33} className="h-1" />
//                           <p className="text-xs text-muted-foreground mt-1">
//                             Analyzing with Gemini AI...
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     {receipt.status === "completed" ? (
//                       <>
//                         {receipt.extracted_data?.amount && (
//                           <div className="text-right hidden md:block">
//                             <div className="font-semibold text-lg">
//                               ${receipt.extracted_data.amount.toFixed(2)}
//                             </div>
//                           </div>
//                         )}
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleViewDetails(receipt)}
//                         >
//                           <Eye className="w-4 h-4 mr-1" />
//                           Details
//                         </Button>
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={() => handleCreateTransaction(receipt)}
//                           className="hidden md:inline-flex"
//                         >
//                           Create Transaction
//                         </Button>
//                       </>
//                     ) : receipt.status === "processing" ? (
//                       <Badge className="bg-primary/20 text-primary border-primary/20">
//                         <Clock className="w-3 h-3 mr-1" />
//                         Processing...
//                       </Badge>
//                     ) : (
//                       <Badge className="bg-destructive/20 text-destructive border-destructive/20">
//                         <X className="w-3 h-3 mr-1" />
//                         Failed
//                       </Badge>
//                     )}
//                     <Button 
//                       variant="ghost" 
//                       size="icon" 
//                       className="text-destructive"
//                       onClick={() => handleDelete(receipt.id)}
//                     >
//                       <X className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Receipt Details Dialog */}
//       <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
//         <DialogContent className="glass-card max-w-md max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Receipt Details</DialogTitle>
//             <DialogDescription>
//               Information extracted by Gemini AI
//             </DialogDescription>
//           </DialogHeader>
//           {selectedReceipt && selectedReceipt.extracted_data && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label className="text-muted-foreground">File Type</Label>
//                 {getFileTypeBadge(selectedReceipt.file_type)}
//               </div>
//               <div>
//                 <Label className="text-muted-foreground">Merchant</Label>
//                 <p className="font-medium">
//                   {selectedReceipt.extracted_data.merchant || 'Not detected'}
//                 </p>
//               </div>
//               <div>
//                 <Label className="text-muted-foreground">Amount</Label>
//                 <p className="font-medium text-2xl">
//                   ${selectedReceipt.extracted_data.amount?.toFixed(2) || '0.00'}
//                 </p>
//               </div>
//               <div>
//                 <Label className="text-muted-foreground">Date</Label>
//                 <p className="font-medium">
//                   {selectedReceipt.extracted_data.date 
//                     ? new Date(selectedReceipt.extracted_data.date).toLocaleDateString()
//                     : 'Not detected'}
//                 </p>
//               </div>
//               {selectedReceipt.extracted_data.tax && (
//                 <div>
//                   <Label className="text-muted-foreground">Tax</Label>
//                   <p className="font-medium">
//                     ${selectedReceipt.extracted_data.tax.toFixed(2)}
//                   </p>
//                 </div>
//               )}
//               <div>
//                 <Label className="text-muted-foreground">Suggested Category</Label>
//                 <Badge variant="outline" className="mt-1">
//                   {selectedReceipt.extracted_data.suggested_category || 'Other Expenses'}
//                 </Badge>
//               </div>
//               {selectedReceipt.extracted_data.items && selectedReceipt.extracted_data.items.length > 0 && (
//                 <div>
//                   <Label className="text-muted-foreground">Line Items ({selectedReceipt.extracted_data.items.length})</Label>
//                   <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
//                     {selectedReceipt.extracted_data.items.map((item, idx) => (
//                       <div key={idx} className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">{item.description}</span>
//                         <span className="font-medium">${item.amount.toFixed(2)}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//               <div>
//                 <Label className="text-muted-foreground">AI Confidence Score</Label>
//                 <div className="flex items-center gap-2 mt-1">
//                   <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
//                     <div 
//                       className={`h-full transition-all ${
//                         (selectedReceipt.confidence_score || 0) >= 80 
//                           ? 'bg-success'
//                           : (selectedReceipt.confidence_score || 0) >= 60
//                             ? 'bg-warning'
//                             : 'bg-destructive'
//                       }`}
//                       style={{ width: `${selectedReceipt.confidence_score || 0}%` }}
//                     />
//                   </div>
//                   <span className="text-sm font-medium">
//                     {selectedReceipt.confidence_score || 0}%
//                   </span>
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   {(selectedReceipt.confidence_score || 0) < 60 
//                     ? 'Please review and correct the extracted data before creating a transaction.'
//                     : 'Confidence is good. Data should be accurate.'}
//                 </p>
//               </div>
//               <Button 
//                 className="w-full mt-4"
//                 onClick={() => {
//                   setIsDetailDialogOpen(false);
//                   handleCreateTransaction(selectedReceipt);
//                 }}
//               >
//                 Create Transaction
//               </Button>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Create Transaction Dialog */}
//       <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
//         <DialogContent className="glass-card max-w-md">
//           <DialogHeader>
//             <DialogTitle>Create Transaction</DialogTitle>
//             <DialogDescription>
//               Review and adjust the AI-extracted data
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleSubmitTransaction} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="category">Category</Label>
//               <Select
//                 value={transactionForm.category_id}
//                 onValueChange={(value) => 
//                   setTransactionForm({ ...transactionForm, category_id: value })
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categories.map(cat => (
//                     <SelectItem key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="amount">Amount</Label>
//               <Input
//                 id="amount"
//                 type="number"
//                 step="0.01"
//                 min="0.01"
//                 value={transactionForm.amount}
//                 onChange={(e) => 
//                   setTransactionForm({ ...transactionForm, amount: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="description">Description</Label>
//               <Input
//                 id="description"
//                 value={transactionForm.description}
//                 onChange={(e) => 
//                   setTransactionForm({ ...transactionForm, description: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="date">Date</Label>
//               <Input
//                 id="date"
//                 type="date"
//                 value={transactionForm.date}
//                 onChange={(e) => 
//                   setTransactionForm({ ...transactionForm, date: e.target.value })
//                 }
//                 max={new Date().toISOString().split('T')[0]}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="notes">Notes</Label>
//               <Textarea
//                 id="notes"
//                 value={transactionForm.notes}
//                 onChange={(e) => 
//                   setTransactionForm({ ...transactionForm, notes: e.target.value })
//                 }
//                 rows={3}
//               />
//             </div>

//             <div className="flex gap-3">
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="flex-1"
//                 onClick={() => setIsTransactionDialogOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" className="flex-1">
//                 Create Transaction
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }




import { useState, useRef, useEffect } from "react";
import { Upload, FileText, CheckCircle, X, Loader2, Eye, RefreshCw, AlertCircle, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { receiptApi, transactionApi, categoryApi } from "@/services/transactService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Receipt {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  file_type: string;
  extracted_data?: {
    merchant?: string;
    amount?: number;
    date?: string;
    suggested_category?: string;
    items?: Array<{ description: string; amount: number }>;
    tax?: number;
  };
  confidence_score?: number;
  error_message?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

export default function Receipts() {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transaction form
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    notes: '',
  });

  // Fetch receipts
  const fetchReceipts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await receiptApi.getAll();
      setReceipts(response.data.data);
    } catch (error: any) {
      if (!silent) {
        toast({
          title: "Error fetching receipts",
          description: error.response?.data?.error?.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll('expense');
      setCategories(response.data.data);
    } catch (error: any) {
      toast({
        title: "Error fetching categories",
        description: error.response?.data?.error?.message || "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchCategories();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFileUpload(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    await handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic'];
    const validPDFType = 'application/pdf';
    const maxSize = 10 * 1024 * 1024;

    for (const file of files) {
      const isValidImage = validImageTypes.includes(file.type);
      const isValidPDF = file.type === validPDFType;

      if (!isValidImage && !isValidPDF) {
        toast({
          title: "Invalid file type",
          description: `${file.name} must be an image (JPG, PNG, HEIC) or PDF`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        continue;
      }

      try {
        setUploading(true);
        
        const fileType = isValidPDF ? 'PDF' : 'Image';
        toast({
          title: "Processing receipt",
          description: `Uploading and analyzing ${file.name} with Gemini AI... This may take 10-30 seconds.`,
        });

        // Upload and process - this now happens synchronously
        const response = await receiptApi.upload(file);
        const newReceipt = response.data.data;

        // Receipt is already processed - add to list
        setReceipts(prev => [newReceipt, ...prev]);

        // Show result
        if (newReceipt.status === 'completed') {
          const confidence = newReceipt.confidence_score || 0;
          const confidenceLevel = confidence >= 80 ? 'High' : confidence >= 60 ? 'Medium' : 'Low';
          
          toast({
            title: "Receipt processed successfully!",
            description: `${newReceipt.extracted_data?.merchant || 'Receipt'} - $${newReceipt.extracted_data?.amount?.toFixed(2) || '0.00'} (${confidenceLevel} confidence)`,
          });
        } else if (newReceipt.status === 'failed') {
          toast({
            title: "Processing failed",
            description: newReceipt.error_message || "Could not extract data from receipt",
            variant: "destructive",
          });
        }

      } catch (error: any) {
        toast({
          title: "Upload failed",
          description: error.response?.data?.error?.message || "Failed to upload receipt",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this receipt?")) return;

    try {
      await receiptApi.delete(id);
      toast({ title: "Receipt deleted successfully" });
      fetchReceipts();
    } catch (error: any) {
      toast({
        title: "Error deleting receipt",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleReprocess = async (id: string) => {
    try {
      toast({
        title: "Reprocessing receipt",
        description: "Analyzing with Gemini AI...",
      });

      const response = await receiptApi.reprocess(id);
      const updatedReceipt = response.data.data;

      setReceipts(prev => prev.map(r => r.id === id ? updatedReceipt : r));

      if (updatedReceipt.status === 'completed') {
        const confidence = updatedReceipt.confidence_score || 0;
        const confidenceLevel = confidence >= 80 ? 'High' : confidence >= 60 ? 'Medium' : 'Low';
        
        toast({
          title: "Receipt reprocessed successfully!",
          description: `${updatedReceipt.extracted_data?.merchant || 'Receipt'} - $${updatedReceipt.extracted_data?.amount?.toFixed(2) || '0.00'} (${confidenceLevel} confidence)`,
        });
      } else if (updatedReceipt.status === 'failed') {
        toast({
          title: "Reprocessing failed",
          description: updatedReceipt.error_message || "Could not extract data from receipt",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Reprocess failed",
        description: error.response?.data?.error?.message || "Failed to reprocess receipt",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsDetailDialogOpen(true);
  };

  const handleCreateTransaction = (receipt: Receipt) => {
    if (receipt.extracted_data) {
      const suggestedCategory = categories.find(
        c => c.name.toLowerCase() === receipt.extracted_data?.suggested_category?.toLowerCase()
      );

      setTransactionForm({
        type: 'expense',
        amount: receipt.extracted_data.amount?.toString() || '',
        description: receipt.extracted_data.merchant || 'Receipt expense',
        date: receipt.extracted_data.date || new Date().toISOString().split('T')[0],
        category_id: suggestedCategory?.id || '',
        notes: `Created from receipt: ${receipt.filename}`,
      });
    }
    setSelectedReceipt(receipt);
    setIsTransactionDialogOpen(true);
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
      };

      await transactionApi.create(data);
      
      toast({ 
        title: "Transaction created",
        description: "Successfully created transaction from receipt"
      });

      setIsTransactionDialogOpen(false);
      setSelectedReceipt(null);
    } catch (error: any) {
      toast({
        title: "Error creating transaction",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) {
      return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">High Confidence</Badge>;
    } else if (confidence >= 60) {
      return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Medium Confidence</Badge>;
    } else {
      return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">Low Confidence</Badge>;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <Image className="w-5 h-5 text-blue-500" />;
  };

  const getFileTypeBadge = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <Badge variant="outline" className="text-xs">PDF</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Image</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Receipt Scanner</h1>
          <p className="text-muted-foreground">
            Upload receipt images or PDFs for instant AI extraction
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchReceipts()} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Upload Area */}
      <Card className="glass-card shadow-card">
        <CardContent className="pt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                <h3 className="text-lg font-semibold mb-2">Processing with Gemini AI...</h3>
                <p className="text-muted-foreground">This may take 10-30 seconds</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Image className="w-10 h-10 text-primary" />
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Drop receipt images or PDFs here
                </h3>
                <p className="text-muted-foreground mb-2">
                  or click to browse
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports: JPG, PNG, HEIC images and PDF files (Max 10MB)
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    <Image className="w-3 h-3 mr-1" />
                    Receipt Images
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    PDF Receipts
                  </Badge>
                </div>
                <Button className="gradient-primary shadow-glow">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Powered by Gemini AI for instant, accurate extraction
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Uploads ({receipts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No receipts uploaded yet</p>
              <p className="text-sm mt-2">Upload your first receipt to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      {receipt.status === 'failed' ? (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      ) : receipt.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        getFileIcon(receipt.file_type)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium group-hover:text-primary transition-colors">
                          {receipt.filename}
                        </div>
                        {getFileTypeBadge(receipt.file_type)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(receipt.created_at).toLocaleDateString()}
                      </div>
                      {receipt.status === 'completed' && receipt.extracted_data && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          {receipt.extracted_data.merchant && (
                            <span>📍 {receipt.extracted_data.merchant}</span>
                          )}
                          {receipt.confidence_score !== undefined && getConfidenceBadge(receipt.confidence_score)}
                        </div>
                      )}
                      {receipt.status === 'failed' && receipt.error_message && (
                        <div className="text-xs text-destructive mt-1">
                          ❌ {receipt.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {receipt.status === "completed" ? (
                      <>
                        {receipt.extracted_data?.amount && (
                          <div className="text-right hidden md:block">
                            <div className="font-semibold text-lg">
                              ${receipt.extracted_data.amount.toFixed(2)}
                            </div>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(receipt)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleCreateTransaction(receipt)}
                          className="hidden md:inline-flex"
                        >
                          Create Transaction
                        </Button>
                      </>
                    ) : receipt.status === "failed" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReprocess(receipt.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                        <Badge className="bg-destructive/20 text-destructive border-destructive/20">
                          <X className="w-3 h-3 mr-1" />
                          Failed
                        </Badge>
                      </>
                    ) : null}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDelete(receipt.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="glass-card max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
            <DialogDescription>
              Information extracted by Gemini AI
            </DialogDescription>
          </DialogHeader>
          {selectedReceipt && selectedReceipt.extracted_data && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">File Type</Label>
                {getFileTypeBadge(selectedReceipt.file_type)}
              </div>
              <div>
                <Label className="text-muted-foreground">Merchant</Label>
                <p className="font-medium">
                  {selectedReceipt.extracted_data.merchant || 'Not detected'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="font-medium text-2xl">
                  ${selectedReceipt.extracted_data.amount?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p className="font-medium">
                  {selectedReceipt.extracted_data.date 
                    ? new Date(selectedReceipt.extracted_data.date).toLocaleDateString()
                    : 'Not detected'}
                </p>
              </div>
              {selectedReceipt.extracted_data.tax && (
                <div>
                  <Label className="text-muted-foreground">Tax</Label>
                  <p className="font-medium">
                    ${selectedReceipt.extracted_data.tax.toFixed(2)}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Suggested Category</Label>
                <Badge variant="outline" className="mt-1">
                  {selectedReceipt.extracted_data.suggested_category || 'Other Expenses'}
                </Badge>
              </div>
              {selectedReceipt.extracted_data.items && selectedReceipt.extracted_data.items.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Line Items ({selectedReceipt.extracted_data.items.length})</Label>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {selectedReceipt.extracted_data.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.description}</span>
                        <span className="font-medium">${item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedReceipt.confidence_score !== undefined && (
                <div>
                  <Label className="text-muted-foreground">AI Confidence Score</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          selectedReceipt.confidence_score >= 80 
                            ? 'bg-green-500'
                            : selectedReceipt.confidence_score >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedReceipt.confidence_score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {selectedReceipt.confidence_score}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedReceipt.confidence_score < 60 
                      ? 'Please review and correct the extracted data before creating a transaction.'
                      : 'Confidence is good. Data should be accurate.'}
                  </p>
                </div>
              )}
              <Button 
                className="w-full mt-4"
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  handleCreateTransaction(selectedReceipt);
                }}
              >
                Create Transaction
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Create Transaction</DialogTitle>
            <DialogDescription>
              Review and adjust the AI-extracted data
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTransaction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={transactionForm.category_id}
                onValueChange={(value) => 
                  setTransactionForm({ ...transactionForm, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={transactionForm.amount}
                onChange={(e) => 
                  setTransactionForm({ ...transactionForm, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={transactionForm.description}
                onChange={(e) => 
                  setTransactionForm({ ...transactionForm, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={transactionForm.date}
                onChange={(e) => 
                  setTransactionForm({ ...transactionForm, date: e.target.value })
                }
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={transactionForm.notes}
                onChange={(e) => 
                  setTransactionForm({ ...transactionForm, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsTransactionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Transaction
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}