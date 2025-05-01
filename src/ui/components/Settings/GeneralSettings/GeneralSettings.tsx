import SettingsForm from "./Form";
import ThemeSelector from "./ThemeSelector";
function GeneralSettings() {
  return (
    <div className="space-y-6 m-8 p-6 bg-background text-foreground border border-border rounded-lg shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your name and the app’s appearance.
        </p>
      </div>
      <SettingsForm />
      <ThemeSelector />
    </div>
  );
}

export default GeneralSettings;
