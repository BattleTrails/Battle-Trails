export type ForgeInputProps = {
    label: string;
    placeholder?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: "text" | "number" | "email";
    disabled?: boolean;
    textarea?: boolean;
    rows?: number;
    maxLength?: number;
}