import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
    label: string;
    error?: string;
    optional?: boolean;
    className?: string;
    children: React.ReactNode;
}

export function FormField({ label, error, className, children }: FormFieldProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <Label className="flex items-center gap-1">
                {label}
            </Label>
            {children}
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        </div>
    );
}
