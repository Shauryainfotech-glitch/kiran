import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTenderSchema, InsertTender } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { z } from "zod";

const formSchema = insertTenderSchema.extend({
  submissionDeadline: z.string().min(1, "Submission deadline is required"),
}).omit({ createdBy: true, status: true });

type FormData = z.infer<typeof formSchema>;

interface TenderFormProps {
  onSubmit: (data: InsertTender, asDraft: boolean) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<InsertTender>;
}

const categories = [
  "IT Services",
  "Construction",
  "Professional Services",
  "Supplies",
  "Marketing",
  "Consulting",
  "Maintenance",
  "Equipment",
];

export default function TenderForm({ onSubmit, onCancel, isLoading, initialData }: TenderFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      reference: initialData?.reference || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      estimatedValue: initialData?.estimatedValue || "",
      submissionDeadline: initialData?.submissionDeadline 
        ? new Date(initialData.submissionDeadline).toISOString().slice(0, 16)
        : "",
    },
  });

  const handleFormSubmit = (data: FormData, asDraft: boolean) => {
    const submissionData: InsertTender = {
      ...data,
      submissionDeadline: new Date(data.submissionDeadline),
      createdBy: 1, // Default user
      status: asDraft ? "draft" : "published",
    };
    onSubmit(submissionData, asDraft);
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tender Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tender title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference Number *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., TND-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estimatedValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Value</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="submissionDeadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Submission Deadline *</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  rows={4} 
                  placeholder="Enter tender description" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Upload Documents</label>
          <Card>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <input type="file" multiple className="hidden" />
                <Button type="button" variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={form.handleSubmit((data) => handleFormSubmit(data, true))}
            disabled={isLoading}
          >
            Save as Draft
          </Button>
          <Button 
            type="button"
            onClick={form.handleSubmit((data) => handleFormSubmit(data, false))}
            disabled={isLoading}
          >
            {isLoading ? "Publishing..." : "Publish Tender"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
