import SettingsForm from "./Form";
function GeneralSettings() {
  return (
    <div className="space-y-6 m-8">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your name and the apps appearence
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}

export default GeneralSettings;
