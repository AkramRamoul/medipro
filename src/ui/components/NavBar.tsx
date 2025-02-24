import SearchInput from "./SearchBar";
function NavBar() {
  return (
    <nav className="flex items-center justify-between h-full w-full">
      <div className="flex gap-2 items-center shrink-0 mr-5 ">
        <a href="/">
          <img src="/icon.png" alt="logo" width={40} height={40} />
        </a>
        <h3 className="text-xl font-bold">DOCS</h3>
      </div>
      <SearchInput />
    </nav>
  );
}

export default NavBar;
