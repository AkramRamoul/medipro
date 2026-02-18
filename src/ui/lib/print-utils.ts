/**
 * Utility to print HTML content in a browser-native way.
 * Creates a hidden iframe, injects the HTML, and triggers the print dialog.
 */
export const printHtml = (html: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
        try {
            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "0";
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow?.document || iframe.contentDocument;
            if (!doc) {
                resolve({ success: false, error: "Could not access iframe document" });
                return;
            }

            doc.open();
            doc.write(html);
            doc.close();

            // Wait for resources (images, fonts) to load
            iframe.onload = () => {
                setTimeout(() => {
                    try {
                        iframe.contentWindow?.focus();
                        iframe.contentWindow?.print();

                        // Clean up after a delay to ensure print dialog is shown
                        setTimeout(() => {
                            document.body.removeChild(iframe);
                            resolve({ success: true });
                        }, 1000);
                    } catch (e) {
                        console.error("Print error:", e);
                        resolve({ success: false, error: String(e) });
                    }
                }, 500);
            };
        } catch (e) {
            console.error("Iframe creation error:", e);
            resolve({ success: false, error: String(e) });
        }
    });
};
