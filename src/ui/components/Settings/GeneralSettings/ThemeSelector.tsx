import { useTheme } from "../../theme-provider";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-xl space-y-8 rounded-lg bg-background p-8">
      <div className="space-y-4 text-left">
        <h2 className="text-lg font-medium">Thème</h2>
        <p className="text-sm text-muted-foreground">
          Sélectionnez le thème pour l'application.{" "}
        </p>
      </div>

      <RadioGroup
        defaultValue={theme}
        onValueChange={(value) => setTheme(value as "light" | "dark")}
        className="grid max-w-md grid-cols-2 gap-8 pt-2"
      >
        {/* Light */}
        <label className="[&:has([data-state=checked])>div]:border-primary cursor-pointer space-y-1">
          <RadioGroupItem value="light" className="sr-only" />
          <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
              <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
            </div>
          </div>
          <span className="block w-full p-2 text-center font-normal">
            Clair
          </span>
        </label>

        {/* Dark */}
        <label className="[&:has([data-state=checked])>div]:border-primary cursor-pointer space-y-1">
          <RadioGroupItem value="dark" className="sr-only" />
          <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
              <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-slate-400" />
                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
              </div>
            </div>
          </div>
          <span className="block w-full p-2 text-center font-normal">
            Sombre
          </span>
        </label>
      </RadioGroup>
    </div>
  );
}

export default ThemeSelector;
