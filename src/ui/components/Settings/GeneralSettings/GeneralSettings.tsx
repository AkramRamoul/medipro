import SettingsForm from "./Form";
import ThemeSelector from "./ThemeSelector";
function GeneralSettings() {
  return (
    <div className="space-y-6 m-8 p-6 bg-background text-foreground border border-border rounded-lg shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Paramètres généraux</h3>
        <p className="text-sm text-muted-foreground">
          Mettez à jour votre nom et l’apparence de l’application.
        </p>
      </div>
      <SettingsForm />
      <ThemeSelector />
    </div>
  );
}

export default GeneralSettings;
