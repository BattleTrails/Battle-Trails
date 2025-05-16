import {ForgeInputProps} from "@/types";
import clsx from "clsx";

const ForgeInput = ({label, placeholder, name, value, onChange, type = "text", disabled = false, textarea = false, rows = 3, maxLength, className = ""}: ForgeInputProps) => {
    return (
        <div className={clsx(className)}>


        <label htmlFor={name} className="block font-semibold mb-1">
                {label}
            </label>

            {textarea ? (
                <>
                    <textarea
                        id={name}
                        name={name}
                        placeholder={placeholder}
                        className="textarea textarea-bordered w-full resize-none focus:border-secondary focus:outline-none"
                        rows={rows}
                        maxLength={maxLength}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        />
                        {maxLength && (
                            <div className="text-right text-xs text-neutral/60 mt-1">
                                {value.length}/{maxLength}
                            </div>
                        )}
                </>
            ) : (
                <input
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    className={` input input-bordered  focus:border-secondary focus:outline-none w-full`}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
            )}
        </div>
    );
};

export default ForgeInput;
