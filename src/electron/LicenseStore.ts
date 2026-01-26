import Store from "electron-store";

type LicensePayload = {
    key: string;
    payload: object;
};

const store = new Store<{
    license?: LicensePayload;
}>();

export function saveLicense(key: string, payload: object): void {
    store.set("license", { key, payload });
}

export function getLicense(): LicensePayload | undefined {
    return store.get("license");
}

export function resetLicense(): void {
    store.delete("license");
}
