import { Button } from "../components/ui/button";
import { type Payment } from "../components/Home/colums";
import { columns } from "../components/Home/colums";
import { DataTable } from "../components/Home/Data-table";
function getData(): Payment[] {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      contact: "0552705879",
      name: "ahmed",
      date: "12/12/2022",
    },
    {
      id: "728ed523",
      contact: "0552705879",
      name: "mohamed",
      date: "12/12/2024",
    },
    {
      id: "728ed524",
      contact: "0552705879",
      name: "omar",
      date: "12/12/2022",
    },
    {
      id: "728ed526",
      contact: "0552705879",
      name: "farouk",
      date: "12/12/2022",
    },
    {
      id: "728ed525",
      contact: "0552705879",
      name: "salim",
      date: "12/12/2022",
    },
    {
      id: "728ed527",
      contact: "0552705879",
      name: "fateh",
      date: "12/12/2022",
    },
  ];
}

export function Home() {
  const data = getData();

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your patients!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="rounded-full"
              size="lg"
            ></Button>
          </div>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
}

export default Home;
