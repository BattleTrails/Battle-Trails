

const AuthButton = ({ text }: { text: string }) => {
return (
    <button
    type="submit"
    className=" btn w-[300px] h-[48px] bg-[#2f3d4c] border-0  mt-3 text-white font-medium rounded-field shadow-sm hover:bg-[#405164] transition-colors duration-300"
>
    {text}
</button>);
};

export default AuthButton;