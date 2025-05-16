import logo from "@assets/btlogo_single.svg"

const Footer = () => {
return(
    <footer className=" sm:footer-horizontal bg-neutral text-neutral-content items-center p-4">
        <div className="flex flex-row  items-center justify-between">
            <img src={logo} alt=""/>
            <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
        </div>
    </footer>

);
};

export default Footer;