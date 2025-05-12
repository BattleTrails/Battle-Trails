import SearchBox from "@components/ui/search-box/search-box";

const SearchBarWrapper = ({ setSearchOpen }: { setSearchOpen: (value: boolean) => void }) => {
    return (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md flex justify-center">
            <SearchBox onFocusChange={setSearchOpen} />
        </div>
    );
};

export default SearchBarWrapper;
