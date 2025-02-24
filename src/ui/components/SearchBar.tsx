"use client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import { useRef } from "react";

function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setValue(e.target.value);
  // };
  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setSearch(value);
  //   inputRef.current?.blur();
  // };
  // const clear = () => {
  //   setValue("");
  //   setSearch("");
  //   inputRef.current?.blur();
  // };
  return (
    <div className="flex-1 flex items-center justify-center">
      <form
        action=""
        className=" relative max-w-[700px] w-full"
        // onSubmit={handleSubmit}
      >
        <Input
          ref={inputRef}
          // value={value}
          // onChange={handleChange}
          autoComplete="off"
          spellCheck="false"
          placeholder="Search for Patients"
          className="md:text-base w-full p-2 border border-gray-300 rounded-3xl placeholder:text-neutral-600 px-14 border-none focus-visible:shadow-[0_1px_1px_0_rgba(65,69,73,.3),0_1px_3px_1px_rgba(65,69,73,.15)] 
          bg-[#F0F4F8] h-[48px] focus-visible:ring-0 focus:bg-white"
        />
        <Button
          variant={"ghost"}
          type="submit"
          size="icon"
          className="absolute left-3 top-1/2 -translate-y-1/2 
          [&_svg]:size-5 rounded-full"
        >
          <SearchIcon />
        </Button>
        {/* {value && (
          <Button
            onClick={clear}
            variant={"ghost"}
            type="button"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 
          [&_svg]:size-5 rounded-full"
          >
            <XIcon />
          </Button>
        )} */}
      </form>
    </div>
  );
}

export default SearchInput;
