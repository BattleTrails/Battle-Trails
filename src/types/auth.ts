export type AuthMode = "login" | "register";

export type AuthInputsProps = {
    email: string;
    password: string;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
};

export type AuthButtonProps = {
    text: string;
    onClick: () => void;
    loading?: boolean;
};
export type AuthAlertProps = {
    message: string;
    onClose: () => void;
}

