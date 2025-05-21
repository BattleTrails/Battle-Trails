const Footer = () => {
  return (
    <footer className=" sm:footer-horizontal bg-accent text-neutral items-center p-3">
      <div className="flex flex-row  items-center justify-center ">
        <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
      </div>
    </footer>

  );
};

export default Footer;