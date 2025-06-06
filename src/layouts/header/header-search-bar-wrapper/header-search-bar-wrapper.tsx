import SearchBox from "@components/ui/search-box/search-box.tsx";

const HeaderSearchBarWrapper = ({setSearchOpen, currentPath}: {
  setSearchOpen: (value: boolean) => void;
  currentPath: string
}) => {

  const isHome = currentPath === "/";
  const isForge = currentPath.startsWith("/new");


  const headerClass = isHome
    ? ""
    : isForge ? "!pointer-events-none !hidden" : "bg-transparent text-white";

  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md flex justify-center ${headerClass}`}>
      <SearchBox onFocusChange={setSearchOpen}/>
    </div>
  );
};

export default HeaderSearchBarWrapper;
