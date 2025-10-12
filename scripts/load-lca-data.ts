import Papa from "papaparse";
import fs from "fs";

async function loadLCAData() {
    const fileContent = fs.readFileSync("./data/lca_data.xlsx", "utf8");
    const parsed = Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
    });

    // Store in MongoDB or use as JSON file
    fs.writeFileSync("./data/lca_data.json", JSON.stringify(parsed.data));
}